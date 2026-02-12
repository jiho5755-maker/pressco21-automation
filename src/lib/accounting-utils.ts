/**
 * 회계/재무 공통 유틸리티
 */

/**
 * 통화 포맷 (천 단위 콤마)
 *
 * @param amount 금액
 * @returns 포맷된 문자열 (예: "1,234,567원")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

/**
 * 백분율 계산 (증감률)
 *
 * @param current 현재 값
 * @param previous 이전 값
 * @returns 증감률 (%)
 */
export function calculatePercentChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * 평균 계산
 *
 * @param values 숫자 배열
 * @returns 평균값
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return Math.floor(sum / values.length);
}

/**
 * 중위값 계산
 *
 * @param values 숫자 배열
 * @returns 중위값
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return Math.floor((sorted[mid - 1] + sorted[mid]) / 2);
  } else {
    return sorted[mid];
  }
}

/**
 * 최소값 계산
 *
 * @param values 숫자 배열
 * @returns 최소값
 */
export function calculateMin(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.min(...values);
}

/**
 * 최대값 계산
 *
 * @param values 숫자 배열
 * @returns 최대값
 */
export function calculateMax(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.max(...values);
}
