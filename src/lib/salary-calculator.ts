// 급여/보험료 계산 유틸리티 — 2026년 기준 순수 함수
// Phase 1-B: 수당 분리 및 비과세 처리

import {
  LABOR_STANDARDS_2026,
  INSURANCE_RATES_2026,
  TAX_FREE_LIMITS_2026,
} from "@/lib/constants";
import {
  INCOME_TAX_TABLE_2024,
  CHILD_TAX_CREDIT_2024,
} from "@/lib/income-tax-table-2024";

/** 급여 구성 요소 */
export interface SalaryComponents {
  baseSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  taxFreeMeal: boolean;
  taxFreeTransport: boolean;
  // 고정OT (포괄임금제)
  useFixedOT?: boolean;
  fixedOTAmount?: number;
  fixedNightWorkAmount?: number;
  fixedHolidayWorkAmount?: number;
  // 변동 수당 (Phase 1-D 추가)
  variableOvertimeAmount?: number;
  variableNightWorkAmount?: number;
  variableHolidayWorkAmount?: number;
}

/** 종합 급여 계산 결과 */
export interface SalaryCalculationResult {
  // 급여 구성
  baseSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  totalGross: number; // 총 급여 (고정OT 포함)

  // 고정OT
  fixedOTAmount: number;
  fixedNightWorkAmount: number;
  fixedHolidayWorkAmount: number;
  totalFixedOT: number; // 고정OT 합계

  // 비과세 처리
  taxFreeMealAmount: number;
  taxFreeTransportAmount: number;
  totalTaxFree: number;
  totalTaxable: number; // 과세 대상 급여 (고정OT 포함)

  // 4대보험료 (근로자 부담분)
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  totalInsurance: number;

  // 소득세 (간이세액표 - 간단 버전)
  incomeTax: number;
  localIncomeTax: number;

  // 실수령액
  netSalary: number;
}

/**
 * 통상시급 계산
 * ⚠️ 중요: 고정OT는 제외 (가산수당 이중 계산 방지)
 * 연장/야간/휴일 수당 = 통상시급 × 가산율(1.5배)
 *
 * 월급제: baseSalary / 209시간
 * 시급제: baseSalary 그대로
 */
export function calculateHourlyRate(
  baseSalary: number,
  salaryType: string = "MONTHLY"
): number {
  if (salaryType === "HOURLY") return baseSalary;
  return Math.round(baseSalary / LABOR_STANDARDS_2026.minimumWage.standardMonthlyHours);
}

/**
 * 총 급여 계산 (Total Gross Salary)
 * 고정OT + 변동 수당 포함
 */
export function calculateTotalGross(components: SalaryComponents): number {
  const baseGross =
    components.baseSalary +
    components.mealAllowance +
    components.transportAllowance +
    components.positionAllowance;

  const fixedOT = components.useFixedOT
    ? (components.fixedOTAmount || 0) +
      (components.fixedNightWorkAmount || 0) +
      (components.fixedHolidayWorkAmount || 0)
    : 0;

  // 변동 수당 (Phase 1-D)
  const variableAllowances =
    (components.variableOvertimeAmount || 0) +
    (components.variableNightWorkAmount || 0) +
    (components.variableHolidayWorkAmount || 0);

  return baseGross + fixedOT + variableAllowances;
}

/**
 * 과세 대상 급여 계산 (Taxable Amount)
 */
export function calculateTaxableAmount(components: SalaryComponents): {
  totalGross: number;
  taxFreeMealAmount: number;
  taxFreeTransportAmount: number;
  totalTaxFree: number;
  totalTaxable: number;
} {
  const totalGross = calculateTotalGross(components);

  const taxFreeMealAmount = components.taxFreeMeal
    ? Math.min(components.mealAllowance, TAX_FREE_LIMITS_2026.meal)
    : 0;

  const taxFreeTransportAmount = components.taxFreeTransport
    ? Math.min(components.transportAllowance, TAX_FREE_LIMITS_2026.transport)
    : 0;

  const totalTaxFree = taxFreeMealAmount + taxFreeTransportAmount;
  const totalTaxable = totalGross - totalTaxFree;

  return {
    totalGross,
    taxFreeMealAmount,
    taxFreeTransportAmount,
    totalTaxFree,
    totalTaxable,
  };
}

/**
 * 4대보험료 계산 (월 기준, 근로자 부담분)
 */
