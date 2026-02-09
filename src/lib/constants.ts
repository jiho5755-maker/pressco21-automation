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

// ── 사용자 역할 ──
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  VIEWER: "viewer",
} as const;

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

// ── 2026년 4대보험 요율 ──
export const INSURANCE_RATES_2026 = {
  nationalPension: {
    employee: 0.0475,
    employer: 0.0475,
    upperLimit: 6370000,
    lowerLimit: 400000,
  },
  healthInsurance: {
    employee: 0.03595,
    employer: 0.03595,
    upperLimit: 12700000,
  },
  longTermCare: { rate: 0.1314 },
  employmentInsurance: { employee: 0.009, employer: 0.0105 },
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
