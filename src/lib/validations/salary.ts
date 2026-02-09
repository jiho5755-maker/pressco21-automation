// 최저임금 검증 유틸리티 — Phase 1-B: 수당 포함 검증

import { LABOR_STANDARDS_2026, TAX_FREE_LIMITS_2026 } from "@/lib/constants";

export interface MinimumWageValidation {
  isValid: boolean;
  message?: string;
  calculatedHourly?: number;
}

/**
 * 최저임금 검증 (모든 수당 포함, 고정OT 제외)
 *
 * ⚠️ 중요: 고정OT는 최저임금 계산에서 제외 (법정 기준)
 * 최저임금법 시행령 제5조: 연장·야간·휴일 근로 가산수당은 최저임금 산입 범위에서 제외
 *
 * 비과세 수당: 한도 초과분만 최저임금에 산입 (식대 20만, 교통비 20만)
 */
export function validateMinimumWage(
  baseSalary: number,
  mealAllowance: number = 0,
  transportAllowance: number = 0,
  positionAllowance: number = 0,
  taxFreeMeal: boolean = true,
  taxFreeTransport: boolean = true,
  salaryType: "MONTHLY" | "HOURLY" = "MONTHLY"
): MinimumWageValidation {
  const { hourly, monthly, standardMonthlyHours } = LABOR_STANDARDS_2026.minimumWage;

  // 비과세 한도 초과분만 최저임금에 산입 (hr-labor-expert 권장)
  const mealIncludable = taxFreeMeal
    ? Math.max(0, mealAllowance - TAX_FREE_LIMITS_2026.meal) // 20만원 초과분
    : mealAllowance; // 비과세 미적용 시 전액

  const transportIncludable = taxFreeTransport
    ? Math.max(0, transportAllowance - TAX_FREE_LIMITS_2026.transport)
    : transportAllowance;

  if (salaryType === "HOURLY") {
    const totalHourly =
      baseSalary +
      Math.round((mealIncludable + transportIncludable + positionAllowance) / standardMonthlyHours);

    if (totalHourly < hourly) {
      return {
        isValid: false,
        message: `총 시급(${totalHourly.toLocaleString()}원)이 2026년 최저시급(${hourly.toLocaleString()}원)보다 낮습니다.`,
        calculatedHourly: totalHourly,
      };
    }

    return { isValid: true, calculatedHourly: totalHourly };
  }

  // 월급제: 기본급 + 비과세 초과분 + 직책수당으로 환산 시급 계산
  const totalMonthly = baseSalary + mealIncludable + transportIncludable + positionAllowance;
  const calculatedHourly = Math.round(totalMonthly / standardMonthlyHours);

  if (calculatedHourly < hourly) {
    return {
      isValid: false,
      message: `총 급여(${totalMonthly.toLocaleString()}원) 환산 시급(${calculatedHourly.toLocaleString()}원)이 최저시급(${hourly.toLocaleString()}원)보다 낮습니다. 최소 총 급여: ${monthly.toLocaleString()}원`,
      calculatedHourly,
    };
  }

  return { isValid: true, calculatedHourly };
}
