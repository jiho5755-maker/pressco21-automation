/**
 * 원천징수 세액 집계 유틸리티
 *
 * 법적 근거:
 * - 소득세법 제127조, 제128조: 원천징수 의무
 * - 지방세법 제103조의3: 지방소득세 특별징수 (소득세의 10%)
 */

import type { PayrollRecord } from "@prisma/client";

/**
 * 월별 원천징수 세액 집계 결과
 */
export interface MonthlyWithholdingSummary {
  month: string;                 // 연월 (YYYY-MM)
  employeeCount: number;         // 인원 수
  totalGross: number;            // 총 급여액
  totalTaxableAmount: number;    // 과세 대상 금액
  totalNonTaxable: number;       // 비과세 금액
  incomeTax: number;             // 소득세
  localIncomeTax: number;        // 지방소득세
  totalTax: number;              // 원천징수 세액 합계
}

/**
 * 연간 원천징수 세액 합계
 */
export interface YearlyWithholdingTotal {
  totalGross: number;
  totalTaxableAmount: number;
  totalNonTaxable: number;
  incomeTax: number;
  localIncomeTax: number;
  totalTax: number;
}

/**
 * 원천징수 세액 월별 집계
 *
 * @param records 급여 기록 배열
 * @returns 월별 집계 배열 (연월 오름차순)
 */
export function aggregateWithholdingTax(
  records: Pick<
    PayrollRecord,
    | "year"
    | "month"
    | "totalGross"
    | "totalTaxable"
    | "incomeTax"
    | "localIncomeTax"
  >[]
): MonthlyWithholdingSummary[] {
  // 월별 그룹핑
  const byMonth = records.reduce(
    (acc, record) => {
      const key = `${record.year}-${record.month.toString().padStart(2, "0")}`;
      if (!acc[key]) acc[key] = [];
      acc[key].push(record);
      return acc;
    },
    {} as Record<
      string,
      Pick<
        PayrollRecord,
        | "year"
        | "month"
        | "totalGross"
        | "totalTaxable"
        | "incomeTax"
        | "localIncomeTax"
      >[]
    >
  );

  // 집계
  return Object.entries(byMonth)
    .map(([month, recs]) => {
      const totalGross = recs.reduce((sum, r) => sum + r.totalGross, 0);
      const totalTaxableAmount = recs.reduce(
        (sum, r) => sum + r.totalTaxable,
        0
      );
      const incomeTax = recs.reduce((sum, r) => sum + r.incomeTax, 0);
      const localIncomeTax = recs.reduce(
        (sum, r) => sum + r.localIncomeTax,
        0
      );

      return {
        month,
        employeeCount: recs.length,
        totalGross,
        totalTaxableAmount,
        totalNonTaxable: totalGross - totalTaxableAmount,
        incomeTax,
        localIncomeTax,
        totalTax: incomeTax + localIncomeTax,
      };
    })
    .sort((a, b) => a.month.localeCompare(b.month)); // 연월 오름차순
}

/**
 * 연간 원천징수 세액 합계
 *
 * @param summary 월별 집계 배열
 * @returns 연간 합계
 */
export function calculateYearlyTotal(
  summary: MonthlyWithholdingSummary[]
): YearlyWithholdingTotal {
  return {
    totalGross: summary.reduce((sum, s) => sum + s.totalGross, 0),
    totalTaxableAmount: summary.reduce((sum, s) => sum + s.totalTaxableAmount, 0),
    totalNonTaxable: summary.reduce((sum, s) => sum + s.totalNonTaxable, 0),
    incomeTax: summary.reduce((sum, s) => sum + s.incomeTax, 0),
    localIncomeTax: summary.reduce((sum, s) => sum + s.localIncomeTax, 0),
    totalTax: summary.reduce((sum, s) => sum + s.totalTax, 0),
  };
}
