// 소득세 계산 테스트 스크립트
// calculateIncomeTax 함수 검증 (2024년 간이세액표)

import { calculateIncomeTax } from "../src/lib/salary-calculator";

interface TestCase {
  name: string;
  totalTaxable: number; // 과세 대상 급여
  dependents: number; // 부양가족 수
  childrenUnder20: number; // 자녀 수
  expectedIncomeTax: number; // 예상 소득세 (범위 허용)
  expectedLocalIncomeTax: number; // 예상 지방소득세
}

const testCases: TestCase[] = [
  {
    name: "최저임금 (2,156,880원, 부양가족 1명, 자녀 0명)",
    totalTaxable: 2156880,
    dependents: 1,
    childrenUnder20: 0,
    expectedIncomeTax: 24340, // 간이세액표 2,157천원 → 2,150~2,160 구간
    expectedLocalIncomeTax: 2430,
  },
  {
    name: "최저임금 (2,156,880원, 부양가족 3명, 자녀 1명)",
    totalTaxable: 2156880,
    dependents: 3,
    childrenUnder20: 1,
    expectedIncomeTax: 0, // 9,570원 - 12,500원 = 0원 (자녀 세액공제 초과)
    expectedLocalIncomeTax: 0,
  },
  {
    name: "300만원 (부양가족 1명, 자녀 0명)",
    totalTaxable: 3000000,
    dependents: 1,
    childrenUnder20: 0,
    expectedIncomeTax: 74350, // 간이세액표 3,000천원 구간 (3,000~3,020)
    expectedLocalIncomeTax: 7430,
  },
  {
    name: "300만원 (부양가족 3명, 자녀 1명)",
    totalTaxable: 3000000,
    dependents: 3,
    childrenUnder20: 1,
    expectedIncomeTax: 19440, // 31,940원 - 12,500원 = 19,440원
    expectedLocalIncomeTax: 1940,
  },
  {
    name: "400만원 (부양가족 2명, 자녀 1명)",
    totalTaxable: 4000000,
    dependents: 2,
    childrenUnder20: 1,
    expectedIncomeTax: 155450, // 167,950원 - 12,500원 = 155,450원
    expectedLocalIncomeTax: 15540,
  },
  {
    name: "800만원 (부양가족 4명, 자녀 3명)",
    totalTaxable: 8000000,
    dependents: 4,
    childrenUnder20: 3,
    expectedIncomeTax: 684390, // 간이세액표 값 - 자녀 세액공제 (계산 필요)
    expectedLocalIncomeTax: 68430,
  },
];

console.log("🧪 소득세 계산 테스트 시작 (2024년 간이세액표)");
console.log("=".repeat(80));
console.log("");

let passCount = 0;
let failCount = 0;

for (const testCase of testCases) {
  const result = calculateIncomeTax(
    testCase.totalTaxable,
    testCase.dependents,
    testCase.childrenUnder20
  );

  const incomeTaxMatch = result.incomeTax === testCase.expectedIncomeTax;
  const localIncomeTaxMatch = result.localIncomeTax === testCase.expectedLocalIncomeTax;

  const passed = incomeTaxMatch && localIncomeTaxMatch;

  if (passed) {
    passCount++;
    console.log(`✅ PASS: ${testCase.name}`);
  } else {
    failCount++;
    console.log(`❌ FAIL: ${testCase.name}`);
    console.log(`   과세 대상: ${testCase.totalTaxable.toLocaleString()}원`);
    console.log(`   부양가족: ${testCase.dependents}명, 자녀: ${testCase.childrenUnder20}명`);
    console.log(`   소득세: ${result.incomeTax.toLocaleString()}원 (예상: ${testCase.expectedIncomeTax.toLocaleString()}원)`);
    console.log(`   지방소득세: ${result.localIncomeTax.toLocaleString()}원 (예상: ${testCase.expectedLocalIncomeTax.toLocaleString()}원)`);
  }

  console.log(`   - 소득세: ${result.incomeTax.toLocaleString()}원`);
  console.log(`   - 지방소득세: ${result.localIncomeTax.toLocaleString()}원`);
  console.log(`   - 합계: ${(result.incomeTax + result.localIncomeTax).toLocaleString()}원`);
  console.log("");
}

console.log("=".repeat(80));
console.log(`테스트 결과: ${passCount}개 통과, ${failCount}개 실패`);

if (failCount === 0) {
  console.log("✅ 모든 테스트 통과!");
} else {
  console.log("⚠️  일부 테스트 실패. 간이세액표 데이터를 확인하세요.");
}
