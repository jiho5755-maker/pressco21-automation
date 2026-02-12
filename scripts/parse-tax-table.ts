// 간이세액표 CSV 파싱 스크립트
// cleaned_withholding_tax_table_2024.csv → TypeScript 상수 변환

import * as fs from "fs";
import * as path from "path";

interface TaxTableRow {
  minSalary: number;
  maxSalary: number;
  taxByDependents: number[]; // dep_1 ~ dep_11 (부양가족 1~11명)
}

// CSV 파일 읽기
const csvPath = path.join(__dirname, "../cleaned_withholding_tax_table_2024.csv");
const csvContent = fs.readFileSync(csvPath, "utf-8");

// CSV 파싱
const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

const rows: TaxTableRow[] = [];

for (let i = 1; i < lines.length; i++) {
  const values = lines[i].split(",");

  // BOM 제거 (첫 줄)
  if (i === 1 && values[0].charCodeAt(0) === 0xfeff) {
    values[0] = values[0].substring(1);
  }

  const minSalary = parseInt(values[0], 10);
  const maxSalary = parseInt(values[1], 10);

  // 0,0 라인은 건너뛰기 (최고 구간 이후)
  if (minSalary === 0 && maxSalary === 0 && i > 2) {
    continue;
  }

  const taxByDependents = values.slice(2, 13).map((v) => parseInt(v, 10));

  rows.push({
    minSalary,
    maxSalary,
    taxByDependents,
  });
}

// TypeScript 상수 생성
const tsContent = `// 2024년 근로소득 간이세액표 (국세청)
// 출처: 국세청 홈택스 (https://www.hometax.go.kr)
// 파일: cleaned_withholding_tax_table_2024.csv
// 생성일: ${new Date().toISOString().split("T")[0]}

export interface TaxTableRow {
  minSalary: number; // 월 급여 최소 (천원)
  maxSalary: number; // 월 급여 최대 (천원)
  taxByDependents: number[]; // 부양가족 1~11명 세액 (원)
}

/**
 * 2024년 근로소득 간이세액표 (${rows.length}개 구간)
 *
 * 사용법:
 * 1. 월 급여액(비과세 제외)을 천원 단위로 변환
 * 2. 해당 구간 찾기 (minSalary <= 급여 < maxSalary)
 * 3. 부양가족 수로 세액 조회 (taxByDependents[dependents - 1])
 * 4. 자녀 세액공제 차감 (8세 이상 20세 이하)
 */
export const INCOME_TAX_TABLE_2024: TaxTableRow[] = ${JSON.stringify(rows, null, 2)};

/**
 * 자녀 세액공제 (8세 이상 20세 이하)
 *
 * 자녀 수  | 연간 공제  | 월 환산
 * ---------|-----------|--------
 * 1명      | 150,000원 | 12,500원
 * 2명      | 350,000원 | 29,160원
 * 3명      | 650,000원 | 54,160원
 * 4명 이상 | +300,000원/명 | +25,000원/명
 */
export const CHILD_TAX_CREDIT_2024 = [
  { children: 0, monthlyCredit: 0 },
  { children: 1, monthlyCredit: 12500 },   // 150,000 / 12
  { children: 2, monthlyCredit: 29160 },   // 350,000 / 12 (반올림)
  { children: 3, monthlyCredit: 54160 },   // 650,000 / 12 (반올림)
  // 4명 이상: 54,160 + (children - 3) × 25,000
];

/**
 * 부양가족 수 계산 안내
 *
 * 전체 공제대상 가족 수 = 기본공제대상자 수 (본인 포함)
 * - 본인
 * - 배우자 (연 소득 100만원 이하)
 * - 직계존속 (만 60세 이상, 연 소득 100만원 이하)
 * - 직계비속 (만 20세 이하, 연 소득 100만원 이하)
 * - 형제자매 (만 20세 이하 또는 만 60세 이상, 연 소득 100만원 이하)
 */
`;

// TypeScript 파일 저장
const outputPath = path.join(__dirname, "../src/lib/income-tax-table-2024.ts");
fs.writeFileSync(outputPath, tsContent, "utf-8");

console.log(`✅ 간이세액표 TypeScript 상수 생성 완료`);
console.log(`   파일: ${outputPath}`);
console.log(`   구간 수: ${rows.length}개`);
console.log(`   급여 범위: ${rows[0].minSalary}천원 ~ ${rows[rows.length - 1].maxSalary}천원`);
