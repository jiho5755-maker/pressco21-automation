// 2024년 근로소득 간이세액표 (국세청)
// 출처: 국세청 홈택스 (https://www.hometax.go.kr)
// 파일: cleaned_withholding_tax_table_2024.csv
// 생성일: 2026-02-11

export interface TaxTableRow {
  minSalary: number; // 월 급여 최소 (천원)
  maxSalary: number; // 월 급여 최대 (천원)
  taxByDependents: number[]; // 부양가족 1~11명 세액 (원)
}

/**
 * 2024년 근로소득 간이세액표 (647개 구간)
 *
 * 사용법:
 * 1. 월 급여액(비과세 제외)을 천원 단위로 변환
 * 2. 해당 구간 찾기 (minSalary <= 급여 < maxSalary)
 * 3. 부양가족 수로 세액 조회 (taxByDependents[dependents - 1])
 * 4. 자녀 세액공제 차감 (8세 이상 20세 이하)
 */
export const INCOME_TAX_TABLE_2024: TaxTableRow[] = [
  {
    "minSalary": 0,
    "maxSalary": 0,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 770,
    "maxSalary": 775,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 775,
    "maxSalary": 780,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 780,
    "maxSalary": 785,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 785,
    "maxSalary": 790,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 790,
    "maxSalary": 795,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 795,
    "maxSalary": 800,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 800,
    "maxSalary": 805,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 805,
    "maxSalary": 810,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 810,
    "maxSalary": 815,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 815,
    "maxSalary": 820,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 820,
    "maxSalary": 825,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 825,
    "maxSalary": 830,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 830,
    "maxSalary": 835,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 835,
    "maxSalary": 840,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 840,
    "maxSalary": 845,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 845,
    "maxSalary": 850,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 850,
    "maxSalary": 855,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 855,
    "maxSalary": 860,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 860,
    "maxSalary": 865,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 865,
    "maxSalary": 870,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 870,
    "maxSalary": 875,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 875,
    "maxSalary": 880,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 880,
    "maxSalary": 885,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 885,
    "maxSalary": 890,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 890,
    "maxSalary": 895,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 895,
    "maxSalary": 900,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 900,
    "maxSalary": 905,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 905,
    "maxSalary": 910,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 910,
    "maxSalary": 915,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 915,
    "maxSalary": 920,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 920,
    "maxSalary": 925,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 925,
    "maxSalary": 930,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 930,
    "maxSalary": 935,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 935,
    "maxSalary": 940,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 940,
    "maxSalary": 945,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 945,
    "maxSalary": 950,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 950,
    "maxSalary": 955,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 955,
    "maxSalary": 960,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 960,
    "maxSalary": 965,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 965,
    "maxSalary": 970,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 970,
    "maxSalary": 975,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 975,
    "maxSalary": 980,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 980,
    "maxSalary": 985,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 985,
    "maxSalary": 990,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 990,
    "maxSalary": 995,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 995,
    "maxSalary": 1000,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1000,
    "maxSalary": 1005,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1005,
    "maxSalary": 1010,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1010,
    "maxSalary": 1015,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1015,
    "maxSalary": 1020,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1020,
    "maxSalary": 1025,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1025,
    "maxSalary": 1030,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1030,
    "maxSalary": 1035,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1035,
    "maxSalary": 1040,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1040,
    "maxSalary": 1045,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1045,
    "maxSalary": 1050,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1050,
    "maxSalary": 1055,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1055,
    "maxSalary": 1060,
    "taxByDependents": [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1060,
    "maxSalary": 1065,
    "taxByDependents": [
      1040,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1065,
    "maxSalary": 1070,
    "taxByDependents": [
      1110,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1070,
    "maxSalary": 1075,
    "taxByDependents": [
      1180,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1075,
    "maxSalary": 1080,
    "taxByDependents": [
      1250,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1080,
    "maxSalary": 1085,
    "taxByDependents": [
      1320,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1085,
    "maxSalary": 1090,
    "taxByDependents": [
      1390,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1090,
    "maxSalary": 1095,
    "taxByDependents": [
      1460,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1095,
    "maxSalary": 1100,
    "taxByDependents": [
      1530,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1100,
    "maxSalary": 1105,
    "taxByDependents": [
      1600,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1105,
    "maxSalary": 1110,
    "taxByDependents": [
      1670,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1110,
    "maxSalary": 1115,
    "taxByDependents": [
      1740,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1115,
    "maxSalary": 1120,
    "taxByDependents": [
      1810,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1120,
    "maxSalary": 1125,
    "taxByDependents": [
      1880,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1125,
    "maxSalary": 1130,
    "taxByDependents": [
      1950,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1130,
    "maxSalary": 1135,
    "taxByDependents": [
      2020,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1135,
    "maxSalary": 1140,
    "taxByDependents": [
      2090,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1140,
    "maxSalary": 1145,
    "taxByDependents": [
      2160,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1145,
    "maxSalary": 1150,
    "taxByDependents": [
      2230,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1150,
    "maxSalary": 1155,
    "taxByDependents": [
      2300,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1155,
    "maxSalary": 1160,
    "taxByDependents": [
      2370,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1160,
    "maxSalary": 1165,
    "taxByDependents": [
      2440,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1165,
    "maxSalary": 1170,
    "taxByDependents": [
      2500,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1170,
    "maxSalary": 1175,
    "taxByDependents": [
      2570,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1175,
    "maxSalary": 1180,
    "taxByDependents": [
      2640,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1180,
    "maxSalary": 1185,
    "taxByDependents": [
      2710,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1185,
    "maxSalary": 1190,
    "taxByDependents": [
      2780,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1190,
    "maxSalary": 1195,
    "taxByDependents": [
      2850,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1195,
    "maxSalary": 1200,
    "taxByDependents": [
      2920,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1200,
    "maxSalary": 1205,
    "taxByDependents": [
      2990,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1205,
    "maxSalary": 1210,
    "taxByDependents": [
      3060,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1210,
    "maxSalary": 1215,
    "taxByDependents": [
      3130,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1215,
    "maxSalary": 1220,
    "taxByDependents": [
      3200,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1220,
    "maxSalary": 1225,
    "taxByDependents": [
      3270,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1225,
    "maxSalary": 1230,
    "taxByDependents": [
      3340,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1230,
    "maxSalary": 1235,
    "taxByDependents": [
      3410,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1235,
    "maxSalary": 1240,
    "taxByDependents": [
      3480,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1240,
    "maxSalary": 1245,
    "taxByDependents": [
      3550,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1245,
    "maxSalary": 1250,
    "taxByDependents": [
      3620,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1250,
    "maxSalary": 1255,
    "taxByDependents": [
      3700,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1255,
    "maxSalary": 1260,
    "taxByDependents": [
      3810,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1260,
    "maxSalary": 1265,
    "taxByDependents": [
      3910,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1265,
    "maxSalary": 1270,
    "taxByDependents": [
      4010,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1270,
    "maxSalary": 1275,
    "taxByDependents": [
      4120,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1275,
    "maxSalary": 1280,
    "taxByDependents": [
      4220,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1280,
    "maxSalary": 1285,
    "taxByDependents": [
      4320,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1285,
    "maxSalary": 1290,
    "taxByDependents": [
      4430,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1290,
    "maxSalary": 1295,
    "taxByDependents": [
      4530,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1295,
    "maxSalary": 1300,
    "taxByDependents": [
      4630,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1300,
    "maxSalary": 1305,
    "taxByDependents": [
      4740,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1305,
    "maxSalary": 1310,
    "taxByDependents": [
      4840,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1310,
    "maxSalary": 1315,
    "taxByDependents": [
      4940,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1315,
    "maxSalary": 1320,
    "taxByDependents": [
      5050,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1320,
    "maxSalary": 1325,
    "taxByDependents": [
      5150,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1325,
    "maxSalary": 1330,
    "taxByDependents": [
      5250,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1330,
    "maxSalary": 1335,
    "taxByDependents": [
      5360,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1335,
    "maxSalary": 1340,
    "taxByDependents": [
      5460,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1340,
    "maxSalary": 1345,
    "taxByDependents": [
      5560,
      1060,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1345,
    "maxSalary": 1350,
    "taxByDependents": [
      5670,
      1170,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1350,
    "maxSalary": 1355,
    "taxByDependents": [
      5770,
      1270,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1355,
    "maxSalary": 1360,
    "taxByDependents": [
      5870,
      1370,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1360,
    "maxSalary": 1365,
    "taxByDependents": [
      5980,
      1480,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1365,
    "maxSalary": 1370,
    "taxByDependents": [
      6080,
      1580,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1370,
    "maxSalary": 1375,
    "taxByDependents": [
      6180,
      1680,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1375,
    "maxSalary": 1380,
    "taxByDependents": [
      6290,
      1790,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1380,
    "maxSalary": 1385,
    "taxByDependents": [
      6390,
      1890,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1385,
    "maxSalary": 1390,
    "taxByDependents": [
      6490,
      1990,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1390,
    "maxSalary": 1395,
    "taxByDependents": [
      6600,
      2100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1395,
    "maxSalary": 1400,
    "taxByDependents": [
      6700,
      2200,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1400,
    "maxSalary": 1405,
    "taxByDependents": [
      6800,
      2300,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1405,
    "maxSalary": 1410,
    "taxByDependents": [
      6910,
      2410,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1410,
    "maxSalary": 1415,
    "taxByDependents": [
      7010,
      2510,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1415,
    "maxSalary": 1420,
    "taxByDependents": [
      7110,
      2610,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1420,
    "maxSalary": 1425,
    "taxByDependents": [
      7210,
      2710,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1425,
    "maxSalary": 1430,
    "taxByDependents": [
      7320,
      2820,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1430,
    "maxSalary": 1435,
    "taxByDependents": [
      7420,
      2920,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1435,
    "maxSalary": 1440,
    "taxByDependents": [
      7520,
      3020,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1440,
    "maxSalary": 1445,
    "taxByDependents": [
      7630,
      3130,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1445,
    "maxSalary": 1450,
    "taxByDependents": [
      7730,
      3230,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1450,
    "maxSalary": 1455,
    "taxByDependents": [
      7830,
      3330,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1455,
    "maxSalary": 1460,
    "taxByDependents": [
      7940,
      3440,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1460,
    "maxSalary": 1465,
    "taxByDependents": [
      8040,
      3540,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1465,
    "maxSalary": 1470,
    "taxByDependents": [
      8140,
      3640,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1470,
    "maxSalary": 1475,
    "taxByDependents": [
      8250,
      3750,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1475,
    "maxSalary": 1480,
    "taxByDependents": [
      8350,
      3850,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1480,
    "maxSalary": 1485,
    "taxByDependents": [
      8450,
      3950,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1485,
    "maxSalary": 1490,
    "taxByDependents": [
      8560,
      4060,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1490,
    "maxSalary": 1495,
    "taxByDependents": [
      8660,
      4160,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1495,
    "maxSalary": 1500,
    "taxByDependents": [
      8760,
      4260,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1500,
    "maxSalary": 1510,
    "taxByDependents": [
      8920,
      4420,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1510,
    "maxSalary": 1520,
    "taxByDependents": [
      9120,
      4620,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1520,
    "maxSalary": 1530,
    "taxByDependents": [
      9330,
      4830,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1530,
    "maxSalary": 1540,
    "taxByDependents": [
      9540,
      5040,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1540,
    "maxSalary": 1550,
    "taxByDependents": [
      9740,
      5240,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1550,
    "maxSalary": 1560,
    "taxByDependents": [
      9950,
      5450,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1560,
    "maxSalary": 1570,
    "taxByDependents": [
      10160,
      5660,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1570,
    "maxSalary": 1580,
    "taxByDependents": [
      10360,
      5860,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1580,
    "maxSalary": 1590,
    "taxByDependents": [
      10570,
      6070,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1590,
    "maxSalary": 1600,
    "taxByDependents": [
      10780,
      6280,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1600,
    "maxSalary": 1610,
    "taxByDependents": [
      10980,
      6480,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1610,
    "maxSalary": 1620,
    "taxByDependents": [
      11190,
      6690,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1620,
    "maxSalary": 1630,
    "taxByDependents": [
      11400,
      6900,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1630,
    "maxSalary": 1640,
    "taxByDependents": [
      11600,
      7100,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1640,
    "maxSalary": 1650,
    "taxByDependents": [
      11810,
      7310,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1650,
    "maxSalary": 1660,
    "taxByDependents": [
      12020,
      7520,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1660,
    "maxSalary": 1670,
    "taxByDependents": [
      12220,
      7720,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1670,
    "maxSalary": 1680,
    "taxByDependents": [
      12430,
      7930,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1680,
    "maxSalary": 1690,
    "taxByDependents": [
      12640,
      8140,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1690,
    "maxSalary": 1700,
    "taxByDependents": [
      12840,
      8340,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1700,
    "maxSalary": 1710,
    "taxByDependents": [
      13050,
      8550,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1710,
    "maxSalary": 1720,
    "taxByDependents": [
      13260,
      8760,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1720,
    "maxSalary": 1730,
    "taxByDependents": [
      13460,
      8960,
      1040,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1730,
    "maxSalary": 1740,
    "taxByDependents": [
      13670,
      9170,
      1240,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1740,
    "maxSalary": 1750,
    "taxByDependents": [
      13880,
      9380,
      1440,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1750,
    "maxSalary": 1760,
    "taxByDependents": [
      14080,
      9580,
      1640,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1760,
    "maxSalary": 1770,
    "taxByDependents": [
      14290,
      9790,
      1830,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1770,
    "maxSalary": 1780,
    "taxByDependents": [
      14500,
      10000,
      2030,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1780,
    "maxSalary": 1790,
    "taxByDependents": [
      14700,
      10200,
      2230,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1790,
    "maxSalary": 1800,
    "taxByDependents": [
      14910,
      10410,
      2430,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1800,
    "maxSalary": 1810,
    "taxByDependents": [
      15110,
      10610,
      2630,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1810,
    "maxSalary": 1820,
    "taxByDependents": [
      15320,
      10820,
      2830,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1820,
    "maxSalary": 1830,
    "taxByDependents": [
      15530,
      11030,
      3020,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1830,
    "maxSalary": 1840,
    "taxByDependents": [
      15730,
      11230,
      3220,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1840,
    "maxSalary": 1850,
    "taxByDependents": [
      15940,
      11440,
      3420,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1850,
    "maxSalary": 1860,
    "taxByDependents": [
      16150,
      11650,
      3620,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1860,
    "maxSalary": 1870,
    "taxByDependents": [
      16350,
      11850,
      3820,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1870,
    "maxSalary": 1880,
    "taxByDependents": [
      16560,
      12060,
      4020,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1880,
    "maxSalary": 1890,
    "taxByDependents": [
      16770,
      12270,
      4220,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1890,
    "maxSalary": 1900,
    "taxByDependents": [
      16970,
      12470,
      4410,
      1040,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1900,
    "maxSalary": 1910,
    "taxByDependents": [
      17180,
      12680,
      4610,
      1240,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1910,
    "maxSalary": 1920,
    "taxByDependents": [
      17390,
      12890,
      4810,
      1440,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1920,
    "maxSalary": 1930,
    "taxByDependents": [
      17590,
      13090,
      5010,
      1630,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1930,
    "maxSalary": 1940,
    "taxByDependents": [
      17800,
      13300,
      5210,
      1830,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1940,
    "maxSalary": 1950,
    "taxByDependents": [
      18010,
      13510,
      5410,
      2030,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1950,
    "maxSalary": 1960,
    "taxByDependents": [
      18210,
      13710,
      5600,
      2230,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1960,
    "maxSalary": 1970,
    "taxByDependents": [
      18420,
      13920,
      5800,
      2430,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1970,
    "maxSalary": 1980,
    "taxByDependents": [
      18630,
      14130,
      6000,
      2630,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1980,
    "maxSalary": 1990,
    "taxByDependents": [
      18880,
      14330,
      6200,
      2820,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 1990,
    "maxSalary": 2000,
    "taxByDependents": [
      19200,
      14540,
      6400,
      3020,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2000,
    "maxSalary": 2010,
    "taxByDependents": [
      19520,
      14750,
      6600,
      3220,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2010,
    "maxSalary": 2020,
    "taxByDependents": [
      19850,
      14950,
      6800,
      3420,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2020,
    "maxSalary": 2030,
    "taxByDependents": [
      20170,
      15160,
      6990,
      3620,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2030,
    "maxSalary": 2040,
    "taxByDependents": [
      20490,
      15370,
      7190,
      3820,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2040,
    "maxSalary": 2050,
    "taxByDependents": [
      20810,
      15570,
      7390,
      4020,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2050,
    "maxSalary": 2060,
    "taxByDependents": [
      21130,
      15780,
      7590,
      4210,
      0,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2060,
    "maxSalary": 2070,
    "taxByDependents": [
      21450,
      15990,
      7790,
      4410,
      1040,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2070,
    "maxSalary": 2080,
    "taxByDependents": [
      21770,
      16190,
      7990,
      4610,
      1240,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2080,
    "maxSalary": 2090,
    "taxByDependents": [
      22090,
      16400,
      8180,
      4810,
      1430,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2090,
    "maxSalary": 2100,
    "taxByDependents": [
      22420,
      16600,
      8380,
      5010,
      1630,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2100,
    "maxSalary": 2110,
    "taxByDependents": [
      22740,
      16810,
      8580,
      5210,
      1830,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2110,
    "maxSalary": 2120,
    "taxByDependents": [
      23060,
      17020,
      8780,
      5400,
      2030,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2120,
    "maxSalary": 2130,
    "taxByDependents": [
      23380,
      17220,
      8980,
      5600,
      2230,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2130,
    "maxSalary": 2140,
    "taxByDependents": [
      23700,
      17430,
      9180,
      5800,
      2430,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2140,
    "maxSalary": 2150,
    "taxByDependents": [
      24020,
      17640,
      9380,
      6000,
      2630,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2150,
    "maxSalary": 2160,
    "taxByDependents": [
      24340,
      17840,
      9570,
      6200,
      2820,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2160,
    "maxSalary": 2170,
    "taxByDependents": [
      24660,
      18050,
      9770,
      6400,
      3020,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2170,
    "maxSalary": 2180,
    "taxByDependents": [
      24990,
      18260,
      9970,
      6600,
      3220,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2180,
    "maxSalary": 2190,
    "taxByDependents": [
      25310,
      18460,
      10170,
      6790,
      3420,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2190,
    "maxSalary": 2200,
    "taxByDependents": [
      25630,
      18670,
      10370,
      6990,
      3620,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2200,
    "maxSalary": 2210,
    "taxByDependents": [
      25950,
      18950,
      10570,
      7190,
      3820,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2210,
    "maxSalary": 2220,
    "taxByDependents": [
      26270,
      19270,
      10760,
      7390,
      4010,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2220,
    "maxSalary": 2230,
    "taxByDependents": [
      26590,
      19590,
      10960,
      7590,
      4210,
      0,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2230,
    "maxSalary": 2240,
    "taxByDependents": [
      26910,
      19910,
      11160,
      7790,
      4410,
      1040,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2240,
    "maxSalary": 2250,
    "taxByDependents": [
      27240,
      20240,
      11360,
      7980,
      4610,
      1230,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2250,
    "maxSalary": 2260,
    "taxByDependents": [
      27560,
      20560,
      11560,
      8180,
      4810,
      1430,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2260,
    "maxSalary": 2270,
    "taxByDependents": [
      27880,
      20880,
      11760,
      8380,
      5010,
      1630,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2270,
    "maxSalary": 2280,
    "taxByDependents": [
      28200,
      21200,
      11960,
      8580,
      5210,
      1830,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2280,
    "maxSalary": 2290,
    "taxByDependents": [
      28520,
      21520,
      12150,
      8780,
      5400,
      2030,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2290,
    "maxSalary": 2300,
    "taxByDependents": [
      28840,
      21840,
      12350,
      8980,
      5600,
      2230,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2300,
    "maxSalary": 2310,
    "taxByDependents": [
      29160,
      22160,
      12550,
      9180,
      5800,
      2430,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2310,
    "maxSalary": 2320,
    "taxByDependents": [
      29480,
      22480,
      12750,
      9370,
      6000,
      2620,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2320,
    "maxSalary": 2330,
    "taxByDependents": [
      29810,
      22810,
      12950,
      9570,
      6200,
      2820,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2330,
    "maxSalary": 2340,
    "taxByDependents": [
      30130,
      23130,
      13150,
      9770,
      6400,
      3020,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2340,
    "maxSalary": 2350,
    "taxByDependents": [
      30450,
      23450,
      13340,
      9970,
      6590,
      3220,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2350,
    "maxSalary": 2360,
    "taxByDependents": [
      30770,
      23770,
      13540,
      10170,
      6790,
      3420,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2360,
    "maxSalary": 2370,
    "taxByDependents": [
      31090,
      24090,
      13740,
      10370,
      6990,
      3620,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2370,
    "maxSalary": 2380,
    "taxByDependents": [
      31410,
      24410,
      13940,
      10560,
      7190,
      3810,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2380,
    "maxSalary": 2390,
    "taxByDependents": [
      31730,
      24730,
      14140,
      10760,
      7390,
      4010,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2390,
    "maxSalary": 2400,
    "taxByDependents": [
      32050,
      25050,
      14340,
      10960,
      7590,
      4210,
      0,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2400,
    "maxSalary": 2410,
    "taxByDependents": [
      32380,
      25380,
      14530,
      11160,
      7780,
      4410,
      1030,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2410,
    "maxSalary": 2420,
    "taxByDependents": [
      32700,
      25700,
      14730,
      11360,
      7980,
      4610,
      1230,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2420,
    "maxSalary": 2430,
    "taxByDependents": [
      33020,
      26020,
      14930,
      11560,
      8180,
      4810,
      1430,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2430,
    "maxSalary": 2440,
    "taxByDependents": [
      33340,
      26340,
      15130,
      11760,
      8380,
      5010,
      1630,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2440,
    "maxSalary": 2450,
    "taxByDependents": [
      33660,
      26660,
      15330,
      11950,
      8580,
      5200,
      1830,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2450,
    "maxSalary": 2460,
    "taxByDependents": [
      33980,
      26980,
      15530,
      12150,
      8780,
      5400,
      2030,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2460,
    "maxSalary": 2470,
    "taxByDependents": [
      34300,
      27300,
      15730,
      12350,
      8980,
      5600,
      2230,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2470,
    "maxSalary": 2480,
    "taxByDependents": [
      34630,
      27630,
      15920,
      12550,
      9170,
      5800,
      2420,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2480,
    "maxSalary": 2490,
    "taxByDependents": [
      34950,
      27950,
      16120,
      12750,
      9370,
      6000,
      2620,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2490,
    "maxSalary": 2500,
    "taxByDependents": [
      35270,
      28270,
      16320,
      12950,
      9570,
      6200,
      2820,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2500,
    "maxSalary": 2510,
    "taxByDependents": [
      35600,
      28600,
      16530,
      13150,
      9780,
      6400,
      3030,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2510,
    "maxSalary": 2520,
    "taxByDependents": [
      35940,
      28940,
      16740,
      13360,
      9990,
      6610,
      3240,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2520,
    "maxSalary": 2530,
    "taxByDependents": [
      36280,
      29280,
      16950,
      13580,
      10200,
      6830,
      3450,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2530,
    "maxSalary": 2540,
    "taxByDependents": [
      36630,
      29630,
      17160,
      13790,
      10410,
      7040,
      3660,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2540,
    "maxSalary": 2550,
    "taxByDependents": [
      36970,
      29970,
      17370,
      14000,
      10620,
      7250,
      3870,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2550,
    "maxSalary": 2560,
    "taxByDependents": [
      37310,
      30310,
      17590,
      14210,
      10840,
      7460,
      4090,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2560,
    "maxSalary": 2570,
    "taxByDependents": [
      37650,
      30650,
      17800,
      14420,
      11050,
      7670,
      4300,
      0,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2570,
    "maxSalary": 2580,
    "taxByDependents": [
      38000,
      31000,
      18010,
      14630,
      11260,
      7880,
      4510,
      1130,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2580,
    "maxSalary": 2590,
    "taxByDependents": [
      38340,
      31340,
      18220,
      14850,
      11470,
      8100,
      4720,
      1350,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2590,
    "maxSalary": 2600,
    "taxByDependents": [
      38830,
      31680,
      18430,
      15060,
      11680,
      8310,
      4930,
      1560,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2600,
    "maxSalary": 2610,
    "taxByDependents": [
      39690,
      32020,
      18650,
      15270,
      11900,
      8520,
      5150,
      1770,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2610,
    "maxSalary": 2620,
    "taxByDependents": [
      40540,
      32360,
      18920,
      15480,
      12110,
      8730,
      5360,
      1980,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2620,
    "maxSalary": 2630,
    "taxByDependents": [
      41400,
      32710,
      19250,
      15690,
      12320,
      8940,
      5570,
      2190,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2630,
    "maxSalary": 2640,
    "taxByDependents": [
      42260,
      33050,
      19580,
      15910,
      12530,
      9160,
      5780,
      2410,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2640,
    "maxSalary": 2650,
    "taxByDependents": [
      43110,
      33390,
      19910,
      16120,
      12740,
      9370,
      5990,
      2620,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2650,
    "maxSalary": 2660,
    "taxByDependents": [
      43970,
      33730,
      20240,
      16330,
      12960,
      9580,
      6210,
      2830,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2660,
    "maxSalary": 2670,
    "taxByDependents": [
      44820,
      34080,
      20570,
      16540,
      13170,
      9790,
      6420,
      3040,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2670,
    "maxSalary": 2680,
    "taxByDependents": [
      45680,
      34420,
      20900,
      16750,
      13380,
      10000,
      6630,
      3250,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2680,
    "maxSalary": 2690,
    "taxByDependents": [
      46540,
      34760,
      21230,
      16970,
      13590,
      10220,
      6840,
      3470,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2690,
    "maxSalary": 2700,
    "taxByDependents": [
      47390,
      35100,
      21560,
      17180,
      13800,
      10430,
      7050,
      3680,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2700,
    "maxSalary": 2710,
    "taxByDependents": [
      48250,
      35450,
      21890,
      17390,
      14020,
      10640,
      7270,
      3890,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2710,
    "maxSalary": 2720,
    "taxByDependents": [
      49100,
      35790,
      22220,
      17600,
      14230,
      10850,
      7480,
      4100,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2720,
    "maxSalary": 2730,
    "taxByDependents": [
      49960,
      36130,
      22550,
      17810,
      14440,
      11060,
      7690,
      4310,
      0,
      0,
      0
    ]
  },
  {
    "minSalary": 2730,
    "maxSalary": 2740,
    "taxByDependents": [
      50810,
      36470,
      22880,
      18030,
      14650,
      11280,
      7900,
      4530,
      1150,
      0,
      0
    ]
  },
  {
    "minSalary": 2740,
    "maxSalary": 2750,
    "taxByDependents": [
      51670,
      36810,
      23210,
      18240,
      14860,
      11490,
      8110,
      4740,
      1360,
      0,
      0
    ]
  },
  {
    "minSalary": 2750,
    "maxSalary": 2760,
    "taxByDependents": [
      52530,
      37160,
      23540,
      18450,
      15070,
      11700,
      8320,
      4950,
      1570,
      0,
      0
    ]
  },
  {
    "minSalary": 2760,
    "maxSalary": 2770,
    "taxByDependents": [
      53380,
      37500,
      23870,
      18660,
      15290,
      11910,
      8540,
      5160,
      1790,
      0,
      0
    ]
  },
  {
    "minSalary": 2770,
    "maxSalary": 2780,
    "taxByDependents": [
      54240,
      37840,
      24200,
      18950,
      15500,
      12120,
      8750,
      5370,
      2000,
      0,
      0
    ]
  },
  {
    "minSalary": 2780,
    "maxSalary": 2790,
    "taxByDependents": [
      55090,
      38180,
      24520,
      19270,
      15710,
      12340,
      8960,
      5590,
      2210,
      0,
      0
    ]
  },
  {
    "minSalary": 2790,
    "maxSalary": 2800,
    "taxByDependents": [
      55950,
      38530,
      24850,
      19600,
      15920,
      12550,
      9170,
      5800,
      2420,
      0,
      0
    ]
  },
  {
    "minSalary": 2800,
    "maxSalary": 2810,
    "taxByDependents": [
      56800,
      39300,
      25180,
      19930,
      16130,
      12760,
      9380,
      6010,
      2630,
      0,
      0
    ]
  },
  {
    "minSalary": 2810,
    "maxSalary": 2820,
    "taxByDependents": [
      57660,
      40160,
      25510,
      20260,
      16350,
      12970,
      9600,
      6220,
      2850,
      0,
      0
    ]
  },
  {
    "minSalary": 2820,
    "maxSalary": 2830,
    "taxByDependents": [
      58520,
      41020,
      25840,
      20590,
      16560,
      13180,
      9810,
      6430,
      3060,
      0,
      0
    ]
  },
  {
    "minSalary": 2830,
    "maxSalary": 2840,
    "taxByDependents": [
      59370,
      41870,
      26170,
      20920,
      16770,
      13400,
      10020,
      6650,
      3270,
      0,
      0
    ]
  },
  {
    "minSalary": 2840,
    "maxSalary": 2850,
    "taxByDependents": [
      60230,
      42730,
      26500,
      21250,
      16980,
      13610,
      10230,
      6860,
      3480,
      0,
      0
    ]
  },
  {
    "minSalary": 2850,
    "maxSalary": 2860,
    "taxByDependents": [
      61080,
      43580,
      26830,
      21580,
      17190,
      13820,
      10440,
      7070,
      3690,
      0,
      0
    ]
  },
  {
    "minSalary": 2860,
    "maxSalary": 2870,
    "taxByDependents": [
      61940,
      44440,
      27160,
      21910,
      17410,
      14030,
      10660,
      7280,
      3910,
      0,
      0
    ]
  },
  {
    "minSalary": 2870,
    "maxSalary": 2880,
    "taxByDependents": [
      62790,
      45290,
      27490,
      22240,
      17620,
      14240,
      10870,
      7490,
      4120,
      0,
      0
    ]
  },
  {
    "minSalary": 2880,
    "maxSalary": 2890,
    "taxByDependents": [
      63650,
      46150,
      27820,
      22570,
      17830,
      14460,
      11080,
      7710,
      4330,
      0,
      0
    ]
  },
  {
    "minSalary": 2890,
    "maxSalary": 2900,
    "taxByDependents": [
      64510,
      47010,
      28150,
      22900,
      18040,
      14670,
      11290,
      7920,
      4540,
      1170,
      0
    ]
  },
  {
    "minSalary": 2900,
    "maxSalary": 2910,
    "taxByDependents": [
      65360,
      47860,
      28480,
      23230,
      18250,
      14880,
      11500,
      8130,
      4750,
      1380,
      0
    ]
  },
  {
    "minSalary": 2910,
    "maxSalary": 2920,
    "taxByDependents": [
      66220,
      48720,
      28810,
      23560,
      18470,
      15090,
      11720,
      8340,
      4970,
      1590,
      0
    ]
  },
  {
    "minSalary": 2920,
    "maxSalary": 2930,
    "taxByDependents": [
      67070,
      49570,
      29140,
      23890,
      18680,
      15300,
      11930,
      8550,
      5180,
      1800,
      0
    ]
  },
  {
    "minSalary": 2930,
    "maxSalary": 2940,
    "taxByDependents": [
      67930,
      50430,
      29470,
      24220,
      18970,
      15510,
      12140,
      8760,
      5390,
      2010,
      0
    ]
  },
  {
    "minSalary": 2940,
    "maxSalary": 2950,
    "taxByDependents": [
      68780,
      51280,
      29800,
      24550,
      19300,
      15730,
      12350,
      8980,
      5600,
      2230,
      0
    ]
  },
  {
    "minSalary": 2950,
    "maxSalary": 2960,
    "taxByDependents": [
      69640,
      52140,
      30130,
      24880,
      19630,
      15940,
      12560,
      9190,
      5810,
      2440,
      0
    ]
  },
  {
    "minSalary": 2960,
    "maxSalary": 2970,
    "taxByDependents": [
      70500,
      53000,
      30460,
      25210,
      19960,
      16150,
      12780,
      9400,
      6030,
      2650,
      0
    ]
  },
  {
    "minSalary": 2970,
    "maxSalary": 2980,
    "taxByDependents": [
      71350,
      53850,
      30790,
      25540,
      20290,
      16360,
      12990,
      9610,
      6240,
      2860,
      0
    ]
  },
  {
    "minSalary": 2980,
    "maxSalary": 2990,
    "taxByDependents": [
      72210,
      54710,
      31120,
      25870,
      20620,
      16570,
      13200,
      9820,
      6450,
      3070,
      0
    ]
  },
  {
    "minSalary": 2990,
    "maxSalary": 3000,
    "taxByDependents": [
      73060,
      55560,
      31450,
      26200,
      20950,
      16790,
      13410,
      10040,
      6660,
      3290,
      0
    ]
  },
  {
    "minSalary": 3000,
    "maxSalary": 3020,
    "taxByDependents": [
      74350,
      56850,
      31940,
      26690,
      21440,
      17100,
      13730,
      10350,
      6980,
      3600,
      0
    ]
  },
  {
    "minSalary": 3020,
    "maxSalary": 3040,
    "taxByDependents": [
      76060,
      58560,
      32600,
      27350,
      22100,
      17530,
      14150,
      10780,
      7400,
      4030,
      0
    ]
  },
  {
    "minSalary": 3040,
    "maxSalary": 3060,
    "taxByDependents": [
      77770,
      60270,
      33260,
      28010,
      22760,
      17950,
      14580,
      11200,
      7830,
      4450,
      1080
    ]
  },
  {
    "minSalary": 3060,
    "maxSalary": 3080,
    "taxByDependents": [
      79480,
      61980,
      33920,
      28670,
      23420,
      18380,
      15000,
      11630,
      8250,
      4880,
      1500
    ]
  },
  {
    "minSalary": 3080,
    "maxSalary": 3100,
    "taxByDependents": [
      81190,
      63690,
      34580,
      29330,
      24080,
      18830,
      15430,
      12050,
      8680,
      5300,
      1930
    ]
  },
  {
    "minSalary": 3100,
    "maxSalary": 3120,
    "taxByDependents": [
      82900,
      65400,
      35240,
      29990,
      24740,
      19490,
      15850,
      12470,
      9100,
      5720,
      2350
    ]
  },
  {
    "minSalary": 3120,
    "maxSalary": 3140,
    "taxByDependents": [
      84620,
      67120,
      35900,
      30650,
      25400,
      20150,
      16270,
      12900,
      9520,
      6150,
      2770
    ]
  },
  {
    "minSalary": 3140,
    "maxSalary": 3160,
    "taxByDependents": [
      86330,
      68830,
      36560,
      31310,
      26060,
      20810,
      16700,
      13320,
      9950,
      6570,
      3200
    ]
  },
  {
    "minSalary": 3160,
    "maxSalary": 3180,
    "taxByDependents": [
      88040,
      70540,
      37220,
      31970,
      26720,
      21470,
      17120,
      13750,
      10370,
      7000,
      3620
    ]
  },
  {
    "minSalary": 3180,
    "maxSalary": 3200,
    "taxByDependents": [
      89750,
      72250,
      37880,
      32630,
      27380,
      22130,
      17540,
      14170,
      10790,
      7420,
      4040
    ]
  },
  {
    "minSalary": 3200,
    "maxSalary": 3220,
    "taxByDependents": [
      91460,
      73960,
      38540,
      33290,
      28040,
      22790,
      17970,
      14590,
      11220,
      7840,
      4470
    ]
  },
  {
    "minSalary": 3220,
    "maxSalary": 3240,
    "taxByDependents": [
      93170,
      75670,
      40120,
      33950,
      28700,
      23450,
      18390,
      15020,
      11640,
      8270,
      4890
    ]
  },
  {
    "minSalary": 3240,
    "maxSalary": 3260,
    "taxByDependents": [
      95430,
      77380,
      41770,
      34610,
      29360,
      24110,
      18860,
      15440,
      12070,
      8690,
      5320
    ]
  },
  {
    "minSalary": 3260,
    "maxSalary": 3280,
    "taxByDependents": [
      97880,
      79100,
      43420,
      35270,
      30020,
      24770,
      19520,
      15870,
      12490,
      9120,
      5740
    ]
  },
  {
    "minSalary": 3280,
    "maxSalary": 3300,
    "taxByDependents": [
      100320,
      80810,
      45070,
      35920,
      30670,
      25420,
      20170,
      16290,
      12910,
      9540,
      6160
    ]
  },
  {
    "minSalary": 3300,
    "maxSalary": 3320,
    "taxByDependents": [
      102770,
      82520,
      46720,
      36580,
      31330,
      26080,
      20830,
      16710,
      13340,
      9960,
      6590
    ]
  },
  {
    "minSalary": 3320,
    "maxSalary": 3340,
    "taxByDependents": [
      105210,
      84230,
      48370,
      37240,
      31990,
      26740,
      21490,
      17140,
      13760,
      10390,
      7010
    ]
  },
  {
    "minSalary": 3340,
    "maxSalary": 3360,
    "taxByDependents": [
      107660,
      85940,
      49940,
      37870,
      32620,
      27370,
      22120,
      17540,
      14170,
      10790,
      7420
    ]
  },
  {
    "minSalary": 3360,
    "maxSalary": 3380,
    "taxByDependents": [
      110100,
      87650,
      51510,
      38500,
      33250,
      28000,
      22750,
      17950,
      14570,
      11200,
      7820
    ]
  },
  {
    "minSalary": 3380,
    "maxSalary": 3400,
    "taxByDependents": [
      112550,
      89370,
      53070,
      39950,
      33880,
      28630,
      23380,
      18350,
      14970,
      11600,
      8220
    ]
  },
  {
    "minSalary": 3400,
    "maxSalary": 3420,
    "taxByDependents": [
      114990,
      91080,
      54640,
      41510,
      34500,
      29250,
      24000,
      18750,
      15370,
      12000,
      8620
    ]
  },
  {
    "minSalary": 3420,
    "maxSalary": 3440,
    "taxByDependents": [
      117440,
      92790,
      56200,
      43080,
      35130,
      29880,
      24630,
      19380,
      15780,
      12400,
      9030
    ]
  },
  {
    "minSalary": 3440,
    "maxSalary": 3460,
    "taxByDependents": [
      119880,
      94880,
      57770,
      44640,
      35750,
      30500,
      25250,
      20000,
      16180,
      12800,
      9430
    ]
  },
  {
    "minSalary": 3460,
    "maxSalary": 3480,
    "taxByDependents": [
      122330,
      97330,
      59330,
      46210,
      36380,
      31130,
      25880,
      20630,
      16580,
      13210,
      9830
    ]
  },
  {
    "minSalary": 3480,
    "maxSalary": 3500,
    "taxByDependents": [
      124770,
      99770,
      60900,
      47770,
      37010,
      31760,
      26510,
      21260,
      16980,
      13610,
      10230
    ]
  },
  {
    "minSalary": 3500,
    "maxSalary": 3520,
    "taxByDependents": [
      127220,
      102220,
      62460,
      49340,
      37630,
      32380,
      27130,
      21880,
      17390,
      14010,
      10640
    ]
  },
  {
    "minSalary": 3520,
    "maxSalary": 3540,
    "taxByDependents": [
      129660,
      104660,
      64030,
      50900,
      38260,
      33010,
      27760,
      22510,
      17790,
      14410,
      11040
    ]
  },
  {
    "minSalary": 3540,
    "maxSalary": 3560,
    "taxByDependents": [
      132110,
      107110,
      65590,
      52460,
      39340,
      33630,
      28380,
      23130,
      18190,
      14820,
      11440
    ]
  },
  {
    "minSalary": 3560,
    "maxSalary": 3580,
    "taxByDependents": [
      134550,
      109550,
      67150,
      54030,
      40900,
      34260,
      29010,
      23760,
      18590,
      15220,
      11840
    ]
  },
  {
    "minSalary": 3580,
    "maxSalary": 3600,
    "taxByDependents": [
      137000,
      112000,
      68720,
      55590,
      42470,
      34880,
      29630,
      24380,
      19130,
      15620,
      12250
    ]
  },
  {
    "minSalary": 3600,
    "maxSalary": 3620,
    "taxByDependents": [
      139440,
      114440,
      70280,
      57160,
      44030,
      35510,
      30260,
      25010,
      19760,
      16020,
      12650
    ]
  },
  {
    "minSalary": 3620,
    "maxSalary": 3640,
    "taxByDependents": [
      141890,
      116890,
      71850,
      58720,
      45600,
      36140,
      30890,
      25640,
      20390,
      16420,
      13050
    ]
  },
  {
    "minSalary": 3640,
    "maxSalary": 3660,
    "taxByDependents": [
      144330,
      119330,
      73410,
      60290,
      47160,
      36760,
      31510,
      26260,
      21010,
      16830,
      13450
    ]
  },
  {
    "minSalary": 3660,
    "maxSalary": 3680,
    "taxByDependents": [
      146780,
      121780,
      74980,
      61850,
      48730,
      37390,
      32140,
      26890,
      21640,
      17230,
      13850
    ]
  },
  {
    "minSalary": 3680,
    "maxSalary": 3700,
    "taxByDependents": [
      149220,
      124220,
      76540,
      63420,
      50290,
      38010,
      32760,
      27510,
      22260,
      17630,
      14260
    ]
  },
  {
    "minSalary": 3700,
    "maxSalary": 3720,
    "taxByDependents": [
      151670,
      126670,
      78110,
      64980,
      51860,
      38730,
      33390,
      28140,
      22890,
      18030,
      14660
    ]
  },
  {
    "minSalary": 3720,
    "maxSalary": 3740,
    "taxByDependents": [
      154110,
      129110,
      79670,
      66550,
      53420,
      40300,
      34020,
      28770,
      23520,
      18440,
      15060
    ]
  },
  {
    "minSalary": 3740,
    "maxSalary": 3760,
    "taxByDependents": [
      156560,
      131560,
      81230,
      68110,
      54980,
      41860,
      34640,
      29390,
      24140,
      18890,
      15460
    ]
  },
  {
    "minSalary": 3760,
    "maxSalary": 3780,
    "taxByDependents": [
      163920,
      136090,
      84260,
      71130,
      58010,
      44880,
      35850,
      30600,
      25350,
      20100,
      16240
    ]
  },
  {
    "minSalary": 3780,
    "maxSalary": 3800,
    "taxByDependents": [
      166590,
      138740,
      85970,
      72850,
      59720,
      46600,
      36540,
      31290,
      26040,
      20790,
      16680
    ]
  },
  {
    "minSalary": 3800,
    "maxSalary": 3820,
    "taxByDependents": [
      169260,
      141400,
      87680,
      74560,
      61430,
      48310,
      37220,
      31970,
      26720,
      21470,
      17120
    ]
  },
  {
    "minSalary": 3820,
    "maxSalary": 3840,
    "taxByDependents": [
      171930,
      144050,
      89390,
      76270,
      63140,
      50020,
      37900,
      32650,
      27400,
      22150,
      17560
    ]
  },
  {
    "minSalary": 3840,
    "maxSalary": 3860,
    "taxByDependents": [
      174600,
      146710,
      91100,
      77980,
      64850,
      51730,
      38600,
      33340,
      28090,
      22840,
      18000
    ]
  },
  {
    "minSalary": 3860,
    "maxSalary": 3880,
    "taxByDependents": [
      177270,
      149360,
      92820,
      79690,
      66570,
      53440,
      40320,
      34020,
      28770,
      23520,
      18440
    ]
  },
  {
    "minSalary": 3880,
    "maxSalary": 3900,
    "taxByDependents": [
      179940,
      152020,
      94920,
      81400,
      68280,
      55150,
      42030,
      34710,
      29460,
      24210,
      18960
    ]
  },
  {
    "minSalary": 3900,
    "maxSalary": 3920,
    "taxByDependents": [
      182610,
      154670,
      97370,
      83110,
      69990,
      56860,
      43740,
      35390,
      30140,
      24890,
      19640
    ]
  },
  {
    "minSalary": 3920,
    "maxSalary": 3940,
    "taxByDependents": [
      185280,
      157330,
      99810,
      84830,
      71700,
      58580,
      45450,
      36080,
      30830,
      25580,
      20330
    ]
  },
  {
    "minSalary": 3940,
    "maxSalary": 3960,
    "taxByDependents": [
      187950,
      159980,
      102260,
      86540,
      73410,
      60290,
      47160,
      36760,
      31510,
      26260,
      21010
    ]
  },
  {
    "minSalary": 3960,
    "maxSalary": 3980,
    "taxByDependents": [
      190620,
      162640,
      104700,
      88250,
      75120,
      62000,
      48870,
      37450,
      32200,
      26950,
      21700
    ]
  },
  {
    "minSalary": 3980,
    "maxSalary": 4000,
    "taxByDependents": [
      193290,
      165290,
      107150,
      89960,
      76840,
      63710,
      50590,
      38130,
      32880,
      27630,
      22380
    ]
  },
  {
    "minSalary": 4000,
    "maxSalary": 4020,
    "taxByDependents": [
      195960,
      167950,
      109590,
      91670,
      78550,
      65420,
      52300,
      39170,
      33570,
      28320,
      23070
    ]
  },
  {
    "minSalary": 4020,
    "maxSalary": 4040,
    "taxByDependents": [
      198630,
      170600,
      112040,
      93380,
      80260,
      67130,
      54010,
      40880,
      34250,
      29000,
      23750
    ]
  },
  {
    "minSalary": 4040,
    "maxSalary": 4060,
    "taxByDependents": [
      201300,
      173260,
      114480,
      95730,
      81970,
      68840,
      55720,
      42590,
      34930,
      29680,
      24430
    ]
  },
  {
    "minSalary": 4060,
    "maxSalary": 4080,
    "taxByDependents": [
      203970,
      175910,
      116930,
      98180,
      83680,
      70560,
      57430,
      44310,
      35620,
      30370,
      25120
    ]
  },
  {
    "minSalary": 4080,
    "maxSalary": 4100,
    "taxByDependents": [
      206640,
      178570,
      119370,
      100620,
      85390,
      72270,
      59140,
      46020,
      36300,
      31050,
      25800
    ]
  },
  {
    "minSalary": 4100,
    "maxSalary": 4120,
    "taxByDependents": [
      209310,
      181220,
      121820,
      103070,
      87100,
      73980,
      60850,
      47730,
      36990,
      31740,
      26490
    ]
  },
  {
    "minSalary": 4120,
    "maxSalary": 4140,
    "taxByDependents": [
      211980,
      183880,
      124260,
      105510,
      88820,
      75690,
      62570,
      49440,
      37670,
      32420,
      27170
    ]
  },
  {
    "minSalary": 4140,
    "maxSalary": 4160,
    "taxByDependents": [
      214650,
      186530,
      126710,
      107960,
      90530,
      77400,
      64280,
      51150,
      38360,
      33110,
      27860
    ]
  },
  {
    "minSalary": 4160,
    "maxSalary": 4180,
    "taxByDependents": [
      217320,
      189190,
      129150,
      110400,
      92240,
      79110,
      65990,
      52860,
      39740,
      33790,
      28540
    ]
  },
  {
    "minSalary": 4180,
    "maxSalary": 4200,
    "taxByDependents": [
      219990,
      191840,
      131600,
      112850,
      94100,
      80830,
      67700,
      54580,
      41450,
      34480,
      29230
    ]
  },
  {
    "minSalary": 4200,
    "maxSalary": 4220,
    "taxByDependents": [
      222660,
      194500,
      134040,
      115290,
      96540,
      82540,
      69410,
      56290,
      43160,
      35160,
      29910
    ]
  },
  {
    "minSalary": 4220,
    "maxSalary": 4240,
    "taxByDependents": [
      225330,
      197150,
      136490,
      117740,
      98990,
      84250,
      71120,
      58000,
      44870,
      35850,
      30600
    ]
  },
  {
    "minSalary": 4240,
    "maxSalary": 4260,
    "taxByDependents": [
      228000,
      199810,
      138930,
      120180,
      101430,
      85960,
      72830,
      59710,
      46580,
      36530,
      31280
    ]
  },
  {
    "minSalary": 4260,
    "maxSalary": 4280,
    "taxByDependents": [
      230670,
      202460,
      141380,
      122630,
      103880,
      87670,
      74550,
      61420,
      48300,
      37220,
      31970
    ]
  },
  {
    "minSalary": 4280,
    "maxSalary": 4300,
    "taxByDependents": [
      233340,
      205120,
      143820,
      125070,
      106320,
      89380,
      76260,
      63130,
      50010,
      37900,
      32650
    ]
  },
  {
    "minSalary": 4300,
    "maxSalary": 4320,
    "taxByDependents": [
      236010,
      207770,
      146270,
      127520,
      108770,
      91090,
      77970,
      64840,
      51720,
      38590,
      33330
    ]
  },
  {
    "minSalary": 4320,
    "maxSalary": 4340,
    "taxByDependents": [
      238680,
      210430,
      148710,
      129960,
      111210,
      92810,
      79680,
      66560,
      53430,
      40310,
      34020
    ]
  },
  {
    "minSalary": 4340,
    "maxSalary": 4360,
    "taxByDependents": [
      241350,
      213080,
      151160,
      132410,
      113660,
      94910,
      81390,
      68270,
      55140,
      42020,
      34700
    ]
  },
  {
    "minSalary": 4360,
    "maxSalary": 4380,
    "taxByDependents": [
      244020,
      215740,
      153600,
      134850,
      116100,
      97350,
      83100,
      69980,
      56850,
      43730,
      35390
    ]
  },
  {
    "minSalary": 4380,
    "maxSalary": 4400,
    "taxByDependents": [
      246690,
      218390,
      156050,
      137300,
      118550,
      99800,
      84820,
      71690,
      58570,
      45440,
      36070
    ]
  },
  {
    "minSalary": 4400,
    "maxSalary": 4420,
    "taxByDependents": [
      249360,
      221050,
      158490,
      139740,
      120990,
      102240,
      86530,
      73400,
      60280,
      47150,
      36760
    ]
  },
  {
    "minSalary": 4420,
    "maxSalary": 4440,
    "taxByDependents": [
      252030,
      223700,
      160940,
      142190,
      123440,
      104690,
      88240,
      75110,
      61990,
      48860,
      37440
    ]
  },
  {
    "minSalary": 4440,
    "maxSalary": 4460,
    "taxByDependents": [
      254700,
      226360,
      163380,
      144630,
      125880,
      107130,
      89950,
      76820,
      63700,
      50570,
      38130
    ]
  },
  {
    "minSalary": 4460,
    "maxSalary": 4480,
    "taxByDependents": [
      257370,
      229010,
      165830,
      147080,
      128330,
      109580,
      91660,
      78540,
      65410,
      52290,
      39160
    ]
  },
  {
    "minSalary": 4480,
    "maxSalary": 4500,
    "taxByDependents": [
      260040,
      231670,
      168270,
      149520,
      130770,
      112020,
      93370,
      80250,
      67120,
      54000,
      40870
    ]
  },
  {
    "minSalary": 4500,
    "maxSalary": 4520,
    "taxByDependents": [
      262840,
      234460,
      170850,
      152100,
      133350,
      114600,
      95850,
      82050,
      68930,
      55800,
      42680
    ]
  },
  {
    "minSalary": 4520,
    "maxSalary": 4540,
    "taxByDependents": [
      265650,
      237250,
      173430,
      154680,
      135930,
      117180,
      98430,
      83860,
      70730,
      57610,
      44480
    ]
  },
  {
    "minSalary": 4540,
    "maxSalary": 4560,
    "taxByDependents": [
      268450,
      240040,
      176010,
      157260,
      138510,
      119760,
      101010,
      85670,
      72540,
      59420,
      46290
    ]
  },
  {
    "minSalary": 4560,
    "maxSalary": 4580,
    "taxByDependents": [
      271260,
      242830,
      178590,
      159840,
      141090,
      122340,
      103590,
      87470,
      74350,
      61220,
      48100
    ]
  },
  {
    "minSalary": 4580,
    "maxSalary": 4600,
    "taxByDependents": [
      276560,
      248120,
      183670,
      164920,
      146170,
      127420,
      108670,
      89920,
      76150,
      63030,
      49900
    ]
  },
  {
    "minSalary": 4600,
    "maxSalary": 4620,
    "taxByDependents": [
      279370,
      250910,
      186250,
      167500,
      148750,
      130000,
      111250,
      92500,
      77960,
      64830,
      51710
    ]
  },
  {
    "minSalary": 4620,
    "maxSalary": 4640,
    "taxByDependents": [
      282170,
      253700,
      188830,
      170080,
      151330,
      132580,
      113830,
      95080,
      79760,
      66640,
      53510
    ]
  },
  {
    "minSalary": 4640,
    "maxSalary": 4660,
    "taxByDependents": [
      284980,
      256490,
      191410,
      172660,
      153910,
      135160,
      116410,
      97660,
      81570,
      68450,
      55320
    ]
  },
  {
    "minSalary": 4660,
    "maxSalary": 4680,
    "taxByDependents": [
      287780,
      259280,
      193990,
      175240,
      156490,
      137740,
      118990,
      100240,
      83380,
      70250,
      57130
    ]
  },
  {
    "minSalary": 4680,
    "maxSalary": 4700,
    "taxByDependents": [
      290590,
      262070,
      196570,
      177820,
      159070,
      140320,
      121570,
      102820,
      85180,
      72060,
      58930
    ]
  },
  {
    "minSalary": 4700,
    "maxSalary": 4720,
    "taxByDependents": [
      293390,
      264860,
      199150,
      180400,
      161650,
      142900,
      124150,
      105400,
      86990,
      73860,
      60740
    ]
  },
  {
    "minSalary": 4720,
    "maxSalary": 4740,
    "taxByDependents": [
      296200,
      267650,
      201730,
      182980,
      164230,
      145480,
      126730,
      107980,
      89230,
      75670,
      62540
    ]
  },
  {
    "minSalary": 4740,
    "maxSalary": 4760,
    "taxByDependents": [
      299000,
      270440,
      204310,
      185560,
      166810,
      148060,
      129310,
      110560,
      91810,
      77480,
      64350
    ]
  },
  {
    "minSalary": 4760,
    "maxSalary": 4780,
    "taxByDependents": [
      301810,
      273230,
      206890,
      188140,
      169390,
      150640,
      131890,
      113140,
      94390,
      79280,
      66160
    ]
  },
  {
    "minSalary": 4780,
    "maxSalary": 4800,
    "taxByDependents": [
      304610,
      276020,
      209470,
      190720,
      171970,
      153220,
      134470,
      115720,
      96970,
      81090,
      67960
    ]
  },
  {
    "minSalary": 4800,
    "maxSalary": 4820,
    "taxByDependents": [
      307420,
      278810,
      212050,
      193300,
      174550,
      155800,
      137050,
      118300,
      99550,
      82890,
      69770
    ]
  },
  {
    "minSalary": 4820,
    "maxSalary": 4840,
    "taxByDependents": [
      310220,
      281600,
      214630,
      195880,
      177130,
      158380,
      139630,
      120880,
      102130,
      84700,
      71570
    ]
  },
  {
    "minSalary": 4840,
    "maxSalary": 4860,
    "taxByDependents": [
      313030,
      284390,
      217210,
      198460,
      179710,
      160960,
      142210,
      123460,
      104710,
      86510,
      73380
    ]
  },
  {
    "minSalary": 4860,
    "maxSalary": 4880,
    "taxByDependents": [
      315830,
      287180,
      219790,
      201040,
      182290,
      163540,
      144790,
      126040,
      107290,
      88540,
      75190
    ]
  },
  {
    "minSalary": 4880,
    "maxSalary": 4900,
    "taxByDependents": [
      318640,
      289970,
      222370,
      203620,
      184870,
      166120,
      147370,
      128620,
      109870,
      91120,
      76990
    ]
  },
  {
    "minSalary": 4900,
    "maxSalary": 4920,
    "taxByDependents": [
      321440,
      292760,
      224950,
      206200,
      187450,
      168700,
      149950,
      131200,
      112450,
      93700,
      78800
    ]
  },
  {
    "minSalary": 4920,
    "maxSalary": 4940,
    "taxByDependents": [
      324250,
      295550,
      227530,
      208780,
      190030,
      171280,
      152530,
      133780,
      115030,
      96280,
      80600
    ]
  },
  {
    "minSalary": 4940,
    "maxSalary": 4960,
    "taxByDependents": [
      327050,
      298340,
      230110,
      211360,
      192610,
      173860,
      155110,
      136360,
      117610,
      98860,
      82410
    ]
  },
  {
    "minSalary": 4960,
    "maxSalary": 4980,
    "taxByDependents": [
      329860,
      301130,
      232690,
      213940,
      195190,
      176440,
      157690,
      138940,
      120190,
      101440,
      84220
    ]
  },
  {
    "minSalary": 4980,
    "maxSalary": 5000,
    "taxByDependents": [
      332660,
      303920,
      235270,
      216520,
      197770,
      179020,
      160270,
      141520,
      122770,
      104020,
      86020
    ]
  },
  {
    "minSalary": 5000,
    "maxSalary": 5020,
    "taxByDependents": [
      335470,
      306710,
      237850,
      219100,
      200350,
      181600,
      162850,
      144100,
      125350,
      106600,
      87850
    ]
  },
  {
    "minSalary": 5020,
    "maxSalary": 5040,
    "taxByDependents": [
      338270,
      309500,
      240430,
      221680,
      202930,
      184180,
      165430,
      146680,
      127930,
      109180,
      90430
    ]
  },
  {
    "minSalary": 5040,
    "maxSalary": 5060,
    "taxByDependents": [
      341080,
      312290,
      243010,
      224260,
      205510,
      186760,
      168010,
      149260,
      130510,
      111760,
      93010
    ]
  },
  {
    "minSalary": 5060,
    "maxSalary": 5080,
    "taxByDependents": [
      343880,
      315080,
      245590,
      226840,
      208090,
      189340,
      170590,
      151840,
      133090,
      114340,
      95590
    ]
  },
  {
    "minSalary": 5080,
    "maxSalary": 5100,
    "taxByDependents": [
      346690,
      317870,
      248170,
      229420,
      210670,
      191920,
      173170,
      154420,
      135670,
      116920,
      98170
    ]
  },
  {
    "minSalary": 5100,
    "maxSalary": 5120,
    "taxByDependents": [
      349490,
      320660,
      250750,
      232000,
      213250,
      194500,
      175750,
      157000,
      138250,
      119500,
      100750
    ]
  },
  {
    "minSalary": 5120,
    "maxSalary": 5140,
    "taxByDependents": [
      352300,
      323450,
      253330,
      234580,
      215830,
      197080,
      178330,
      159580,
      140830,
      122080,
      103330
    ]
  },
  {
    "minSalary": 5140,
    "maxSalary": 5160,
    "taxByDependents": [
      355100,
      326240,
      255910,
      237160,
      218410,
      199660,
      180910,
      162160,
      143410,
      124660,
      105910
    ]
  },
  {
    "minSalary": 5160,
    "maxSalary": 5180,
    "taxByDependents": [
      357910,
      329030,
      258490,
      239740,
      220990,
      202240,
      183490,
      164740,
      145990,
      127240,
      108490
    ]
  },
  {
    "minSalary": 5180,
    "maxSalary": 5200,
    "taxByDependents": [
      360710,
      331820,
      261070,
      242320,
      223570,
      204820,
      186070,
      167320,
      148570,
      129820,
      111070
    ]
  },
  {
    "minSalary": 5200,
    "maxSalary": 5220,
    "taxByDependents": [
      363520,
      334610,
      263650,
      244900,
      226150,
      207400,
      188650,
      169900,
      151150,
      132400,
      113650
    ]
  },
  {
    "minSalary": 5220,
    "maxSalary": 5240,
    "taxByDependents": [
      366320,
      337400,
      266230,
      247480,
      228730,
      209980,
      191230,
      172480,
      153730,
      134980,
      116230
    ]
  },
  {
    "minSalary": 5240,
    "maxSalary": 5260,
    "taxByDependents": [
      369130,
      340190,
      268810,
      250060,
      231310,
      212560,
      193810,
      175060,
      156310,
      137560,
      118810
    ]
  },
  {
    "minSalary": 5260,
    "maxSalary": 5280,
    "taxByDependents": [
      371930,
      342980,
      271390,
      252640,
      233890,
      215140,
      196390,
      177640,
      158890,
      140140,
      121390
    ]
  },
  {
    "minSalary": 5280,
    "maxSalary": 5300,
    "taxByDependents": [
      374740,
      345770,
      273970,
      255220,
      236470,
      217720,
      198970,
      180220,
      161470,
      142720,
      123970
    ]
  },
  {
    "minSalary": 5300,
    "maxSalary": 5320,
    "taxByDependents": [
      377540,
      348560,
      276550,
      257800,
      239050,
      220300,
      201550,
      182800,
      164050,
      145300,
      126550
    ]
  },
  {
    "minSalary": 5320,
    "maxSalary": 5340,
    "taxByDependents": [
      380350,
      351350,
      279130,
      260380,
      241630,
      222880,
      204130,
      185380,
      166630,
      147880,
      129130
    ]
  },
  {
    "minSalary": 5340,
    "maxSalary": 5360,
    "taxByDependents": [
      383150,
      354140,
      281710,
      262960,
      244210,
      225460,
      206710,
      187960,
      169210,
      150460,
      131710
    ]
  },
  {
    "minSalary": 5360,
    "maxSalary": 5380,
    "taxByDependents": [
      385960,
      356930,
      284290,
      265540,
      246790,
      228040,
      209290,
      190540,
      171790,
      153040,
      134290
    ]
  },
  {
    "minSalary": 5380,
    "maxSalary": 5400,
    "taxByDependents": [
      388760,
      359720,
      286870,
      268120,
      249370,
      230620,
      211870,
      193120,
      174370,
      155620,
      136870
    ]
  },
  {
    "minSalary": 5400,
    "maxSalary": 5420,
    "taxByDependents": [
      391570,
      362510,
      289450,
      270700,
      251950,
      233200,
      214450,
      195700,
      176950,
      158200,
      139450
    ]
  },
  {
    "minSalary": 5420,
    "maxSalary": 5440,
    "taxByDependents": [
      394370,
      365300,
      292030,
      273280,
      254530,
      235780,
      217030,
      198280,
      179530,
      160780,
      142030
    ]
  },
  {
    "minSalary": 5440,
    "maxSalary": 5460,
    "taxByDependents": [
      397180,
      368090,
      294610,
      275860,
      257110,
      238360,
      219610,
      200860,
      182110,
      163360,
      144610
    ]
  },
  {
    "minSalary": 5460,
    "maxSalary": 5480,
    "taxByDependents": [
      399980,
      370880,
      297190,
      278440,
      259690,
      240940,
      222190,
      203440,
      184690,
      165940,
      147190
    ]
  },
  {
    "minSalary": 5480,
    "maxSalary": 5500,
    "taxByDependents": [
      402790,
      373670,
      299770,
      281020,
      262270,
      243520,
      224770,
      206020,
      187270,
      168520,
      149770
    ]
  },
  {
    "minSalary": 5500,
    "maxSalary": 5520,
    "taxByDependents": [
      405590,
      376460,
      302350,
      283600,
      264850,
      246100,
      227350,
      208600,
      189850,
      171100,
      152350
    ]
  },
  {
    "minSalary": 5520,
    "maxSalary": 5540,
    "taxByDependents": [
      408400,
      379250,
      304930,
      286180,
      267430,
      248680,
      229930,
      211180,
      192430,
      173680,
      154930
    ]
  },
  {
    "minSalary": 5540,
    "maxSalary": 5560,
    "taxByDependents": [
      411200,
      382040,
      307510,
      288760,
      270010,
      251260,
      232510,
      213760,
      195010,
      176260,
      157510
    ]
  },
  {
    "minSalary": 5560,
    "maxSalary": 5580,
    "taxByDependents": [
      414010,
      384830,
      310090,
      291340,
      272590,
      253840,
      235090,
      216340,
      197590,
      178840,
      160090
    ]
  },
  {
    "minSalary": 5580,
    "maxSalary": 5600,
    "taxByDependents": [
      416810,
      387620,
      312670,
      293920,
      275170,
      256420,
      237670,
      218920,
      200170,
      181420,
      162670
    ]
  },
  {
    "minSalary": 5600,
    "maxSalary": 5620,
    "taxByDependents": [
      419620,
      390410,
      315250,
      296500,
      277750,
      259000,
      240250,
      221500,
      202750,
      184000,
      165250
    ]
  },
  {
    "minSalary": 5620,
    "maxSalary": 5640,
    "taxByDependents": [
      422420,
      393200,
      317830,
      299080,
      280330,
      261580,
      242830,
      224080,
      205330,
      186580,
      167830
    ]
  },
  {
    "minSalary": 5640,
    "maxSalary": 5660,
    "taxByDependents": [
      425230,
      395990,
      320410,
      301660,
      282910,
      264160,
      245410,
      226660,
      207910,
      189160,
      170410
    ]
  },
  {
    "minSalary": 5660,
    "maxSalary": 5680,
    "taxByDependents": [
      428030,
      398780,
      322990,
      304240,
      285490,
      266740,
      247990,
      229240,
      210490,
      191740,
      172990
    ]
  },
  {
    "minSalary": 5680,
    "maxSalary": 5700,
    "taxByDependents": [
      430840,
      401570,
      325570,
      306820,
      288070,
      269320,
      250570,
      231820,
      213070,
      194320,
      175570
    ]
  },
  {
    "minSalary": 5700,
    "maxSalary": 5720,
    "taxByDependents": [
      433640,
      404360,
      328150,
      309400,
      290650,
      271900,
      253150,
      234400,
      215650,
      196900,
      178150
    ]
  },
  {
    "minSalary": 5720,
    "maxSalary": 5740,
    "taxByDependents": [
      436450,
      407150,
      330730,
      311980,
      293230,
      274480,
      255730,
      236980,
      218230,
      199480,
      180730
    ]
  },
  {
    "minSalary": 5740,
    "maxSalary": 5760,
    "taxByDependents": [
      439250,
      409940,
      333310,
      314560,
      295810,
      277060,
      258310,
      239560,
      220810,
      202060,
      183310
    ]
  },
  {
    "minSalary": 5760,
    "maxSalary": 5780,
    "taxByDependents": [
      442060,
      412730,
      335890,
      317140,
      298390,
      279640,
      260890,
      242140,
      223390,
      204640,
      185890
    ]
  },
  {
    "minSalary": 5780,
    "maxSalary": 5800,
    "taxByDependents": [
      444860,
      415520,
      338470,
      319720,
      300970,
      282220,
      263470,
      244720,
      225970,
      207220,
      188470
    ]
  },
  {
    "minSalary": 5800,
    "maxSalary": 5820,
    "taxByDependents": [
      447670,
      418310,
      341050,
      322300,
      303550,
      284800,
      266050,
      247300,
      228550,
      209800,
      191050
    ]
  },
  {
    "minSalary": 5820,
    "maxSalary": 5840,
    "taxByDependents": [
      450470,
      421100,
      343630,
      324880,
      306130,
      287380,
      268630,
      249880,
      231130,
      212380,
      193630
    ]
  },
  {
    "minSalary": 5840,
    "maxSalary": 5860,
    "taxByDependents": [
      470380,
      441000,
      372100,
      353350,
      334600,
      315850,
      297100,
      278350,
      259600,
      240850,
      222100
    ]
  },
  {
    "minSalary": 5860,
    "maxSalary": 5880,
    "taxByDependents": [
      475720,
      446320,
      377240,
      358490,
      339740,
      320990,
      302240,
      283490,
      264740,
      245990,
      227240
    ]
  },
  {
    "minSalary": 5880,
    "maxSalary": 5900,
    "taxByDependents": [
      478690,
      449140,
      379880,
      361130,
      342380,
      323630,
      304880,
      286130,
      267380,
      248630,
      229880
    ]
  },
  {
    "minSalary": 5900,
    "maxSalary": 5920,
    "taxByDependents": [
      483220,
      451960,
      382520,
      363770,
      345020,
      326270,
      307520,
      288770,
      270020,
      251270,
      232520
    ]
  },
  {
    "minSalary": 5920,
    "maxSalary": 5940,
    "taxByDependents": [
      487760,
      454780,
      385160,
      366410,
      347660,
      328910,
      310160,
      291410,
      272660,
      253910,
      235160
    ]
  },
  {
    "minSalary": 5940,
    "maxSalary": 5960,
    "taxByDependents": [
      492300,
      457600,
      387800,
      369050,
      350300,
      331550,
      312800,
      294050,
      275300,
      256550,
      237800
    ]
  },
  {
    "minSalary": 5960,
    "maxSalary": 5980,
    "taxByDependents": [
      496830,
      460420,
      390440,
      371690,
      352940,
      334190,
      315440,
      296690,
      277940,
      259190,
      240440
    ]
  },
  {
    "minSalary": 5980,
    "maxSalary": 6000,
    "taxByDependents": [
      501370,
      463240,
      393080,
      374330,
      355580,
      336830,
      318080,
      299330,
      280580,
      261830,
      243080
    ]
  },
  {
    "minSalary": 6000,
    "maxSalary": 6020,
    "taxByDependents": [
      505900,
      466060,
      395720,
      376970,
      358220,
      339470,
      320720,
      301970,
      283220,
      264470,
      245720
    ]
  },
  {
    "minSalary": 6020,
    "maxSalary": 6040,
    "taxByDependents": [
      510440,
      468880,
      398360,
      379610,
      360860,
      342110,
      323360,
      304610,
      285860,
      267110,
      248360
    ]
  },
  {
    "minSalary": 6040,
    "maxSalary": 6060,
    "taxByDependents": [
      514980,
      471700,
      401000,
      382250,
      363500,
      344750,
      326000,
      307250,
      288500,
      269750,
      251000
    ]
  },
  {
    "minSalary": 6060,
    "maxSalary": 6080,
    "taxByDependents": [
      519510,
      474520,
      403640,
      384890,
      366140,
      347390,
      328640,
      309890,
      291140,
      272390,
      253640
    ]
  },
  {
    "minSalary": 6080,
    "maxSalary": 6100,
    "taxByDependents": [
      524050,
      477340,
      406280,
      387530,
      368780,
      350030,
      331280,
      312530,
      293780,
      275030,
      256280
    ]
  },
  {
    "minSalary": 6100,
    "maxSalary": 6120,
    "taxByDependents": [
      528580,
      481250,
      408920,
      390170,
      371420,
      352670,
      333920,
      315170,
      296420,
      277670,
      258920
    ]
  },
  {
    "minSalary": 6120,
    "maxSalary": 6140,
    "taxByDependents": [
      533120,
      485760,
      411560,
      392810,
      374060,
      355310,
      336560,
      317810,
      299060,
      280310,
      261560
    ]
  },
  {
    "minSalary": 6140,
    "maxSalary": 6160,
    "taxByDependents": [
      537660,
      490280,
      414200,
      395450,
      376700,
      357950,
      339200,
      320450,
      301700,
      282950,
      264200
    ]
  },
  {
    "minSalary": 6160,
    "maxSalary": 6180,
    "taxByDependents": [
      542190,
      494790,
      416840,
      398090,
      379340,
      360590,
      341840,
      323090,
      304340,
      285590,
      266840
    ]
  },
  {
    "minSalary": 6180,
    "maxSalary": 6200,
    "taxByDependents": [
      546730,
      499300,
      419480,
      400730,
      381980,
      363230,
      344480,
      325730,
      306980,
      288230,
      269480
    ]
  },
  {
    "minSalary": 6200,
    "maxSalary": 6220,
    "taxByDependents": [
      551260,
      503810,
      422120,
      403370,
      384620,
      365870,
      347120,
      328370,
      309620,
      290870,
      272120
    ]
  },
  {
    "minSalary": 6220,
    "maxSalary": 6240,
    "taxByDependents": [
      555800,
      508320,
      424760,
      406010,
      387260,
      368510,
      349760,
      331010,
      312260,
      293510,
      274760
    ]
  },
  {
    "minSalary": 6240,
    "maxSalary": 6260,
    "taxByDependents": [
      560340,
      512840,
      427400,
      408650,
      389900,
      371150,
      352400,
      333650,
      314900,
      296150,
      277400
    ]
  },
  {
    "minSalary": 6260,
    "maxSalary": 6280,
    "taxByDependents": [
      564870,
      517350,
      430040,
      411290,
      392540,
      373790,
      355040,
      336290,
      317540,
      298790,
      280040
    ]
  },
  {
    "minSalary": 6280,
    "maxSalary": 6300,
    "taxByDependents": [
      569410,
      521860,
      432680,
      413930,
      395180,
      376430,
      357680,
      338930,
      320180,
      301430,
      282680
    ]
  },
  {
    "minSalary": 6300,
    "maxSalary": 6320,
    "taxByDependents": [
      573940,
      526370,
      435320,
      416570,
      397820,
      379070,
      360320,
      341570,
      322820,
      304070,
      285320
    ]
  },
  {
    "minSalary": 6320,
    "maxSalary": 6340,
    "taxByDependents": [
      578480,
      530880,
      437960,
      419210,
      400460,
      381710,
      362960,
      344210,
      325460,
      306710,
      287960
    ]
  },
  {
    "minSalary": 6340,
    "maxSalary": 6360,
    "taxByDependents": [
      583020,
      535400,
      440600,
      421850,
      403100,
      384350,
      365600,
      346850,
      328100,
      309350,
      290600
    ]
  },
  {
    "minSalary": 6360,
    "maxSalary": 6380,
    "taxByDependents": [
      587550,
      539910,
      443240,
      424490,
      405740,
      386990,
      368240,
      349490,
      330740,
      311990,
      293240
    ]
  },
  {
    "minSalary": 6380,
    "maxSalary": 6400,
    "taxByDependents": [
      592090,
      544420,
      445880,
      427130,
      408380,
      389630,
      370880,
      352130,
      333380,
      314630,
      295880
    ]
  },
  {
    "minSalary": 6400,
    "maxSalary": 6420,
    "taxByDependents": [
      596620,
      548930,
      448520,
      429770,
      411020,
      392270,
      373520,
      354770,
      336020,
      317270,
      298520
    ]
  },
  {
    "minSalary": 6420,
    "maxSalary": 6440,
    "taxByDependents": [
      601160,
      553440,
      451160,
      432410,
      413660,
      394910,
      376160,
      357410,
      338660,
      319910,
      301160
    ]
  },
  {
    "minSalary": 6440,
    "maxSalary": 6460,
    "taxByDependents": [
      605700,
      557960,
      453800,
      435050,
      416300,
      397550,
      378800,
      360050,
      341300,
      322550,
      303800
    ]
  },
  {
    "minSalary": 6460,
    "maxSalary": 6480,
    "taxByDependents": [
      610230,
      562470,
      456440,
      437690,
      418940,
      400190,
      381440,
      362690,
      343940,
      325190,
      306440
    ]
  },
  {
    "minSalary": 6480,
    "maxSalary": 6500,
    "taxByDependents": [
      614770,
      566980,
      459080,
      440330,
      421580,
      402830,
      384080,
      365330,
      346580,
      327830,
      309080
    ]
  },
  {
    "minSalary": 6500,
    "maxSalary": 6520,
    "taxByDependents": [
      619300,
      571490,
      461720,
      442970,
      424220,
      405470,
      386720,
      367970,
      349220,
      330470,
      311720
    ]
  },
  {
    "minSalary": 6520,
    "maxSalary": 6540,
    "taxByDependents": [
      623840,
      576000,
      464360,
      445610,
      426860,
      408110,
      389360,
      370610,
      351860,
      333110,
      314360
    ]
  },
  {
    "minSalary": 6540,
    "maxSalary": 6560,
    "taxByDependents": [
      628380,
      580520,
      467000,
      448250,
      429500,
      410750,
      392000,
      373250,
      354500,
      335750,
      317000
    ]
  },
  {
    "minSalary": 6560,
    "maxSalary": 6580,
    "taxByDependents": [
      632910,
      585030,
      469640,
      450890,
      432140,
      413390,
      394640,
      375890,
      357140,
      338390,
      319640
    ]
  },
  {
    "minSalary": 6580,
    "maxSalary": 6600,
    "taxByDependents": [
      637450,
      589540,
      472280,
      453530,
      434780,
      416030,
      397280,
      378530,
      359780,
      341030,
      322280
    ]
  },
  {
    "minSalary": 6600,
    "maxSalary": 6620,
    "taxByDependents": [
      641980,
      594050,
      474920,
      456170,
      437420,
      418670,
      399920,
      381170,
      362420,
      343670,
      324920
    ]
  },
  {
    "minSalary": 6620,
    "maxSalary": 6640,
    "taxByDependents": [
      646520,
      598560,
      477560,
      458810,
      440060,
      421310,
      402560,
      383810,
      365060,
      346310,
      327560
    ]
  },
  {
    "minSalary": 6640,
    "maxSalary": 6660,
    "taxByDependents": [
      651060,
      603080,
      481320,
      461450,
      442700,
      423950,
      405200,
      386450,
      367700,
      348950,
      330200
    ]
  },
  {
    "minSalary": 6660,
    "maxSalary": 6680,
    "taxByDependents": [
      655590,
      607590,
      485540,
      464090,
      445340,
      426590,
      407840,
      389090,
      370340,
      351590,
      332840
    ]
  },
  {
    "minSalary": 6680,
    "maxSalary": 6700,
    "taxByDependents": [
      660130,
      612100,
      489760,
      466730,
      447980,
      429230,
      410480,
      391730,
      372980,
      354230,
      335480
    ]
  },
  {
    "minSalary": 6700,
    "maxSalary": 6720,
    "taxByDependents": [
      664660,
      616610,
      493990,
      469370,
      450620,
      431870,
      413120,
      394370,
      375620,
      356870,
      338120
    ]
  },
  {
    "minSalary": 6720,
    "maxSalary": 6740,
    "taxByDependents": [
      669200,
      621120,
      498210,
      472010,
      453260,
      434510,
      415760,
      397010,
      378260,
      359510,
      340760
    ]
  },
  {
    "minSalary": 6740,
    "maxSalary": 6760,
    "taxByDependents": [
      673740,
      625640,
      502440,
      474650,
      455900,
      437150,
      418400,
      399650,
      380900,
      362150,
      343400
    ]
  },
  {
    "minSalary": 6760,
    "maxSalary": 6780,
    "taxByDependents": [
      678270,
      630150,
      506660,
      477290,
      458540,
      439790,
      421040,
      402290,
      383540,
      364790,
      346040
    ]
  },
  {
    "minSalary": 6780,
    "maxSalary": 6800,
    "taxByDependents": [
      682810,
      634660,
      510880,
      480880,
      461180,
      442430,
      423680,
      404930,
      386180,
      367430,
      348680
    ]
  },
  {
    "minSalary": 6800,
    "maxSalary": 6820,
    "taxByDependents": [
      687340,
      639170,
      515110,
      485110,
      463820,
      445070,
      426320,
      407570,
      388820,
      370070,
      351320
    ]
  },
  {
    "minSalary": 6820,
    "maxSalary": 6840,
    "taxByDependents": [
      691880,
      643680,
      519330,
      489330,
      466460,
      447710,
      428960,
      410210,
      391460,
      372710,
      353960
    ]
  },
  {
    "minSalary": 6840,
    "maxSalary": 6860,
    "taxByDependents": [
      696420,
      648200,
      523560,
      493560,
      469100,
      450350,
      431600,
      412850,
      394100,
      375350,
      356600
    ]
  },
  {
    "minSalary": 6860,
    "maxSalary": 6880,
    "taxByDependents": [
      700950,
      652710,
      527780,
      497780,
      471740,
      452990,
      434240,
      415490,
      396740,
      377990,
      359240
    ]
  },
  {
    "minSalary": 6880,
    "maxSalary": 6900,
    "taxByDependents": [
      705490,
      657220,
      532000,
      502000,
      474380,
      455630,
      436880,
      418130,
      399380,
      380630,
      361880
    ]
  },
  {
    "minSalary": 6900,
    "maxSalary": 6920,
    "taxByDependents": [
      710020,
      661730,
      536230,
      506230,
      477020,
      458270,
      439520,
      420770,
      402020,
      383270,
      364520
    ]
  },
  {
    "minSalary": 6920,
    "maxSalary": 6940,
    "taxByDependents": [
      714560,
      666240,
      540450,
      510450,
      480450,
      460910,
      442160,
      423410,
      404660,
      385910,
      367160
    ]
  },
  {
    "minSalary": 6940,
    "maxSalary": 6960,
    "taxByDependents": [
      719100,
      670760,
      544680,
      514680,
      484680,
      463550,
      444800,
      426050,
      407300,
      388550,
      369800
    ]
  },
  {
    "minSalary": 6960,
    "maxSalary": 6980,
    "taxByDependents": [
      723630,
      675270,
      548900,
      518900,
      488900,
      466190,
      447440,
      428690,
      409940,
      391190,
      372440
    ]
  },
  {
    "minSalary": 6980,
    "maxSalary": 7000,
    "taxByDependents": [
      728170,
      679780,
      553120,
      523120,
      493120,
      468830,
      450080,
      431330,
      412580,
      393830,
      375080
    ]
  },
  {
    "minSalary": 7000,
    "maxSalary": 7020,
    "taxByDependents": [
      732700,
      684290,
      557350,
      527350,
      497350,
      471470,
      452720,
      433970,
      415220,
      396470,
      377720
    ]
  },
  {
    "minSalary": 7020,
    "maxSalary": 7040,
    "taxByDependents": [
      737240,
      688800,
      561570,
      531570,
      501570,
      474110,
      455360,
      436610,
      417860,
      399110,
      380360
    ]
  },
  {
    "minSalary": 7040,
    "maxSalary": 7060,
    "taxByDependents": [
      741780,
      693320,
      565800,
      535800,
      505800,
      476750,
      458000,
      439250,
      420500,
      401750,
      383000
    ]
  },
  {
    "minSalary": 7060,
    "maxSalary": 7080,
    "taxByDependents": [
      746310,
      697830,
      570020,
      540020,
      510020,
      480020,
      460640,
      441890,
      423140,
      404390,
      385640
    ]
  },
  {
    "minSalary": 7080,
    "maxSalary": 7100,
    "taxByDependents": [
      750850,
      702340,
      574240,
      544240,
      514240,
      484240,
      463280,
      444530,
      425780,
      407030,
      388280
    ]
  },
  {
    "minSalary": 7100,
    "maxSalary": 7120,
    "taxByDependents": [
      755380,
      706850,
      578470,
      548470,
      518470,
      488470,
      465920,
      447170,
      428420,
      409670,
      390920
    ]
  },
  {
    "minSalary": 7120,
    "maxSalary": 7140,
    "taxByDependents": [
      759920,
      711360,
      582690,
      552690,
      522690,
      492690,
      468560,
      449810,
      431060,
      412310,
      393560
    ]
  },
  {
    "minSalary": 7140,
    "maxSalary": 7160,
    "taxByDependents": [
      764460,
      715880,
      586920,
      556920,
      526920,
      496920,
      471200,
      452450,
      433700,
      414950,
      396200
    ]
  },
  {
    "minSalary": 7160,
    "maxSalary": 7180,
    "taxByDependents": [
      768990,
      720390,
      591140,
      561140,
      531140,
      501140,
      473840,
      455090,
      436340,
      417590,
      398840
    ]
  },
  {
    "minSalary": 7180,
    "maxSalary": 7200,
    "taxByDependents": [
      773530,
      724900,
      595360,
      565360,
      535360,
      505360,
      476480,
      457730,
      438980,
      420230,
      401480
    ]
  },
  {
    "minSalary": 7200,
    "maxSalary": 7220,
    "taxByDependents": [
      778060,
      729410,
      599590,
      569590,
      539590,
      509590,
      479590,
      460370,
      441620,
      422870,
      404120
    ]
  },
  {
    "minSalary": 7220,
    "maxSalary": 7240,
    "taxByDependents": [
      782600,
      733920,
      603810,
      573810,
      543810,
      513810,
      483810,
      463010,
      444260,
      425510,
      406760
    ]
  },
  {
    "minSalary": 7240,
    "maxSalary": 7260,
    "taxByDependents": [
      787140,
      738440,
      608040,
      578040,
      548040,
      518040,
      488040,
      465650,
      446900,
      428150,
      409400
    ]
  },
  {
    "minSalary": 7260,
    "maxSalary": 7280,
    "taxByDependents": [
      791670,
      742950,
      612260,
      582260,
      552260,
      522260,
      492260,
      468290,
      449540,
      430790,
      412040
    ]
  },
  {
    "minSalary": 7280,
    "maxSalary": 7300,
    "taxByDependents": [
      796210,
      747460,
      616480,
      586480,
      556480,
      526480,
      496480,
      470930,
      452180,
      433430,
      414680
    ]
  },
  {
    "minSalary": 7300,
    "maxSalary": 7320,
    "taxByDependents": [
      800740,
      751970,
      620710,
      590710,
      560710,
      530710,
      500710,
      473570,
      454820,
      436070,
      417320
    ]
  },
  {
    "minSalary": 7320,
    "maxSalary": 7340,
    "taxByDependents": [
      805280,
      756480,
      624930,
      594930,
      564930,
      534930,
      504930,
      476210,
      457460,
      438710,
      419960
    ]
  },
  {
    "minSalary": 7340,
    "maxSalary": 7360,
    "taxByDependents": [
      809820,
      761000,
      629160,
      599160,
      569160,
      539160,
      509160,
      479160,
      460100,
      441350,
      422600
    ]
  },
  {
    "minSalary": 7360,
    "maxSalary": 7380,
    "taxByDependents": [
      814350,
      765510,
      633380,
      603380,
      573380,
      543380,
      513380,
      483380,
      462740,
      443990,
      425240
    ]
  },
  {
    "minSalary": 7380,
    "maxSalary": 7400,
    "taxByDependents": [
      818890,
      770020,
      637600,
      607600,
      577600,
      547600,
      517600,
      487600,
      465380,
      446630,
      427880
    ]
  },
  {
    "minSalary": 7400,
    "maxSalary": 7420,
    "taxByDependents": [
      823420,
      774530,
      641830,
      611830,
      581830,
      551830,
      521830,
      491830,
      468020,
      449270,
      430520
    ]
  },
  {
    "minSalary": 7420,
    "maxSalary": 7440,
    "taxByDependents": [
      827960,
      779040,
      646050,
      616050,
      586050,
      556050,
      526050,
      496050,
      470660,
      451910,
      433160
    ]
  },
  {
    "minSalary": 7440,
    "maxSalary": 7460,
    "taxByDependents": [
      832500,
      783560,
      650280,
      620280,
      590280,
      560280,
      530280,
      500280,
      473300,
      454550,
      435800
    ]
  },
  {
    "minSalary": 7460,
    "maxSalary": 7480,
    "taxByDependents": [
      837030,
      788070,
      654500,
      624500,
      594500,
      564500,
      534500,
      504500,
      475940,
      457190,
      438440
    ]
  },
  {
    "minSalary": 7480,
    "maxSalary": 7500,
    "taxByDependents": [
      841570,
      792580,
      658720,
      628720,
      598720,
      568720,
      538720,
      508720,
      478720,
      459830,
      441080
    ]
  },
  {
    "minSalary": 7500,
    "maxSalary": 7520,
    "taxByDependents": [
      846100,
      797090,
      662950,
      632950,
      602950,
      572950,
      542950,
      512950,
      482950,
      462470,
      443720
    ]
  },
  {
    "minSalary": 7520,
    "maxSalary": 7540,
    "taxByDependents": [
      850640,
      801600,
      667170,
      637170,
      607170,
      577170,
      547170,
      517170,
      487170,
      465110,
      446360
    ]
  },
  {
    "minSalary": 7540,
    "maxSalary": 7560,
    "taxByDependents": [
      855180,
      806120,
      671400,
      641400,
      611400,
      581400,
      551400,
      521400,
      491400,
      467750,
      449000
    ]
  },
  {
    "minSalary": 7560,
    "maxSalary": 7580,
    "taxByDependents": [
      859710,
      810630,
      675620,
      645620,
      615620,
      585620,
      555620,
      525620,
      495620,
      470390,
      451640
    ]
  },
  {
    "minSalary": 7580,
    "maxSalary": 7600,
    "taxByDependents": [
      864250,
      815140,
      679840,
      649840,
      619840,
      589840,
      559840,
      529840,
      499840,
      473030,
      454280
    ]
  },
  {
    "minSalary": 7600,
    "maxSalary": 7620,
    "taxByDependents": [
      868780,
      819650,
      684070,
      654070,
      624070,
      594070,
      564070,
      534070,
      504070,
      475670,
      456920
    ]
  },
  {
    "minSalary": 7620,
    "maxSalary": 7640,
    "taxByDependents": [
      873320,
      824160,
      688290,
      658290,
      628290,
      598290,
      568290,
      538290,
      508290,
      478310,
      459560
    ]
  },
  {
    "minSalary": 7640,
    "maxSalary": 7660,
    "taxByDependents": [
      877860,
      828680,
      692520,
      662520,
      632520,
      602520,
      572520,
      542520,
      512520,
      482520,
      462200
    ]
  },
  {
    "minSalary": 7660,
    "maxSalary": 7680,
    "taxByDependents": [
      882390,
      833190,
      696740,
      666740,
      636740,
      606740,
      576740,
      546740,
      516740,
      486740,
      464840
    ]
  },
  {
    "minSalary": 7680,
    "maxSalary": 7700,
    "taxByDependents": [
      886930,
      837700,
      700960,
      670960,
      640960,
      610960,
      580960,
      550960,
      520960,
      490960,
      467480
    ]
  },
  {
    "minSalary": 7700,
    "maxSalary": 7720,
    "taxByDependents": [
      891460,
      842210,
      705190,
      675190,
      645190,
      615190,
      585190,
      555190,
      525190,
      495190,
      470120
    ]
  },
  {
    "minSalary": 7720,
    "maxSalary": 7740,
    "taxByDependents": [
      896000,
      846720,
      709410,
      679410,
      649410,
      619410,
      589410,
      559410,
      529410,
      499410,
      472760
    ]
  },
  {
    "minSalary": 7740,
    "maxSalary": 7760,
    "taxByDependents": [
      900540,
      851240,
      713640,
      683640,
      653640,
      623640,
      593640,
      563640,
      533640,
      503640,
      475400
    ]
  },
  {
    "minSalary": 7760,
    "maxSalary": 7780,
    "taxByDependents": [
      905070,
      855750,
      717860,
      687860,
      657860,
      627860,
      597860,
      567860,
      537860,
      507860,
      478040
    ]
  },
  {
    "minSalary": 7780,
    "maxSalary": 7800,
    "taxByDependents": [
      909610,
      860260,
      722080,
      692080,
      662080,
      632080,
      602080,
      572080,
      542080,
      512080,
      482080
    ]
  },
  {
    "minSalary": 7800,
    "maxSalary": 7820,
    "taxByDependents": [
      914140,
      864770,
      726310,
      696310,
      666310,
      636310,
      606310,
      576310,
      546310,
      516310,
      486310
    ]
  },
  {
    "minSalary": 7820,
    "maxSalary": 7840,
    "taxByDependents": [
      918680,
      869280,
      730530,
      700530,
      670530,
      640530,
      610530,
      580530,
      550530,
      520530,
      490530
    ]
  },
  {
    "minSalary": 7840,
    "maxSalary": 7860,
    "taxByDependents": [
      923220,
      873800,
      734760,
      704760,
      674760,
      644760,
      614760,
      584760,
      554760,
      524760,
      494760
    ]
  },
  {
    "minSalary": 7860,
    "maxSalary": 7880,
    "taxByDependents": [
      927750,
      878310,
      738980,
      708980,
      678980,
      648980,
      618980,
      588980,
      558980,
      528980,
      498980
    ]
  },
  {
    "minSalary": 7880,
    "maxSalary": 7900,
    "taxByDependents": [
      932290,
      882820,
      743200,
      713200,
      683200,
      653200,
      623200,
      593200,
      563200,
      533200,
      503200
    ]
  },
  {
    "minSalary": 7900,
    "maxSalary": 7920,
    "taxByDependents": [
      936820,
      887330,
      747430,
      717430,
      687430,
      657430,
      627430,
      597430,
      567430,
      537430,
      507430
    ]
  },
  {
    "minSalary": 7920,
    "maxSalary": 7940,
    "taxByDependents": [
      941360,
      891840,
      751650,
      721650,
      691650,
      661650,
      631650,
      601650,
      571650,
      541650,
      511650
    ]
  },
  {
    "minSalary": 7940,
    "maxSalary": 7960,
    "taxByDependents": [
      945900,
      896360,
      755880,
      725880,
      695880,
      665880,
      635880,
      605880,
      575880,
      545880,
      515880
    ]
  },
  {
    "minSalary": 7960,
    "maxSalary": 7980,
    "taxByDependents": [
      950430,
      900870,
      760100,
      730100,
      700100,
      670100,
      640100,
      610100,
      580100,
      550100,
      520100
    ]
  },
  {
    "minSalary": 7980,
    "maxSalary": 8000,
    "taxByDependents": [
      954970,
      905380,
      764320,
      734320,
      704320,
      674320,
      644320,
      614320,
      584320,
      554320,
      524320
    ]
  },
  {
    "minSalary": 8000,
    "maxSalary": 8020,
    "taxByDependents": [
      959500,
      909890,
      768550,
      738550,
      708550,
      678550,
      648550,
      618550,
      588550,
      558550,
      528550
    ]
  },
  {
    "minSalary": 8020,
    "maxSalary": 8040,
    "taxByDependents": [
      964040,
      914400,
      772770,
      742770,
      712770,
      682770,
      652770,
      622770,
      592770,
      562770,
      532770
    ]
  },
  {
    "minSalary": 8040,
    "maxSalary": 8060,
    "taxByDependents": [
      968580,
      918920,
      777000,
      747000,
      717000,
      687000,
      657000,
      627000,
      597000,
      567000,
      537000
    ]
  },
  {
    "minSalary": 8060,
    "maxSalary": 8080,
    "taxByDependents": [
      973110,
      923430,
      781220,
      751220,
      721220,
      691220,
      661220,
      631220,
      601220,
      571220,
      541220
    ]
  },
  {
    "minSalary": 8080,
    "maxSalary": 8100,
    "taxByDependents": [
      977650,
      927940,
      785440,
      755440,
      725440,
      695440,
      665440,
      635440,
      605440,
      575440,
      545440
    ]
  },
  {
    "minSalary": 8100,
    "maxSalary": 8120,
    "taxByDependents": [
      982180,
      932450,
      789670,
      759670,
      729670,
      699670,
      669670,
      639670,
      609670,
      579670,
      549670
    ]
  },
  {
    "minSalary": 8120,
    "maxSalary": 8140,
    "taxByDependents": [
      986720,
      936960,
      793890,
      763890,
      733890,
      703890,
      673890,
      643890,
      613890,
      583890,
      553890
    ]
  },
  {
    "minSalary": 8140,
    "maxSalary": 8160,
    "taxByDependents": [
      991260,
      941480,
      798120,
      768120,
      738120,
      708120,
      678120,
      648120,
      618120,
      588120,
      558120
    ]
  },
  {
    "minSalary": 8160,
    "maxSalary": 8180,
    "taxByDependents": [
      995790,
      945990,
      802340,
      772340,
      742340,
      712340,
      682340,
      652340,
      622340,
      592340,
      562340
    ]
  },
  {
    "minSalary": 8180,
    "maxSalary": 8200,
    "taxByDependents": [
      1000330,
      950500,
      806560,
      776560,
      746560,
      716560,
      686560,
      656560,
      626560,
      596560,
      566560
    ]
  },
  {
    "minSalary": 8200,
    "maxSalary": 8220,
    "taxByDependents": [
      1004860,
      955010,
      810790,
      780790,
      750790,
      720790,
      690790,
      660790,
      630790,
      600790,
      570790
    ]
  },
  {
    "minSalary": 8220,
    "maxSalary": 8240,
    "taxByDependents": [
      1009400,
      959520,
      815010,
      785010,
      755010,
      725010,
      695010,
      665010,
      635010,
      605010,
      575010
    ]
  },
  {
    "minSalary": 8240,
    "maxSalary": 8260,
    "taxByDependents": [
      1013940,
      964040,
      819240,
      789240,
      759240,
      729240,
      699240,
      669240,
      639240,
      609240,
      579240
    ]
  },
  {
    "minSalary": 8260,
    "maxSalary": 8280,
    "taxByDependents": [
      1018470,
      968550,
      823460,
      793460,
      763460,
      733460,
      703460,
      673460,
      643460,
      613460,
      583460
    ]
  },
  {
    "minSalary": 8280,
    "maxSalary": 8300,
    "taxByDependents": [
      1023010,
      973060,
      827680,
      797680,
      767680,
      737680,
      707680,
      677680,
      647680,
      617680,
      587680
    ]
  },
  {
    "minSalary": 8300,
    "maxSalary": 8320,
    "taxByDependents": [
      1027540,
      977570,
      831910,
      801910,
      771910,
      741910,
      711910,
      681910,
      651910,
      621910,
      591910
    ]
  },
  {
    "minSalary": 8320,
    "maxSalary": 8340,
    "taxByDependents": [
      1032080,
      982080,
      836130,
      806130,
      776130,
      746130,
      716130,
      686130,
      656130,
      626130,
      596130
    ]
  },
  {
    "minSalary": 8340,
    "maxSalary": 8360,
    "taxByDependents": [
      1036740,
      986720,
      840480,
      810480,
      780480,
      750480,
      720480,
      690480,
      660480,
      630480,
      600480
    ]
  },
  {
    "minSalary": 8360,
    "maxSalary": 8380,
    "taxByDependents": [
      1041420,
      991370,
      844840,
      814840,
      784840,
      754840,
      724840,
      694840,
      664840,
      634840,
      604840
    ]
  },
  {
    "minSalary": 8380,
    "maxSalary": 8400,
    "taxByDependents": [
      1046100,
      996030,
      849210,
      819210,
      789210,
      759210,
      729210,
      699210,
      669210,
      639210,
      609210
    ]
  },
  {
    "minSalary": 8400,
    "maxSalary": 8420,
    "taxByDependents": [
      1050780,
      1000680,
      853580,
      823580,
      793580,
      763580,
      733580,
      703580,
      673580,
      643580,
      613580
    ]
  },
  {
    "minSalary": 8420,
    "maxSalary": 8440,
    "taxByDependents": [
      1055460,
      1005340,
      857950,
      827950,
      797950,
      767950,
      737950,
      707950,
      677950,
      647950,
      617950
    ]
  },
  {
    "minSalary": 8440,
    "maxSalary": 8460,
    "taxByDependents": [
      1060140,
      1010000,
      862320,
      832320,
      802320,
      772320,
      742320,
      712320,
      682320,
      652320,
      622320
    ]
  },
  {
    "minSalary": 8460,
    "maxSalary": 8480,
    "taxByDependents": [
      1064820,
      1014650,
      866680,
      836680,
      806680,
      776680,
      746680,
      716680,
      686680,
      656680,
      626680
    ]
  },
  {
    "minSalary": 8480,
    "maxSalary": 8500,
    "taxByDependents": [
      1069500,
      1019310,
      871050,
      841050,
      811050,
      781050,
      751050,
      721050,
      691050,
      661050,
      631050
    ]
  },
  {
    "minSalary": 8500,
    "maxSalary": 8520,
    "taxByDependents": [
      1074180,
      1023960,
      875420,
      845420,
      815420,
      785420,
      755420,
      725420,
      695420,
      665420,
      635420
    ]
  },
  {
    "minSalary": 8520,
    "maxSalary": 8540,
    "taxByDependents": [
      1078860,
      1028620,
      879790,
      849790,
      819790,
      789790,
      759790,
      729790,
      699790,
      669790,
      639790
    ]
  },
  {
    "minSalary": 8540,
    "maxSalary": 8560,
    "taxByDependents": [
      1083540,
      1033280,
      884160,
      854160,
      824160,
      794160,
      764160,
      734160,
      704160,
      674160,
      644160
    ]
  },
  {
    "minSalary": 8560,
    "maxSalary": 8580,
    "taxByDependents": [
      1088220,
      1037930,
      888520,
      858520,
      828520,
      798520,
      768520,
      738520,
      708520,
      678520,
      648520
    ]
  },
  {
    "minSalary": 8580,
    "maxSalary": 8600,
    "taxByDependents": [
      1092900,
      1042590,
      892890,
      862890,
      832890,
      802890,
      772890,
      742890,
      712890,
      682890,
      652890
    ]
  },
  {
    "minSalary": 8600,
    "maxSalary": 8620,
    "taxByDependents": [
      1097580,
      1047240,
      897260,
      867260,
      837260,
      807260,
      777260,
      747260,
      717260,
      687260,
      657260
    ]
  },
  {
    "minSalary": 8620,
    "maxSalary": 8640,
    "taxByDependents": [
      1102260,
      1051900,
      901630,
      871630,
      841630,
      811630,
      781630,
      751630,
      721630,
      691630,
      661630
    ]
  },
  {
    "minSalary": 8640,
    "maxSalary": 8660,
    "taxByDependents": [
      1106940,
      1056560,
      906000,
      876000,
      846000,
      816000,
      786000,
      756000,
      726000,
      696000,
      666000
    ]
  },
  {
    "minSalary": 8660,
    "maxSalary": 8680,
    "taxByDependents": [
      1111620,
      1061210,
      910360,
      880360,
      850360,
      820360,
      790360,
      760360,
      730360,
      700360,
      670360
    ]
  },
  {
    "minSalary": 8680,
    "maxSalary": 8700,
    "taxByDependents": [
      1116300,
      1065870,
      914730,
      884730,
      854730,
      824730,
      794730,
      764730,
      734730,
      704730,
      674730
    ]
  },
  {
    "minSalary": 8700,
    "maxSalary": 8720,
    "taxByDependents": [
      1120980,
      1070520,
      919100,
      889100,
      859100,
      829100,
      799100,
      769100,
      739100,
      709100,
      679100
    ]
  },
  {
    "minSalary": 8720,
    "maxSalary": 8740,
    "taxByDependents": [
      1125660,
      1075180,
      923470,
      893470,
      863470,
      833470,
      803470,
      773470,
      743470,
      713470,
      683470
    ]
  },
  {
    "minSalary": 8740,
    "maxSalary": 8760,
    "taxByDependents": [
      1130340,
      1079840,
      927840,
      897840,
      867840,
      837840,
      807840,
      777840,
      747840,
      717840,
      687840
    ]
  },
  {
    "minSalary": 8760,
    "maxSalary": 8780,
    "taxByDependents": [
      1135020,
      1084490,
      932200,
      902200,
      872200,
      842200,
      812200,
      782200,
      752200,
      722200,
      692200
    ]
  },
  {
    "minSalary": 8780,
    "maxSalary": 8800,
    "taxByDependents": [
      1139700,
      1089150,
      936570,
      906570,
      876570,
      846570,
      816570,
      786570,
      756570,
      726570,
      696570
    ]
  },
  {
    "minSalary": 8800,
    "maxSalary": 8820,
    "taxByDependents": [
      1144380,
      1093800,
      940940,
      910940,
      880940,
      850940,
      820940,
      790940,
      760940,
      730940,
      700940
    ]
  },
  {
    "minSalary": 8820,
    "maxSalary": 8840,
    "taxByDependents": [
      1149060,
      1098460,
      945310,
      915310,
      885310,
      855310,
      825310,
      795310,
      765310,
      735310,
      705310
    ]
  },
  {
    "minSalary": 8840,
    "maxSalary": 8860,
    "taxByDependents": [
      1153740,
      1103120,
      949680,
      919680,
      889680,
      859680,
      829680,
      799680,
      769680,
      739680,
      709680
    ]
  },
  {
    "minSalary": 8860,
    "maxSalary": 8880,
    "taxByDependents": [
      1158420,
      1107770,
      954040,
      924040,
      894040,
      864040,
      834040,
      804040,
      774040,
      744040,
      714040
    ]
  },
  {
    "minSalary": 8880,
    "maxSalary": 8900,
    "taxByDependents": [
      1163100,
      1112430,
      958410,
      928410,
      898410,
      868410,
      838410,
      808410,
      778410,
      748410,
      718410
    ]
  },
  {
    "minSalary": 8900,
    "maxSalary": 8920,
    "taxByDependents": [
      1167780,
      1117080,
      962780,
      932780,
      902780,
      872780,
      842780,
      812780,
      782780,
      752780,
      722780
    ]
  },
  {
    "minSalary": 8920,
    "maxSalary": 8940,
    "taxByDependents": [
      1172460,
      1121740,
      967150,
      937150,
      907150,
      877150,
      847150,
      817150,
      787150,
      757150,
      727150
    ]
  },
  {
    "minSalary": 8940,
    "maxSalary": 8960,
    "taxByDependents": [
      1177140,
      1126400,
      971520,
      941520,
      911520,
      881520,
      851520,
      821520,
      791520,
      761520,
      731520
    ]
  },
  {
    "minSalary": 8960,
    "maxSalary": 8980,
    "taxByDependents": [
      1181820,
      1131050,
      975880,
      945880,
      915880,
      885880,
      855880,
      825880,
      795880,
      765880,
      735880
    ]
  },
  {
    "minSalary": 8980,
    "maxSalary": 9000,
    "taxByDependents": [
      1186500,
      1135710,
      980250,
      950250,
      920250,
      890250,
      860250,
      830250,
      800250,
      770250,
      740250
    ]
  },
  {
    "minSalary": 9000,
    "maxSalary": 9020,
    "taxByDependents": [
      1191180,
      1140360,
      984620,
      954620,
      924620,
      894620,
      864620,
      834620,
      804620,
      774620,
      744620
    ]
  },
  {
    "minSalary": 9020,
    "maxSalary": 9040,
    "taxByDependents": [
      1195860,
      1145020,
      988990,
      958990,
      928990,
      898990,
      868990,
      838990,
      808990,
      778990,
      748990
    ]
  },
  {
    "minSalary": 9040,
    "maxSalary": 9060,
    "taxByDependents": [
      1200540,
      1149680,
      993360,
      963360,
      933360,
      903360,
      873360,
      843360,
      813360,
      783360,
      753360
    ]
  },
  {
    "minSalary": 9060,
    "maxSalary": 9080,
    "taxByDependents": [
      1205220,
      1154330,
      997720,
      967720,
      937720,
      907720,
      877720,
      847720,
      817720,
      787720,
      757720
    ]
  },
  {
    "minSalary": 9080,
    "maxSalary": 9100,
    "taxByDependents": [
      1209900,
      1158990,
      1002090,
      972090,
      942090,
      912090,
      882090,
      852090,
      822090,
      792090,
      762090
    ]
  },
  {
    "minSalary": 9100,
    "maxSalary": 9120,
    "taxByDependents": [
      1214580,
      1163640,
      1006460,
      976460,
      946460,
      916460,
      886460,
      856460,
      826460,
      796460,
      766460
    ]
  },
  {
    "minSalary": 9120,
    "maxSalary": 9140,
    "taxByDependents": [
      1219260,
      1168300,
      1010830,
      980830,
      950830,
      920830,
      890830,
      860830,
      830830,
      800830,
      770830
    ]
  },
  {
    "minSalary": 9140,
    "maxSalary": 9160,
    "taxByDependents": [
      1223940,
      1172960,
      1015200,
      985200,
      955200,
      925200,
      895200,
      865200,
      835200,
      805200,
      775200
    ]
  },
  {
    "minSalary": 9160,
    "maxSalary": 9180,
    "taxByDependents": [
      1228620,
      1177610,
      1019560,
      989560,
      959560,
      929560,
      899560,
      869560,
      839560,
      809560,
      779560
    ]
  },
  {
    "minSalary": 9180,
    "maxSalary": 9200,
    "taxByDependents": [
      1233300,
      1182270,
      1023930,
      993930,
      963930,
      933930,
      903930,
      873930,
      843930,
      813930,
      783930
    ]
  },
  {
    "minSalary": 9200,
    "maxSalary": 9220,
    "taxByDependents": [
      1237980,
      1186920,
      1028300,
      998300,
      968300,
      938300,
      908300,
      878300,
      848300,
      818300,
      788300
    ]
  },
  {
    "minSalary": 9220,
    "maxSalary": 9240,
    "taxByDependents": [
      1244640,
      1191580,
      1032670,
      1002670,
      972670,
      942670,
      912670,
      882670,
      852670,
      822670,
      792670
    ]
  },
  {
    "minSalary": 9240,
    "maxSalary": 9260,
    "taxByDependents": [
      1251470,
      1196240,
      1037040,
      1007040,
      977040,
      947040,
      917040,
      887040,
      857040,
      827040,
      797040
    ]
  },
  {
    "minSalary": 9260,
    "maxSalary": 9280,
    "taxByDependents": [
      1258290,
      1200890,
      1041400,
      1011400,
      981400,
      951400,
      921400,
      891400,
      861400,
      831400,
      801400
    ]
  },
  {
    "minSalary": 9280,
    "maxSalary": 9300,
    "taxByDependents": [
      1265120,
      1205550,
      1045770,
      1015770,
      985770,
      955770,
      925770,
      895770,
      865770,
      835770,
      805770
    ]
  },
  {
    "minSalary": 9300,
    "maxSalary": 9320,
    "taxByDependents": [
      1271940,
      1210200,
      1050140,
      1020140,
      990140,
      960140,
      930140,
      900140,
      870140,
      840140,
      810140
    ]
  },
  {
    "minSalary": 9320,
    "maxSalary": 9340,
    "taxByDependents": [
      1278770,
      1214860,
      1054510,
      1024510,
      994510,
      964510,
      934510,
      904510,
      874510,
      844510,
      814510
    ]
  },
  {
    "minSalary": 9340,
    "maxSalary": 9360,
    "taxByDependents": [
      1285590,
      1219520,
      1058880,
      1028880,
      998880,
      968880,
      938880,
      908880,
      878880,
      848880,
      818880
    ]
  },
  {
    "minSalary": 9360,
    "maxSalary": 9380,
    "taxByDependents": [
      1292420,
      1224170,
      1063240,
      1033240,
      1003240,
      973240,
      943240,
      913240,
      883240,
      853240,
      823240
    ]
  },
  {
    "minSalary": 9380,
    "maxSalary": 9400,
    "taxByDependents": [
      1299240,
      1228830,
      1067610,
      1037610,
      1007610,
      977610,
      947610,
      917610,
      887610,
      857610,
      827610
    ]
  },
  {
    "minSalary": 9400,
    "maxSalary": 9420,
    "taxByDependents": [
      1306070,
      1233480,
      1071980,
      1041980,
      1011980,
      981980,
      951980,
      921980,
      891980,
      861980,
      831980
    ]
  },
  {
    "minSalary": 9420,
    "maxSalary": 9440,
    "taxByDependents": [
      1312890,
      1238140,
      1076350,
      1046350,
      1016350,
      986350,
      956350,
      926350,
      896350,
      866350,
      836350
    ]
  },
  {
    "minSalary": 9440,
    "maxSalary": 9460,
    "taxByDependents": [
      1319720,
      1244840,
      1080720,
      1050720,
      1020720,
      990720,
      960720,
      930720,
      900720,
      870720,
      840720
    ]
  },
  {
    "minSalary": 9460,
    "maxSalary": 9480,
    "taxByDependents": [
      1326540,
      1251630,
      1085080,
      1055080,
      1025080,
      995080,
      965080,
      935080,
      905080,
      875080,
      845080
    ]
  },
  {
    "minSalary": 9480,
    "maxSalary": 9500,
    "taxByDependents": [
      1333370,
      1258420,
      1089450,
      1059450,
      1029450,
      999450,
      969450,
      939450,
      909450,
      879450,
      849450
    ]
  },
  {
    "minSalary": 9500,
    "maxSalary": 9520,
    "taxByDependents": [
      1340190,
      1265210,
      1093820,
      1063820,
      1033820,
      1003820,
      973820,
      943820,
      913820,
      883820,
      853820
    ]
  },
  {
    "minSalary": 9520,
    "maxSalary": 9540,
    "taxByDependents": [
      1347020,
      1272000,
      1098190,
      1068190,
      1038190,
      1008190,
      978190,
      948190,
      918190,
      888190,
      858190
    ]
  },
  {
    "minSalary": 9540,
    "maxSalary": 9560,
    "taxByDependents": [
      1353840,
      1278790,
      1102560,
      1072560,
      1042560,
      1012560,
      982560,
      952560,
      922560,
      892560,
      862560
    ]
  },
  {
    "minSalary": 9560,
    "maxSalary": 9580,
    "taxByDependents": [
      1360670,
      1285580,
      1106920,
      1076920,
      1046920,
      1016920,
      986920,
      956920,
      926920,
      896920,
      866920
    ]
  },
  {
    "minSalary": 9580,
    "maxSalary": 9600,
    "taxByDependents": [
      1367490,
      1292370,
      1111290,
      1081290,
      1051290,
      1021290,
      991290,
      961290,
      931290,
      901290,
      871290
    ]
  },
  {
    "minSalary": 9600,
    "maxSalary": 9620,
    "taxByDependents": [
      1374320,
      1299160,
      1115660,
      1085660,
      1055660,
      1025660,
      995660,
      965660,
      935660,
      905660,
      875660
    ]
  },
  {
    "minSalary": 9620,
    "maxSalary": 9640,
    "taxByDependents": [
      1381140,
      1305950,
      1120030,
      1090030,
      1060030,
      1030030,
      1000030,
      970030,
      940030,
      910030,
      880030
    ]
  },
  {
    "minSalary": 9640,
    "maxSalary": 9660,
    "taxByDependents": [
      1387970,
      1312740,
      1124400,
      1094400,
      1064400,
      1034400,
      1004400,
      974400,
      944400,
      914400,
      884400
    ]
  },
  {
    "minSalary": 9660,
    "maxSalary": 9680,
    "taxByDependents": [
      1394790,
      1319530,
      1128760,
      1098760,
      1068760,
      1038760,
      1008760,
      978760,
      948760,
      918760,
      888760
    ]
  },
  {
    "minSalary": 9680,
    "maxSalary": 9700,
    "taxByDependents": [
      1401620,
      1326320,
      1133130,
      1103130,
      1073130,
      1043130,
      1013130,
      983130,
      953130,
      923130,
      893130
    ]
  },
  {
    "minSalary": 9700,
    "maxSalary": 9720,
    "taxByDependents": [
      1408440,
      1333110,
      1137500,
      1107500,
      1077500,
      1047500,
      1017500,
      987500,
      957500,
      927500,
      897500
    ]
  },
  {
    "minSalary": 9720,
    "maxSalary": 9740,
    "taxByDependents": [
      1415270,
      1339900,
      1141870,
      1111870,
      1081870,
      1051870,
      1021870,
      991870,
      961870,
      931870,
      901870
    ]
  },
  {
    "minSalary": 9740,
    "maxSalary": 9760,
    "taxByDependents": [
      1422090,
      1346690,
      1146240,
      1116240,
      1086240,
      1056240,
      1026240,
      996240,
      966240,
      936240,
      906240
    ]
  },
  {
    "minSalary": 9760,
    "maxSalary": 9780,
    "taxByDependents": [
      1428920,
      1353480,
      1150600,
      1120600,
      1090600,
      1060600,
      1030600,
      1000600,
      970600,
      940600,
      910600
    ]
  },
  {
    "minSalary": 9780,
    "maxSalary": 9800,
    "taxByDependents": [
      1435740,
      1360270,
      1154970,
      1124970,
      1094970,
      1064970,
      1034970,
      1004970,
      974970,
      944970,
      914970
    ]
  },
  {
    "minSalary": 9800,
    "maxSalary": 9820,
    "taxByDependents": [
      1442570,
      1367060,
      1159340,
      1129340,
      1099340,
      1069340,
      1039340,
      1009340,
      979340,
      949340,
      919340
    ]
  },
  {
    "minSalary": 9820,
    "maxSalary": 9840,
    "taxByDependents": [
      1449390,
      1373850,
      1163710,
      1133710,
      1103710,
      1073710,
      1043710,
      1013710,
      983710,
      953710,
      923710
    ]
  },
  {
    "minSalary": 9840,
    "maxSalary": 9860,
    "taxByDependents": [
      1456220,
      1380640,
      1168080,
      1138080,
      1108080,
      1078080,
      1048080,
      1018080,
      988080,
      958080,
      928080
    ]
  },
  {
    "minSalary": 9860,
    "maxSalary": 9880,
    "taxByDependents": [
      1463040,
      1387430,
      1172440,
      1142440,
      1112440,
      1082440,
      1052440,
      1022440,
      992440,
      962440,
      932440
    ]
  },
  {
    "minSalary": 9880,
    "maxSalary": 9900,
    "taxByDependents": [
      1469870,
      1394220,
      1176810,
      1146810,
      1116810,
      1086810,
      1056810,
      1026810,
      996810,
      966810,
      936810
    ]
  },
  {
    "minSalary": 9900,
    "maxSalary": 9920,
    "taxByDependents": [
      1476690,
      1401010,
      1181180,
      1151180,
      1121180,
      1091180,
      1061180,
      1031180,
      1001180,
      971180,
      941180
    ]
  },
  {
    "minSalary": 9920,
    "maxSalary": 9940,
    "taxByDependents": [
      1483520,
      1407800,
      1185550,
      1155550,
      1125550,
      1095550,
      1065550,
      1035550,
      1005550,
      975550,
      945550
    ]
  },
  {
    "minSalary": 9940,
    "maxSalary": 9960,
    "taxByDependents": [
      1490340,
      1414590,
      1189920,
      1159920,
      1129920,
      1099920,
      1069920,
      1039920,
      1009920,
      979920,
      949920
    ]
  },
  {
    "minSalary": 9960,
    "maxSalary": 9980,
    "taxByDependents": [
      1497170,
      1421380,
      1194280,
      1164280,
      1134280,
      1104280,
      1074280,
      1044280,
      1014280,
      984280,
      954280
    ]
  },
  {
    "minSalary": 9980,
    "maxSalary": 10000,
    "taxByDependents": [
      1503990,
      1428170,
      1198650,
      1168650,
      1138650,
      1108650,
      1078650,
      1048650,
      1018650,
      988650,
      958650
    ]
  }
];

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
