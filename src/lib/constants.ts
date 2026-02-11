// 앱 전체 상수 — 상태코드, 유형, 노무기준, 정부지원금

// ── 직급 ──
export const POSITIONS = ["사원", "주임", "대리", "과장", "차장", "부장", "이사"] as const;

// ── 직원 상태 ──
export const EMPLOYEE_STATUS = {
  ACTIVE: "재직",
  ON_LEAVE: "휴직",
  RESIGNED: "퇴사",
} as const;

// ── 계약 유형 ──
export const CONTRACT_TYPES = {
  REGULAR: "정규직",
  CONTRACT: "계약직",
  PARTTIME: "파트타임",
  REPLACEMENT: "대체인력",
} as const;

// ── 유연근무 유형 ──
export const WORK_TYPES = {
  OFFICE: "사무실 근무",
  FLEXIBLE_HOURS: "시차출퇴근",
  REMOTE: "재택근무",
  HYBRID: "하이브리드",
} as const;

// ── 요일 ──
export const WEEKDAYS = {
  MON: "월",
  TUE: "화",
  WED: "수",
  THU: "목",
  FRI: "금",
} as const;

// ── 휴직/휴가 사유 ──
export const LEAVE_TYPES = {
  ANNUAL: "연차",
  MATERNITY: "출산전후휴가",
  PARENTAL: "육아휴직",
  SPOUSE_MATERNITY: "배우자출산휴가",
  SICK: "병가",
  PERSONAL: "개인사유",
  COMPENSATORY: "대체휴무",
} as const;

// ── 휴일 유형 (Phase 1-D Task 2) ──
export const HOLIDAY_TYPES = {
  WEEKLY_REST: "주휴일", // 1주 1회 (근로기준법 제55조)
  LEGAL_HOLIDAY: "법정공휴일", // 관공서의 공휴일에 관한 규정 (약정 시)
  AGREED_HOLIDAY: "약정휴일", // 노사 합의로 정한 휴일
} as const;

// ── 대체인력 사유 ──
export const REPLACEMENT_REASONS = {
  MATERNITY: "출산전후휴가 대체",
  PARENTAL: "육아휴직 대체",
  SICK: "질병휴직 대체",
} as const;

// ── 경비 ──
export const EXPENSE_CATEGORIES = ["교통비", "식비", "숙박비", "사무용품", "교육비", "기타"] as const;

export const EXPENSE_STATUS = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
} as const;

// ── 정부지원사업 유형 ──
export const SUBSIDY_TYPES = {
  // 기존 5가지 (Phase 2)
  FLEXIBLE_WORK: "유연근무 장려금",
  REPLACEMENT_WORKER: "출산육아기 대체인력 지원금",
  PARENTAL_LEAVE_GRANT: "육아휴직 부여 지원금",
  WORK_SHARING: "업무분담 지원금",
  INFRA_SUPPORT: "유연근무 인프라 구축비",

  // 신규 4가지 (Phase 3-D)
  MATERNITY_LEAVE_PAY: "출산전후휴가 급여",
  SPOUSE_MATERNITY_PAY: "배우자 출산휴가 급여",
  PARENTAL_LEAVE_PAY: "육아휴직 급여",
  SHORTENED_WORK_HOURS_PAY: "육아기 근로시간 단축 급여",
  PREGNANCY_REDUCED_HOURS: "임신기 근로시간 단축 급여",
} as const;

// ── 정부지원사업 상태 ──
export const SUBSIDY_STATUS = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  PAID: "지급완료",
} as const;

// ── 문서 유형 (Phase 3) ──
export const DOCUMENT_TYPES = {
  EMPLOYMENT_CONTRACT: "근로계약서",
  PAYSLIP: "임금명세서",
  RESIGNATION: "퇴직서류",
  NOTICE: "공지사항",
  OTHER: "기타",
} as const;

// ── 문서 상태 (Phase 3) ──
export const DOCUMENT_STATUS = {
  DRAFT: "초안",
  PENDING_APPROVAL: "결재요청",
  APPROVED: "결재완료",
  REJECTED: "반려",
  ISSUED: "발급완료",
  ARCHIVED: "보관",
} as const;

// ── 결재 상태 (Phase 3) ──
export const APPROVAL_STATUS = {
  PENDING: "대기",
  APPROVED: "승인",
  REJECTED: "반려",
  SKIPPED: "후속생략",
} as const;

// ── 사용자 역할 ──
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  VIEWER: "viewer",
} as const;

// ── 급여 지급일 ──
export const PAYROLL_PAYMENT = {
  paymentDate: "말일", // 매월 말일
  calculationPeriodStart: 1, // 당월 1일부터
  calculationPeriodEnd: "말일", // 말일까지
  description: "당월 1일부터 말일까지 마감, 익월 말일 지급",
} as const;

// ── 급여 지급일 옵션 ──
export const SALARY_PAYMENT_OPTIONS = [
  { value: "말일", label: "매월 말일" },
  { value: "21", label: "매월 21일" },
  { value: "25", label: "매월 25일" },
  { value: "10", label: "매월 10일" },
] as const;

// ── 2026년 기준 노무 상수 ──
export const LABOR_STANDARDS_2026 = {
  minimumWage: {
    hourly: 10320,
    monthly: 2156880, // 209시간 기준
    standardMonthlyHours: 209,
  },
  overtimeRate: 1.5,
  nightWorkRate: 1.5,
  holidayWorkRate: 1.5,
  maxWeeklyHours: 52,
  maxOvertimeHours: 12,
} as const;

