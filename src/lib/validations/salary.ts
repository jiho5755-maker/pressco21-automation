import { LABOR_STANDARDS_2026 } from "@/lib/constants";

export function validateMinimumWage(
  baseSalary: number,
  salaryType: "MONTHLY" | "HOURLY"
): { isValid: boolean; message?: string } {
  const { hourly, monthly, standardMonthlyHours } =
    LABOR_STANDARDS_2026.minimumWage;

  if (salaryType === "HOURLY") {
    if (baseSalary < hourly) {
      return {
        isValid: false,
        message: `시급이 2026년 최저시급(${hourly.toLocaleString()}원)보다 낮습니다.`,
      };
    }
  } else {
    // 월급제: 209시간 기준 환산 시급 검증
    const calculatedHourly = Math.round(baseSalary / standardMonthlyHours);
    if (calculatedHourly < hourly) {
      return {
        isValid: false,
        message: `월급 환산 시급(${calculatedHourly.toLocaleString()}원)이 최저시급(${hourly.toLocaleString()}원)보다 낮습니다. 최소 월급: ${monthly.toLocaleString()}원`,
      };
    }
  }

  return { isValid: true };
}
