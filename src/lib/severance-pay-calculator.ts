/**
 * 퇴직금 계산 유틸리티
 *
 * 법적 근거:
 * - 근로기준법 제34조: 계속근로기간 1년 이상 시 퇴직금 지급 의무
 * - 퇴직급여 보장법 제8조: 퇴직금 = (평균임금 × 30일) × (근속년수 / 365)
 */

import { differenceInDays } from "date-fns";
import type { Employee, PayrollRecord } from "@prisma/client";

/**
 * 퇴직금 계산 결과
 */
export interface SeverancePayResult {
  averageWage: number;           // 평균임금 (일액)
  ordinaryWage: number;          // 통상임금 (일액)
  applicableWage: number;        // 적용 임금 (둘 중 큰 값)
  continuousServiceDays: number; // 계속근로일수
  continuousServiceYears: number; // 계속근로년수 (소수점)
  severancePay: number;          // 퇴직금
  isEligible: boolean;           // 지급 대상 여부 (1년 이상)
  calculationMethod: "AVERAGE_WAGE" | "ORDINARY_WAGE"; // 적용 방식
}

/**
 * 평균임금 계산 (최근 3개월 급여 평균)
 *
 * @param recentPayrolls 최근 3개월 급여 기록
 * @returns 평균임금 (일액)
 */
export function calculateAverageWage(
  recentPayrolls: Pick<PayrollRecord, "totalGross" | "year" | "month">[]
): number {
  if (recentPayrolls.length === 0) {
    return 0;
  }

  // 총 급여액 합계
  const totalWages = recentPayrolls.reduce(
    (sum, r) => sum + r.totalGross,
    0
  );

  // 총 일수 계산 (각 월의 달력일 기준)
  const totalDays = recentPayrolls.reduce((sum, r) => {
    const daysInMonth = new Date(r.year, r.month, 0).getDate();
    return sum + daysInMonth;
  }, 0);

  // 평균임금 (일액)
  return totalDays > 0 ? Math.floor(totalWages / totalDays) : 0;
}

/**
 * 통상임금 계산 (고정적·정기적 임금)
 *
 * 통상임금 = (기본급 + 고정 수당) × 12 / 365
 *
 * ⚠️ 변동 수당(연장근로, 휴일근로 등)은 제외
 *
 * @param employee 직원 정보
 * @returns 통상임금 (일액)
 */
export function calculateOrdinaryWage(
  employee: Pick<
    Employee,
    "baseSalary" | "mealAllowance" | "transportAllowance" | "positionAllowance"
  >
): number {
  // 월 통상임금 (고정적·정기적 임금만)
  const monthlyOrdinaryWage =
    employee.baseSalary +
    employee.mealAllowance +
    employee.transportAllowance +
    employee.positionAllowance;

  // 연간 통상임금 → 일 통상임금
  const yearlyOrdinaryWage = monthlyOrdinaryWage * 12;
  const dailyOrdinaryWage = yearlyOrdinaryWage / 365;

  return Math.floor(dailyOrdinaryWage);
}

/**
 * 계속근로기간 계산 (입사일 ~ 퇴직일)
 *
 * ⚠️ 휴직 기간도 계속근로기간에 포함 (근로기준법 제2조)
 *
 * @param hireDate 입사일
 * @param retirementDate 퇴직일 (기본값: 오늘)
 * @returns 계속근로일수
 */
export function calculateContinuousServiceDays(
  hireDate: Date,
  retirementDate: Date = new Date()
): number {
  return differenceInDays(retirementDate, hireDate) + 1; // 입사일 포함
}

/**
 * 퇴직금 추계액 계산
 *
 * 퇴직금 = max(평균임금, 통상임금) × 30 × (근속일수 / 365)
 *
 * @param employee 직원 정보
 * @param recentPayrolls 최근 3개월 급여 기록
 * @param retirementDate 퇴직 예정일 (기본값: 오늘)
 * @returns 퇴직금 추계 결과
 */
export function calculateSeverancePay(
  employee: Pick<
    Employee,
    | "joinDate"
    | "baseSalary"
    | "mealAllowance"
    | "transportAllowance"
    | "positionAllowance"
  >,
  recentPayrolls: Pick<PayrollRecord, "totalGross" | "year" | "month">[],
  retirementDate: Date = new Date()
): SeverancePayResult {
  // 1. 계속근로기간 계산
  const continuousServiceDays = calculateContinuousServiceDays(
    new Date(employee.joinDate),
    retirementDate
  );
  const continuousServiceYears = continuousServiceDays / 365;

  // 2. 1년 미만 검증
  if (continuousServiceDays < 365) {
    return {
      averageWage: 0,
      ordinaryWage: 0,
      applicableWage: 0,
      continuousServiceDays,
      continuousServiceYears: parseFloat(continuousServiceYears.toFixed(2)),
      severancePay: 0,
      isEligible: false,
      calculationMethod: "AVERAGE_WAGE",
    };
  }

  // 3. 평균임금 vs 통상임금
  const averageWage = calculateAverageWage(recentPayrolls);
  const ordinaryWage = calculateOrdinaryWage(employee);
  const applicableWage = Math.max(averageWage, ordinaryWage);
  const calculationMethod =
    averageWage >= ordinaryWage ? "AVERAGE_WAGE" : "ORDINARY_WAGE";

  // 4. 퇴직금 계산
  const severancePay = Math.floor(
    applicableWage * 30 * (continuousServiceDays / 365)
  );

  return {
    averageWage,
    ordinaryWage,
    applicableWage,
    continuousServiceDays,
    continuousServiceYears: parseFloat(continuousServiceYears.toFixed(2)),
    severancePay,
    isEligible: true,
    calculationMethod,
  };
}

/**
 * 퇴직금 포맷팅 (천 단위 콤마)
 */
export function formatSeverancePay(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}
