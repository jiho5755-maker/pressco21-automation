// 최저임금 검증 유틸리티 — Phase 1-B: 수당 포함 검증

import { LABOR_STANDARDS_2026 } from "@/lib/constants";

export interface MinimumWageValidation {
  isValid: boolean;
  message?: string;
  calculatedHourly?: number;
}

/**
 * 최저임금 검증 (모든 수당 포함)
 *
 * ⚠️ 중요: 고정OT는 최저임금 계산에서 제외 (법정 기준)
 * 최저임금법 시행령: 연장·야간·휴일 근로 가산수당은 최저임금 산입 범위에서 제외
 */
export function validateMinimumWage(
  baseSalary: number,
  mealAllowance: number = 0,
  transportAllowance: number = 0,
  positionAllowance: number = 0,
  salaryType: "MONTHLY" | "HOURLY" = "MONTHLY"
): MinimumWageValidation {
  const { hourly, monthly, standardMonthlyHours } = LABOR_STANDARDS_2026.minimumWage;

  if (salaryType === "HOURLY") {
    const totalHourly =
      baseSalary +
      Math.round((mealAllowance + transportAllowance + positionAllowance) / standardMonthlyHours);

    if (totalHourly < hourly) {
      return {
        isValid: false,
        message: `총 시급(${totalHourly.toLocaleString()}원)이 2026년 최저시급(${hourly.toLocaleString()}원)보다 낮습니다.`,
        calculatedHourly: totalHourly,
      };
    }

    return { isValid: true, calculatedHourly: totalHourly };
  }

  // 월급제: 모든 수당 포함하여 환산 시급 계산
  const totalMonthly = baseSalary + mealAllowance + transportAllowance + positionAllowance;
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
