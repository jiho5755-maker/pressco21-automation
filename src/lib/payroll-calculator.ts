// 급여 대장 계산 유틸리티 — 근태 기록 기반 변동 수당 계산
// Phase 1-D: PayrollRecord 생성 전용

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";
import { calculateHourlyRate, calculateSalary } from "@/lib/salary-calculator";
import { LABOR_STANDARDS_2026 } from "@/lib/constants";

/**
 * 월별 근태 기록 기반 변동 수당 계산
 *
 * @param employeeId 직원 ID
 * @param year 귀속 연도
 * @param month 귀속 월 (1~12)
 * @returns 변동 수당 계산 결과
 */
export async function calculateVariableAllowances(
  employeeId: string,
  year: number,
  month: number
) {
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  // 1. 확정된 근태 기록만 조회 (정부 지원금 증빙)
  const records = await prisma.attendanceRecord.findMany({
    where: {
      employeeId,
      date: { gte: monthStart, lte: monthEnd },
      isConfirmed: true, // 확정된 기록만
    },
    select: {
      overtime: true,
      nightWork: true,
      isHolidayWork: true,
      holidayWorkHours: true,
      holidayOvertimeHours: true,
      isSubstitutedHoliday: true,
    },
  });

  // 2. 월별 총 가산 시간 집계 (분 단위)
  const totalOvertimeMinutes = records.reduce((sum, r) => sum + r.overtime, 0);
  const totalNightWorkMinutes = records.reduce((sum, r) => sum + r.nightWork, 0);

  // 휴일근로 시간 집계 (시간 단위 → 분 단위 변환)
  const totalHolidayWorkMinutes = records.reduce((sum, r) => {
    if (!r.isHolidayWork) return sum;
    const regularHours = r.holidayWorkHours || 0;
    const overtimeHours = r.holidayOvertimeHours || 0;
    return sum + (regularHours + overtimeHours) * 60;
  }, 0);

  // 3. 직원 정보 조회 (통상시급 계산용)
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
    select: { baseSalary: true, salaryType: true, useFixedOT: true },
  });

  if (!employee) {
    throw new Error("직원을 찾을 수 없습니다.");
  }

  // 4. 통상시급 계산 (고정OT 제외)
  const hourlyRate = calculateHourlyRate(employee.baseSalary, employee.salaryType);

  // 5. 가산수당 계산 (통상시급 × 1.5 × 시간)
  const overtimeHours = totalOvertimeMinutes / 60;
  const nightWorkHours = totalNightWorkMinutes / 60;
  const holidayWorkHours = totalHolidayWorkMinutes / 60;

  // 고정OT 사용 중이면 변동 수당 0원
  const variableOvertimeAmount = employee.useFixedOT
    ? 0
    : Math.round(hourlyRate * 1.5 * overtimeHours);
  const variableNightWorkAmount = employee.useFixedOT
    ? 0
    : Math.round(hourlyRate * 1.5 * nightWorkHours);

  // 휴일근로 수당 계산 (휴일대체 여부에 따라 분기)
  const variableHolidayWorkAmount = employee.useFixedOT
    ? 0
    : calculateHolidayWorkPayForRecords(records, hourlyRate);

  return {
    variableOvertimeMinutes: totalOvertimeMinutes,
    variableNightWorkMinutes: totalNightWorkMinutes,
    variableHolidayMinutes: totalHolidayWorkMinutes,
    variableOvertimeAmount,
    variableNightWorkAmount,
    variableHolidayWorkAmount,
  };
}

/**
 * 휴일근로 수당 계산 (내부 함수)
 *
 * @param records 근태 기록 배열
 * @param hourlyRate 통상시급
 * @returns 휴일근로 수당 총액
 *
 * **계산 로직**:
 * - 휴일대체 적용 (isSubstitutedHoliday=true)
 *   - 8시간 이내: 통상임금 × 1.0
 *   - 8시간 초과: 통상임금 × 1.0 + 연장근로 × 1.5
 * - 휴일대체 미적용 (isSubstitutedHoliday=false)
 *   - 8시간 이내: 통상임금 × 1.5 (근로기준법 제56조)
 *   - 8시간 초과: 통상임금 × 1.5 + 연장근로 × 0.5 = × 2.0
 *
 * **법적 근거**:
 * - 근로기준법 제56조 (가산수당)
 * - 근로기준법 제57조 (휴일대체)
 * - 고용노동부 행정해석 근기 68207-2583 (2001.9.6)
 */