// ── 2026년 비과세 한도 ──
export const TAX_FREE_LIMITS_2026 = {
  meal: 200000, // 식대 비과세 한도 (월 20만원)
  transport: 200000, // 교통비 비과세 한도 (월 20만원)
} as const;

// ── 고정OT 권장 상한 (주 52시간 법정 한도 기준) ──
export const FIXED_OT_LIMITS_2026 = {
  maxMonthlyOTHours: 52, // 주 12시간 연장 × 4.345주 = 약 52시간
  maxWeeklyOTHours: 12, // 주 최대 연장근로 12시간 (주52시간제)
} as const;

export type TaxFreeLimits = typeof TAX_FREE_LIMITS_2026;
export type FixedOTLimits = typeof FIXED_OT_LIMITS_2026;

// ── 2026년 4대보험 요율 ──
export const INSURANCE_RATES_2026 = {
  rates: {
    nationalPension: 0.0475, // 근로자 부담 4.75%
    healthInsurance: 0.03595, // 근로자 부담 3.595%
    longTermCare: 0.1314, // 건강보험료의 13.14%
    employmentInsurance: 0.009, // 근로자 부담 0.9%
  },
  caps: {
    nationalPension: 6370000, // 상한 637만원
    healthInsurance: 12700000, // 상한 1,270만원
  },
  floors: {
    nationalPension: 400000, // 하한 40만원
  },
  employer: {
    nationalPension: 0.0475, // 사업주 부담 4.75%
    healthInsurance: 0.03595, // 사업주 부담 3.595%
    employmentInsurance: 0.0105, // 사업주 부담 1.05%
    industrialAccident: 0.007, // 산재보험 0.7% (유통업 기준)
  },
} as const;

// ── 출산/육아 법정 기준 (2026) ──
export const MATERNITY_PARENTAL_2026 = {
  maternityLeave: {
    days: 90,
    daysMultiple: 120,
    postBirthMinDays: 45,
    insuranceCap90: 6300000,
    insuranceCap120: 8400000,
  },
  parentalLeave: {
    maxMonths: 18,
    payRate: 0.8,
    payCap: 1600000,
    payFloor: 700000,
  },
  parentalLeave6Plus6: {
    childAgeLimit: 18,
    payRate: 1.0,
    payCap: 2500000,
  },
  spouseMaternityLeave: {
    days: 20,
  },
  annualLeave: {
    underOneYear: 1,
    baseAfterOneYear: 15,
    additionalPerTwoYears: 1,
    maxDays: 25,
  },
} as const;

// ── 출산육아 지원금 기준 (Phase 3-D) ──
export const MATERNITY_SUBSIDIES_2026 = {
  // 출산전후휴가 급여 (고용보험법 제75조)
  maternityLeavePay: {
    duration: 90, // 90일 (다태아 120일)
    postBirthMinDays: 45, // 출산 후 최소 45일
    firstMonthRate: 1.0, // 첫 달 100% (상한 200만원)
    secondMonthOnwardRate: 0.8, // 둘째 달 이후 80% (상한 160만원)
    firstMonthCap: 2000000, // 첫 달 상한 200만원
    secondMonthCap: 1600000, // 둘째 달 이후 상한 160만원
  },
  // 배우자 출산휴가 급여 (고용보험법 제76조의2)
  spouseMaternityPay: {
    duration: 20, // 20일 (2025.2.23 개정)
    dailyRate: 1.0, // 통상임금의 100%
    dailyCap: 100000, // 일 상한 10만원
  },
  // 육아휴직 급여 (고용보험법 제70조)
  parentalLeavePay: {
    maxMonths: 12, // 최대 12개월
    paymentRate: 0.8, // 급여의 80%
    monthlyMax: 1600000, // 상한 160만원/월
    monthlyMin: 700000, // 하한 70만원/월
  },
  // 육아기 근로시간 단축 급여 (고용보험법 제73조의2)
  shortenedWorkHoursPay: {
    maxMonths: 24, // 최대 24개월
    maxHoursPerWeek: 15, // 최대 단축 15시간/주
    minHoursPerWeek: 5, // 최소 단축 5시간/주
    monthlyPayByHours: {
      // 단축 시간별 월 급여
      5: 400000, // 5~10시간 미만
      10: 500000, // 10~15시간 미만
      15: 600000, // 15시간 이상
    },
  },
  // 임신기 근로시간 단축 급여 (고용보험법 제76조의3)
  pregnancyReducedHours: {
    maxMonths: 12, // 최대 12개월
    maxHoursPerWeek: 10, // 최대 단축 10시간/주
    monthlyPay: 800000, // 월 80만원 (고정)
  },
} as const;

// ── 2026년 정부 지원금 기준 ──
export const GOVERNMENT_SUBSIDIES_2026 = {
  flexibleWork: {
    label: "유연근무 장려금",
    maxPerMonth: 600000,
    maxMonths: 12,
    minUsagePerMonth: 4,
  },
  replacementWorker: {
    label: "출산육아기 대체인력 지원금",
    under30: 1400000,
    over30: 1300000,
    extraMonthAfterReturn: 1,
  },
  parentalLeaveGrant: {
    label: "육아휴직 부여 지원금",
    monthly: 300000,
    under12MonthChild: 1000000,
  },
  workSharingGrant: {
    label: "업무분담 지원금",
    under30: 600000,
    over30: 400000,
  },
  infraSupport: {
    label: "유연근무 인프라 구축비",
    rateUnder30: 1.0,
    maxPerYear: 1800000,
  },
} as const;
