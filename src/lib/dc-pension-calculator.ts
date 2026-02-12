/**
 * DC형(확정기여형) 퇴직연금 계산 유틸리티
 *
 * 법적 근거:
 * - 근로자퇴직급여 보장법 제20조: 연간 임금총액의 1/12 이상 부담금 납입
 * - 근로자퇴직급여 보장법 시행령 제3조: 부담금의 최소 기준
 * - 소득세법 제20조의3: 연 1,800만원까지 손비 인정
 *
 * 신한은행 DC형 퇴직연금 기준
 */

import type { Employee, PayrollRecord } from "@prisma/client";

/**
 * DC형 월 부담금 계산 결과
 */
export interface DCContributionResult {
  monthlyBaseSalary: number; // 기준소득월액 (최근 3개월 평균)
  minimumContribution: number; // 법정 최소 부담금 (기준소득의 1/12)
  recommendedContribution: number; // 권장 부담금 (현재는 법정 최소와 동일)
  annualProjection: number; // 연간 예상 부담금 (월 × 12)
  taxDeductibleLimit: number; // 세법상 손비 인정 한도 (1,800만원)
  isWithinTaxLimit: boolean; // 손비 한도 내 여부
  contributionRate: string; // 부담률 (8.33%)
}

/**
 * 기준소득월액 계산 (최근 3개월 급여 평균)
 *
 * ⚠️ DB형의 "평균임금" 개념과 유사하지만 DC형에서는 "기준소득월액" 용어 사용
 *
 * 포함 항목:
 * - 기본급
 * - 정기 수당 (식대, 교통비, 직책수당 등) - 비과세 한도와 무관하게 전액 포함
 * - 고정OT (정기·일률적 지급 시)
 *
 * 제외 항목:
 * - 변동 수당 (연장/야간/휴일 근로 수당)
 * - 일시적 상여금
 *
 * @param recentPayrolls 최근 3개월 급여 기록
 * @returns 기준소득월액 (원 미만 절사)
 */
export function calculateBaseSalary(
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

  // 월 평균 (기준소득월액)
  const avgMonthly = totalWages / recentPayrolls.length;

  return Math.floor(avgMonthly);
}

/**
 * DC형 월 부담금 계산
 *
 * 법정 최소 부담금 = 기준소득월액 / 12
 *
 * ⚠️ 퇴직급여법상 "연간 임금총액의 1/12"이 법정 최소 기준
 *    → 실무에서는 월 평균 급여의 1/12로 계산 (8.33%)
 *
 * @param employee 직원 정보 (가입일 확인용)
 * @param recentPayrolls 최근 3개월 급여 기록
 * @returns DC형 부담금 계산 결과
 */
export function calculateDCContribution(
  employee: Pick<Employee, "joinDate">,
  recentPayrolls: Pick<PayrollRecord, "totalGross" | "year" | "month">[]
): DCContributionResult {
  // 1. 기준소득월액 계산 (최근 3개월 평균)
  const monthlyBaseSalary = calculateBaseSalary(recentPayrolls);

  // 2. 법정 최소 부담금 (기준소득의 1/12)
  const minimumContribution = Math.floor(monthlyBaseSalary / 12);

  // 3. 권장 부담금 (현재는 법정 최소와 동일, 향후 회사 정책에 따라 조정 가능)
  const recommendedContribution = minimumContribution;

  // 4. 연간 예상 부담금
  const annualProjection = recommendedContribution * 12;

  // 5. 세법상 손비 인정 한도 (1,800만원)
  const taxDeductibleLimit = 18000000;
  const isWithinTaxLimit = annualProjection <= taxDeductibleLimit;

  // 6. 부담률 (1/12 = 8.33%)
  const contributionRate = "8.33%";

  return {
    monthlyBaseSalary,
    minimumContribution,
    recommendedContribution,
    annualProjection,
    taxDeductibleLimit,
    isWithinTaxLimit,
    contributionRate,
  };
}

/**
 * 전체 재직자 연간 DC형 부담금 총액 계산
 *
 * @param contributions 직원별 DC형 계산 결과 배열
 * @returns 연간 부담금 총액
 */
export function calculateAnnualDCTotal(
  contributions: DCContributionResult[]
): number {
  return contributions.reduce((sum, c) => sum + c.annualProjection, 0);
}

/**
 * 전체 재직자 월 부담금 총액 계산
 *
 * @param contributions 직원별 DC형 계산 결과 배열
 * @returns 월 부담금 총액
 */
export function calculateMonthlyDCTotal(
  contributions: DCContributionResult[]
): number {
  return contributions.reduce((sum, c) => sum + c.recommendedContribution, 0);
}

/**
 * DC형 부담금 포맷팅 (천 단위 콤마)
 */
export function formatDCContribution(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}
