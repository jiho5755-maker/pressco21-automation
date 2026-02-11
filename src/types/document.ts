// 문서 관련 타입 정의 (Phase 3)
// 회사 실제 근로계약서 양식 기반 (재택근무 / 포괄임금제 / 촉탁직)

/**
 * 계약서 양식 유형 (3가지 구조적으로 다른 양식)
 * - REMOTE: 재택근무 계약서 (9개 조항, 근로기준법 58조)
 * - FIXED_OT: 사무실 + 포괄임금제 계약서 (10개 조항, 경영성과급 특약)
 * - REEMPLOYED: 촉탁직 + 포괄임금제 계약서 (10개 조항, 정년 재고용)
 */
export type ContractVariant = "REMOTE" | "FIXED_OT" | "REEMPLOYED";

/**
 * 근로계약서 Content JSON 구조
 * 회사 실제 양식 기반: 프레스코21 (3가지 양식 통합)
 */
export interface EmploymentContractContent {
  // ══ 회사 정보 ══
  companyName: string; // "프레스코21"
  businessNumber: string; // "215-05-52221"
  businessType: string; // "상품도매업"
  companyAddress: string; // "서울시 송파구 송이동 15길 33(가락동) 가락2차 쌍용상가 201호"
  representativeName: string; // "이진선"

  // ══ 계약서 양식 유형 ══
  contractVariant: ContractVariant;

  // ══ 제1조: 근로계약기간 ══
  contractType: "REGULAR" | "CONTRACT" | "PARTTIME" | "REPLACEMENT" | "REEMPLOYED";
  isIndefinite: boolean;
  contractStartDate: string; // ISO 8601
  contractEndDate?: string;
  probationPeriod: number; // 3 (개월)

  // 촉탁직 특별 조항 (REEMPLOYED only)
  reemployed?: {
    isReemployed: boolean;
    retirementAge: number; // 65
    contractYears: number; // 3
    freshStartForSeverance: boolean; // 퇴직금 기산 새로 시작
    freshStartForAnnualLeave: boolean; // 연차 기산 새로 시작
  };

  // ══ 제2조: 근로시간, 근로일 및 휴게 ══
  workingHours: {
    weeklyWorkHours: number; // 40
    workStartTime: string; // "09:00"
    workEndTime: string; // "18:00"
    breakStartTime: string; // "12:30"
    breakEndTime: string; // "13:30"
    breakMinutes: number; // 60
    workDays: string; // "주 5일 (월요일~금요일)"
  };

  // 재택근무 (REMOTE only)
  remoteWork?: {
    isRemote: boolean;
    remoteDays: string; // "월, 화, 수, 금요일"
    article58Applied: boolean; // 근로기준법 58조 적용
    remoteWorkGuidelinesConfirmed: boolean; // 재택근로자 근무수칙 확인
  };

  // 시차출퇴근제 (FIXED_OT / REEMPLOYED)
  flexibleSchedule?: {
    useFlexible: boolean;
    flexStartTime: string; // "07:00" (출근 가능 시작)
    flexEndTime: string; // "11:00" (출근 가능 종료)
    coreStartTime: string; // "11:00"
    coreEndTime: string; // "16:00"
  };

  // ══ 제3조: 담당업무 및 근무장소 ══
  workLocation: string; // "본사 사무실" or "본사사무실 및 재택주소"
  jobDescription: string;

  // ══ 제4조: 임금 ══
  salary: {
    baseSalary: number;
    mealAllowance: number;
    transportAllowance: number;
    positionAllowance: number;
    fixedOTAmount?: number; // 포괄임금제 수당
    taxFreeMeal: boolean;
    taxFreeTransport: boolean;
    monthlyTotalGross: number; // 월 지급액
    monthlyStandardHours: number; // 209시간
  };

  // 포괄임금제 (FIXED_OT / REEMPLOYED)
  fixedOT?: {
    useFixedOT: boolean;
    monthlyFixedOTHours: number; // 20 or 30
    monthlyFixedOTAmount: number; // 포괄임금 수당
    overtimeThreshold: number; // 초과 시 별도 정산 기준 (30)
    writtenAgreement: boolean; // 서면 합의 필수
  };

  // 급여 지급
  salaryPayment: {
    paymentDate: string; // "말일" | "21" | "25" 등
    paymentMethod: "BANK_TRANSFER" | "CASH" | "OTHER";
    bankName?: string;
    bankAccount?: string;
    calculationPeriodStart: number; // 1
    calculationPeriodEnd: string; // "말일"
  };

  // ══ 제5조: 휴일 및 휴가 ══
  weeklyRestDay: string; // "일요일"
  saturdayOffType: string; // "토요일은 무급 휴무일로 한다."
  annualLeavePolicy: string;

  // ══ 제6조: 근태사항, 중도퇴사자 및 인수인계 ══
  resignationNotice: number; // 30 (일)

  // ══ 제7조: 계약 해지 ══
  terminationReasons: string[];

  // ══ 제8조: 기밀유지 (및 경업금지) ══
  confidentiality: {
    duringEmployment: boolean;
    afterEmployment: boolean;
    civilCriminalLiability: boolean;
    nonCompetePeriod: number; // 1 (년)
    nonCompeteScope: string; // "동종업계 전직 또는 창업 금지"
  };

  // ══ 제9조/10조: 특약사항 ══
  specialClauses: {
    // 재택근무자 (REMOTE)
    remoteWorkerGuidelines?: boolean;
    // 포괄임금제 직원 (FIXED_OT / REEMPLOYED)
    performanceBonus?: {
      hasClause: boolean;
      isDiscretionary: boolean; // 은혜적·호의적 금원
      excludedFromAverageWage: boolean; // 평균임금 제외
    };
  };

  // ══ 기타 메타데이터 ══
  generatedAt: string; // ISO 8601 (생성일시)

  // ══ 하위 호환성 (기존 필드) ══
  socialInsurance?: {
    nationalPension: boolean;
    healthInsurance: boolean;
    employmentInsurance: boolean;
    industrialAccident: boolean;
  };
  probation?: {
    hasProbation: boolean;
    probationEndDate?: string;
  };
  renewalCondition?: string;
}

/**
 * 임금명세서 Content JSON 구조
 */
export interface PayslipContent {
  year: number;
  month: number;
  payrollRecordId?: string; // PayrollRecord 참조
}

/**
 * 공지사항 Content JSON 구조
 */
export interface NoticeContent {
  content: string;
  isAllEmployees: boolean; // 전체 공지 여부
}

/**
 * 기타 문서 Content JSON 구조
 */
export interface OtherContent {
  content: string;
}

/**
 * Document.content 타입 (discriminatedUnion)
 */
export type DocumentContent =
  | EmploymentContractContent
  | PayslipContent
  | NoticeContent
  | OtherContent;
