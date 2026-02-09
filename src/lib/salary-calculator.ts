// 급여/보험료 계산 유틸리티 — 2026년 기준 순수 함수

import {
  LABOR_STANDARDS_2026,
  INSURANCE_RATES_2026,
} from "@/lib/constants";

const { minimumWage } = LABOR_STANDARDS_2026;
const { nationalPension, healthInsurance, longTermCare, employmentInsurance } =
  INSURANCE_RATES_2026;

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
  return Math.round(baseSalary / minimumWage.standardMonthlyHours);
}

/** 보험 가입 플래그 */
interface InsuranceFlags {
  nationalPension: boolean;
  healthInsurance: boolean;
  employmentInsurance: boolean;
  industrialAccident: boolean;
}

/** 보험료 상세 결과 */
export interface InsuranceBreakdown {
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  totalEmployee: number;
  // 사업주 부담분 (참고용)
  employer: {
    nationalPension: number;
    healthInsurance: number;
    longTermCare: number;
    employmentInsurance: number;
    industrialAccident: number;
    total: number;
  };
}

/**
 * 월 4대보험 공제액 계산
 *
 * 국민연금: 보수월액 × 4.75% (상한 637만, 하한 40만 적용)
 * 건강보험: 보수월액 × 3.595% (상한 1,270만 적용)
 * 장기요양보험: 건강보험료 × 13.14%
 * 고용보험: 보수월액 × 0.9%
 *
 * @param baseSalary 기본급(월)
 * @param flags 4대보험 가입 여부
 * @returns 공제액 상세
 */
export function calculateMonthlyInsurance(
  baseSalary: number,
  flags: InsuranceFlags
): InsuranceBreakdown {
  // 국민연금 보수월액 (상·하한 적용)
  const pensionBase = Math.max(
    nationalPension.lowerLimit,
    Math.min(baseSalary, nationalPension.upperLimit)
  );
  const empNationalPension = flags.nationalPension
    ? Math.round(pensionBase * nationalPension.employee)
    : 0;

  // 건강보험 보수월액 (상한 적용)
  const healthBase = Math.min(baseSalary, healthInsurance.upperLimit);
  const empHealthInsurance = flags.healthInsurance
    ? Math.round(healthBase * healthInsurance.employee)
    : 0;

  // 장기요양보험 (건강보험료 기반)
  const empLongTermCare = flags.healthInsurance
    ? Math.round(empHealthInsurance * longTermCare.rate)
    : 0;

  // 고용보험
  const empEmploymentInsurance = flags.employmentInsurance
    ? Math.round(baseSalary * employmentInsurance.employee)
    : 0;

  const totalEmployee =
    empNationalPension +
    empHealthInsurance +
    empLongTermCare +
    empEmploymentInsurance;

  // 사업주 부담분
  const errNationalPension = flags.nationalPension
    ? Math.round(pensionBase * nationalPension.employer)
    : 0;
  const errHealthInsurance = flags.healthInsurance
    ? Math.round(healthBase * healthInsurance.employer)
    : 0;
  const errLongTermCare = flags.healthInsurance
    ? Math.round(errHealthInsurance * longTermCare.rate)
    : 0;
  const errEmploymentInsurance = flags.employmentInsurance
    ? Math.round(baseSalary * employmentInsurance.employer)
    : 0;
  // 산재보험: 업종별 요율 다양 → 유통업 기준 0.7% 근사치 적용
  const errIndustrialAccident = flags.industrialAccident
    ? Math.round(baseSalary * 0.007)
    : 0;

  return {
    nationalPension: empNationalPension,
    healthInsurance: empHealthInsurance,
    longTermCare: empLongTermCare,
    employmentInsurance: empEmploymentInsurance,
    totalEmployee,
    employer: {
      nationalPension: errNationalPension,
      healthInsurance: errHealthInsurance,
      longTermCare: errLongTermCare,
      employmentInsurance: errEmploymentInsurance,
      industrialAccident: errIndustrialAccident,
      total:
        errNationalPension +
        errHealthInsurance +
        errLongTermCare +
        errEmploymentInsurance +
        errIndustrialAccident,
    },
  };
}

/**
 * 금액 포매팅 (원 단위)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR").format(amount) + "원";
}