export function calculateMonthlyInsurance(
  totalTaxable: number,
  options: {
    nationalPension: boolean;
    healthInsurance: boolean;
    employmentInsurance: boolean;
    dependents?: number;
  }
): {
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  totalInsurance: number;
} {
  const { nationalPension, healthInsurance, employmentInsurance } = options;
  const { rates, caps, floors } = INSURANCE_RATES_2026;

  let nationalPensionAmount = 0;
  if (nationalPension) {
    const cappedSalary = Math.max(
      Math.min(totalTaxable, caps.nationalPension),
      floors.nationalPension
    );
    // 원 단위 절사 (payroll-tax-expert 권장)
    nationalPensionAmount = Math.floor(cappedSalary * rates.nationalPension);
  }

  let healthInsuranceAmount = 0;
  let longTermCareAmount = 0;
  if (healthInsurance) {
    const cappedSalary = Math.min(totalTaxable, caps.healthInsurance);
    // 원 단위 절사 (payroll-tax-expert 권장)
    healthInsuranceAmount = Math.floor(cappedSalary * rates.healthInsurance);
    longTermCareAmount = Math.floor(healthInsuranceAmount * rates.longTermCare);
  }

  let employmentInsuranceAmount = 0;
  if (employmentInsurance) {
    // 원 단위 절사 (payroll-tax-expert 권장)
    employmentInsuranceAmount = Math.floor(totalTaxable * rates.employmentInsurance);
  }

  const totalInsurance =
    nationalPensionAmount +
    healthInsuranceAmount +
    longTermCareAmount +
    employmentInsuranceAmount;

  return {
    nationalPension: nationalPensionAmount,
    healthInsurance: healthInsuranceAmount,
    longTermCare: longTermCareAmount,
    employmentInsurance: employmentInsuranceAmount,
    totalInsurance,
  };
}

/**
 * 소득세 계산 (2024년 국세청 근로소득 간이세액표)
 *
 * @param totalTaxable 과세 대상 급여 (비과세 제외)
 * @param dependents 전체 공제대상 가족 수 (본인 포함, 1~11명)
 * @param childrenUnder20 8세 이상 20세 이하 자녀 수 (자녀 세액공제용)
 * @returns 소득세 및 지방소득세
 *
 * **법적 근거**:
 * - 소득세법시행령 별표 2 (근로소득 간이세액표)
 * - 소득세법 제59조의2 (자녀세액공제)
 *
 * **계산 순서**:
 * 1. 월 급여를 천원 단위로 변환 (예: 2,156,880원 → 2,157천원)
 * 2. 간이세액표에서 해당 구간 조회
 * 3. 부양가족 수로 세액 조회
 * 4. 자녀 세액공제 차감 (8세 이상 20세 이하)
 * 5. 10원 단위 절사 (원천징수 실무 관행)
 * 6. 지방소득세 = 소득세 × 10% (10원 단위 절사)
 */
export function calculateIncomeTax(
  totalTaxable: number,
  dependents: number = 1,
  childrenUnder20: number = 0
): { incomeTax: number; localIncomeTax: number } {
  // 1. 부양가족 수 유효성 검증 (1~11명)
  const validDependents = Math.max(1, Math.min(11, dependents));

  // 2. 월 급여를 천원 단위로 변환 (반올림)
  const salaryInThousands = Math.round(totalTaxable / 1000);

  // 3. 간이세액표에서 해당 구간 찾기
  const bracket = INCOME_TAX_TABLE_2024.find(
    (row) => row.minSalary <= salaryInThousands && salaryInThousands < row.maxSalary
  );

  // 구간을 찾지 못한 경우
  if (!bracket) {
    // 간이세액표 최소 구간(77만원) 미만이면 소득세 0원
    if (salaryInThousands < 770) {
      return { incomeTax: 0, localIncomeTax: 0 };
    }

    // 최고 구간 (1,000만원 초과)의 세액 사용
    const lastBracket = INCOME_TAX_TABLE_2024[INCOME_TAX_TABLE_2024.length - 1];
    const baseTax = lastBracket.taxByDependents[validDependents - 1];

    // 초과분에 대해 누진세율 적용 (간소화: 35%)
    const excessAmount = salaryInThousands - lastBracket.maxSalary;
    const excessTax = excessAmount * 1000 * 0.35;

    let incomeTax = baseTax + excessTax;

    // 자녀 세액공제 차감
    incomeTax = applyChildTaxCredit(incomeTax, childrenUnder20);

    // 10원 단위 절사
    incomeTax = Math.floor(incomeTax / 10) * 10;
    const localIncomeTax = Math.floor((incomeTax * 0.1) / 10) * 10;

    return { incomeTax, localIncomeTax };
  }

  // 4. 부양가족 수로 세액 조회
  let incomeTax = bracket.taxByDependents[validDependents - 1];

  // 5. 자녀 세액공제 차감
  incomeTax = applyChildTaxCredit(incomeTax, childrenUnder20);

  // 6. 10원 단위 절사 (payroll-tax-expert 권장)
  incomeTax = Math.floor(incomeTax / 10) * 10;
  const localIncomeTax = Math.floor((incomeTax * 0.1) / 10) * 10; // 지방소득세도 10원 단위 절사

  return {
    incomeTax,
    localIncomeTax,
  };
}

