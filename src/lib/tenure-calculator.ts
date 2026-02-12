// 근속 기간 계산 유틸리티 (Phase 3-F)
import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
} from "date-fns";

/**
 * 근속 기간 계산 결과
 */
export interface TenureResult {
  years: number; // 연
  months: number; // 월
  days: number; // 일
  totalDays: number; // 총 일수
  formatted: string; // 포맷팅된 문자열 (예: "3년 2개월 15일")
}

/**
 * 근속 기간 계산 (연, 월, 일 분리)
 *
 * @param joinDate 입사일
 * @param endDate 종료일 (기본값: 현재 날짜)
 * @returns TenureResult
 *
 * @example
 * calculateTenure(new Date("2023-01-15"), new Date("2026-03-30"))
 * // { years: 3, months: 2, days: 15, totalDays: 1170, formatted: "3년 2개월 15일" }
 */
export function calculateTenure(
  joinDate: Date,
  endDate: Date = new Date()
): TenureResult {
  const start = new Date(joinDate);
  const end = new Date(endDate);

  // 입사일이 종료일보다 미래인 경우
  if (start > end) {
    return { years: 0, months: 0, days: 0, totalDays: 0, formatted: "0일" };
  }

  // 1. 연 차이 계산
  const years = differenceInYears(end, start);
  const afterYears = new Date(start);
  afterYears.setFullYear(afterYears.getFullYear() + years);

  // 2. 월 차이 계산
  const months = differenceInMonths(end, afterYears);
  const afterMonths = new Date(afterYears);
  afterMonths.setMonth(afterMonths.getMonth() + months);

  // 3. 일 차이 계산
  const days = differenceInDays(end, afterMonths);

  // 4. 총 일수 계산 (+1: 입사일 포함)
  const totalDays = differenceInDays(end, start) + 1;

  // 5. 포맷팅 (0인 단위 생략)
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}년`);
  if (months > 0) parts.push(`${months}개월`);
  if (days > 0 || parts.length === 0) parts.push(`${days}일`);

  return {
    years,
    months,
    days,
    totalDays,
    formatted: parts.join(" "),
  };
}