function calculateHolidayWorkPayForRecords(
  records: Array<{
    isHolidayWork: boolean;
    holidayWorkHours: number | null;
    holidayOvertimeHours: number | null;
    isSubstitutedHoliday: boolean;
  }>,
  hourlyRate: number
): number {
  let totalPay = 0;

  for (const record of records) {
    if (!record.isHolidayWork) continue;

    const regularHours = record.holidayWorkHours || 0;
    const overtimeHours = record.holidayOvertimeHours || 0;

    if (record.isSubstitutedHoliday) {
      // 휴일대체 적법 → 통상임금
      totalPay += hourlyRate * regularHours; // × 1.0
      totalPay += hourlyRate * 1.5 * overtimeHours; // 연장은 × 1.5
    } else {
      // 휴일대체 미적용 → 가산수당
      totalPay += hourlyRate * 1.5 * regularHours; // × 1.5
      totalPay += hourlyRate * 2.0 * overtimeHours; // × 2.0
    }
  }

  return Math.round(totalPay);
}

/**
 * 월별 급여 전체 계산 (근태 기반)
 *
 * @param employeeId 직원 ID
 * @param year 귀속 연도
 * @param month 귀속 월 (1~12)
 * @returns PayrollRecord 생성용 데이터
 */
export async function calculateMonthlyPayroll(
  employeeId: string,
  year: number,
  month: number
) {
  // 1. 직원 정보 조회
  const employee = await prisma.employee.findUnique({
    where: { id: employeeId },
  });

  if (!employee || employee.status !== "ACTIVE") {
    throw new Error("활성 직원이 아닙니다.");
  }

  // 2. 변동 수당 계산
  const variableAllowances = await calculateVariableAllowances(
    employeeId,
    year,
    month
  );

  // 3. 총 급여 계산 (기존 salary-calculator.ts 재사용)
  const salaryResult = calculateSalary(
    {
      baseSalary: employee.baseSalary,
      mealAllowance: employee.mealAllowance,
      transportAllowance: employee.transportAllowance,
      positionAllowance: employee.positionAllowance,
      taxFreeMeal: employee.taxFreeMeal,
      taxFreeTransport: employee.taxFreeTransport,
      useFixedOT: employee.useFixedOT,
      fixedOTAmount: employee.fixedOTAmount || 0,
      fixedNightWorkAmount: employee.fixedNightWorkAmount || 0,
      fixedHolidayWorkAmount: employee.fixedHolidayWorkAmount || 0,
      // 변동 수당 추가
      variableOvertimeAmount: variableAllowances.variableOvertimeAmount,
      variableNightWorkAmount: variableAllowances.variableNightWorkAmount,
      variableHolidayWorkAmount: variableAllowances.variableHolidayWorkAmount,
    },
    {
      nationalPension: employee.nationalPension,
      healthInsurance: employee.healthInsurance,
      employmentInsurance: employee.employmentInsurance,
      dependents: employee.dependents,
      childrenUnder20: employee.childrenUnder20,
    }
  );

  // 4. PayrollRecord 생성용 데이터 반환
  return {
    // 급여 구성 스냅샷
    baseSalary: employee.baseSalary,
    mealAllowance: employee.mealAllowance,
    transportAllowance: employee.transportAllowance,
    positionAllowance: employee.positionAllowance,
    taxFreeMeal: employee.taxFreeMeal,
    taxFreeTransport: employee.taxFreeTransport,

    // 고정OT 스냅샷
    useFixedOT: employee.useFixedOT,
    fixedOTAmount: employee.fixedOTAmount || 0,
    fixedNightWorkAmount: employee.fixedNightWorkAmount || 0,
    fixedHolidayWorkAmount: employee.fixedHolidayWorkAmount || 0,

    // 변동 수당
    ...variableAllowances,

    // 계산 결과
    totalGross: salaryResult.totalGross,
    totalTaxable: salaryResult.totalTaxable,
    totalInsurance: salaryResult.totalInsurance,
    incomeTax: salaryResult.incomeTax,
    localIncomeTax: salaryResult.localIncomeTax,
    netSalary: salaryResult.netSalary,

    // 4대보험 세부
    nationalPension: salaryResult.nationalPension,
    healthInsurance: salaryResult.healthInsurance,
    longTermCare: salaryResult.longTermCare,
    employmentInsurance: salaryResult.employmentInsurance,

    // 귀속 연월
    year,
    month,
  };
}