/**
 * 자녀 세액공제 적용 (내부 함수)
 *
 * @param incomeTax 원천징수 세액
 * @param childrenUnder20 8세 이상 20세 이하 자녀 수
 * @returns 자녀 세액공제 적용 후 소득세
 *
 * **공제액**:
 * - 1명: 12,500원/월 (연 15만원)
 * - 2명: 29,160원/월 (연 35만원)
 * - 3명: 54,160원/월 (연 65만원)
 * - 4명 이상: +25,000원/월 (연 +30만원)
 */
function applyChildTaxCredit(incomeTax: number, childrenUnder20: number): number {
  if (childrenUnder20 <= 0) return incomeTax;

  let childCredit = 0;

  if (childrenUnder20 <= 3) {
    const creditRow = CHILD_TAX_CREDIT_2024.find((row) => row.children === childrenUnder20);
    childCredit = creditRow ? creditRow.monthlyCredit : 0;
  } else {
    // 4명 이상: 3명 기본 + 추가 자녀 × 25,000원
    const base = CHILD_TAX_CREDIT_2024[3].monthlyCredit; // 54,160원
    const additionalChildren = childrenUnder20 - 3;
    childCredit = base + additionalChildren * 25000;
  }

  // 공제 후 세액은 0원 미만이 될 수 없음
  return Math.max(0, incomeTax - childCredit);
}

/**
 * 종합 급여 계산 (Total Salary Calculation)
 */
export function calculateSalary(
  components: SalaryComponents,
  insuranceOptions: {
    nationalPension: boolean;
    healthInsurance: boolean;
    employmentInsurance: boolean;
    dependents?: number;
    childrenUnder20?: number;
  }
): SalaryCalculationResult {
  const { totalGross, taxFreeMealAmount, taxFreeTransportAmount, totalTaxFree, totalTaxable } =
    calculateTaxableAmount(components);

  const insurance = calculateMonthlyInsurance(totalTaxable, insuranceOptions);

  const { incomeTax, localIncomeTax } = calculateIncomeTax(
    totalTaxable,
    insuranceOptions.dependents || 1,
    insuranceOptions.childrenUnder20 || 0
  );

  const netSalary = totalGross - insurance.totalInsurance - incomeTax - localIncomeTax;

  // 고정OT 합계
  const fixedOTAmount = components.fixedOTAmount || 0;
  const fixedNightWorkAmount = components.fixedNightWorkAmount || 0;
  const fixedHolidayWorkAmount = components.fixedHolidayWorkAmount || 0;
  const totalFixedOT = components.useFixedOT
    ? fixedOTAmount + fixedNightWorkAmount + fixedHolidayWorkAmount
    : 0;

  return {
    baseSalary: components.baseSalary,
    mealAllowance: components.mealAllowance,
    transportAllowance: components.transportAllowance,
    positionAllowance: components.positionAllowance,
    totalGross,

    fixedOTAmount,
    fixedNightWorkAmount,
    fixedHolidayWorkAmount,
    totalFixedOT,

    taxFreeMealAmount,
    taxFreeTransportAmount,
    totalTaxFree,
    totalTaxable,

    nationalPension: insurance.nationalPension,
    healthInsurance: insurance.healthInsurance,
    longTermCare: insurance.longTermCare,
    employmentInsurance: insurance.employmentInsurance,
    totalInsurance: insurance.totalInsurance,

    incomeTax,
    localIncomeTax,

    netSalary,
  };
}

/**
 * 금액 포매팅 (원 단위)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}
