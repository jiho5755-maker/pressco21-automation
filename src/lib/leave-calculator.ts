// 연차 계산 유틸리티 — 근로기준법 기반 순수 함수
// 입사일 기준 연차 산정 (회계연도 기준 아님)

import { MATERNITY_PARENTAL_2026 } from "@/lib/constants";

const { annualLeave } = MATERNITY_PARENTAL_2026;

/**
 * 총 연차일수 계산 (근로기준법 제60조)
 *
 * - 입사 1년 미만: 1개월 개근 시 1일 (최대 11일)
 * - 입사 1년 이상: 15일
 * - 3년 이상 근속: 2년마다 +1일 (최대 25일)
 *
 * @param joinDate 입사일
 * @param referenceDate 기준일 (보통 오늘)
 * @returns 총 연차일수
 */
export function calculateTotalAnnualLeave(
  joinDate: Date,
  referenceDate: Date = new Date()
): number {
  const join = new Date(joinDate);
  const ref = new Date(referenceDate);

  // 근속 개월 수 계산
  const diffMs = ref.getTime() - join.getTime();
  if (diffMs < 0) return 0;

  const totalMonths =
    (ref.getFullYear() - join.getFullYear()) * 12 +
    (ref.getMonth() - join.getMonth());

  // 1년 미만: 1개월 개근 시 1일씩 (최대 11일)
  if (totalMonths < 12) {
    return Math.min(totalMonths, 11) * annualLeave.underOneYear;
  }

  // 1년 이상: 기본 15일
  const yearsWorked = Math.floor(totalMonths / 12);
  const base = annualLeave.baseAfterOneYear;

  // 3년 이상: 2년마다 +1일
  const additionalYears = Math.max(0, yearsWorked - 1);
  const additional =
    Math.floor(additionalYears / 2) * annualLeave.additionalPerTwoYears;

  return Math.min(base + additional, annualLeave.maxDays);
}

/**
 * 해당 연도의 사용 연차일수 합산
 *
 * @param leaveRecords 휴가 기록 배열
 * @param year 조회 연도
 * @returns 사용 연차일수
 */
export function calculateUsedAnnualLeave(
  leaveRecords: { type: string; days: number; status: string; startDate: Date }[],
  year: number
): number {
  return leaveRecords
    .filter(
      (record) =>
        record.type === "ANNUAL" &&
        (record.status === "APPROVED" || record.status === "PENDING") &&
        new Date(record.startDate).getFullYear() === year
    )
    .reduce((sum, record) => sum + record.days, 0);
}

/**
 * 연차 현황 요약 반환
 */
export function getAnnualLeaveSummary(
  joinDate: Date,
  leaveRecords: { type: string; days: number; status: string; startDate: Date }[],
  referenceDate: Date = new Date()
) {
  const year = referenceDate.getFullYear();
  const total = calculateTotalAnnualLeave(joinDate, referenceDate);
  const used = calculateUsedAnnualLeave(leaveRecords, year);
  const remaining = Math.max(0, total - used);

  return { total, used, remaining, year };
}
