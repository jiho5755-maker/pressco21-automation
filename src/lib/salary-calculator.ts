// 급여/보험료 계산 유틸리티 — 2026년 기준 순수 함수
// Phase 1-B: 수당 분리 및 비과세 처리

import {
  LABOR_STANDARDS_2026,
  INSURANCE_RATES_2026,
  TAX_FREE_LIMITS_2026,
} from "@/lib/constants";

/** 급여 구성 요소 */
export interface SalaryComponents {
  baseSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  taxFreeMeal: boolean;
  taxFreeTransport: boolean;
}

/** 종합 급여 계산 결과 */
export interface SalaryCalculationResult {
  // 급여 구성
  baseSalary: number;
  mealAllowance: number;
  transportAllowance: number;
  positionAllowance: number;
  totalGross: number; // 총 급여

  // 비과세 처리
  taxFreeMealAmount: number;
  taxFreeTransportAmount: number;
  totalTaxFree: number;
  totalTaxable: number; // 과세 대상 급여

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
 */
export function calculateTotalGross(components: SalaryComponents): number {
  return (
    components.baseSalary +
    components.mealAllowance +
    components.transportAllowance +
    components.positionAllowance
  );
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
  const { nationalPension, healthInsurance, employmentInsurance, dependents = 1 } = options;
  const { rates, caps, floors } = INSURANCE_RATES_2026;

  let nationalPensionAmount = 0;
  if (nationalPension) {
    const cappedSalary = Math.max(
      Math.min(totalTaxable, caps.nationalPension),
      floors.nationalPension
    );
    nationalPensionAmount = Math.round(cappedSalary * rates.nationalPension);
  }

  let healthInsuranceAmount = 0;
  let longTermCareAmount = 0;
  if (healthInsurance) {
    const cappedSalary = Math.min(totalTaxable, caps.healthInsurance);
    healthInsuranceAmount = Math.round(cappedSalary * rates.healthInsurance);
    longTermCareAmount = Math.round(healthInsuranceAmount * rates.longTermCare);
  }

  let employmentInsuranceAmount = 0;
  if (employmentInsurance) {
    employmentInsuranceAmount = Math.round(totalTaxable * rates.employmentInsurance);
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
 * 소득세 계산 (간이세액표 - 간단 버전)
 * TODO: Phase 1-D에서 정확한 2026년 간이세액표로 교체
 */
export function calculateIncomeTax(
  totalTaxable: number,
  dependents: number = 1
): { incomeTax: number; localIncomeTax: number } {
  // 간단한 누진세율 (실제 간이세액표와 다를 수 있음)
  let incomeTax = 0;

  if (totalTaxable <= 1500000) {
    incomeTax = totalTaxable * 0.06;
  } else if (totalTaxable <= 4500000) {
    incomeTax = 90000 + (totalTaxable - 1500000) * 0.15;
  } else if (totalTaxable <= 8800000) {
    incomeTax = 540000 + (totalTaxable - 4500000) * 0.24;
  } else {
    incomeTax = 1572000 + (totalTaxable - 8800000) * 0.35;
  }

  // 부양가족 공제 (간소화: 1인당 15만원)
  const deduction = Math.max(0, (dependents - 1) * 150000);
  incomeTax = Math.max(0, incomeTax - deduction);

  const localIncomeTax = Math.round(incomeTax * 0.1); // 지방소득세 10%

  return {
    incomeTax: Math.round(incomeTax),
    localIncomeTax,
  };
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
    insuranceOptions.dependents || 1
  );

  const netSalary = totalGross - insurance.totalInsurance - incomeTax - localIncomeTax;

  return {
    baseSalary: components.baseSalary,
    mealAllowance: components.mealAllowance,
    transportAllowance: components.transportAllowance,
    positionAllowance: components.positionAllowance,
    totalGross,

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
