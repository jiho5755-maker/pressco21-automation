// 문서 관련 타입 정의 (Phase 3)

/**
 * 근로계약서 Content JSON 구조
 * 근로기준법 제17조 필수 15개 항목 포함
 */
export interface EmploymentContractContent {
  // ══ 1. 근로계약 기간 ══
  contractStartDate: string; // ISO 8601
  contractEndDate?: string; // 기간제만 (무기계약 시 null)
  isIndefinite: boolean; // 무기계약 여부
  contractType: "REGULAR" | "CONTRACT" | "PARTTIME" | "REPLACEMENT";

  // ══ 2. 근무 장소 ══
  workLocation: string; // "서울특별시 강남구..."

  // ══ 3. 업무 내용 ══
  jobDescription: string; // "소프트웨어 개발, 코드 리뷰..."

  // ══ 4. 소정근로시간 ══
  workingHours: {
    weeklyWorkHours: number; // 40
    workStartTime: string; // "09:00"
    workEndTime: string; // "18:00"
    breakMinutes: number; // 60
  };

  // ══ 5. 근무일 및 휴일 ══
  weeklyRestDay: string; // "토요일" 또는 "일요일"

  // ══ 6. 임금 구성 ══
  salary: {
    baseSalary: number;
    mealAllowance: number;
    transportAllowance: number;
    positionAllowance: number;
    taxFreeMeal: boolean;
    taxFreeTransport: boolean;
  };

  // ══ 7. 임금 지급일 및 방법 ══
  salaryPayment: {
    paymentDate: number; // 매월 n일 (1~31)
    paymentMethod: "BANK_TRANSFER" | "CASH" | "OTHER";
    bankName?: string;
    bankAccount?: string; // 마스킹 처리
  };

  // ══ 8. 연차 유급휴가 ══
  annualLeavePolicy: string; // "근로기준법 제60조에 따라..."

  // ══ 9. 사회보험 ══
  socialInsurance: {
    nationalPension: boolean;
    healthInsurance: boolean;
    employmentInsurance: boolean;
    industrialAccident: boolean;
  };

  // ══ 10. 계약 갱신 조건 (기간제만) ══
  renewalCondition?: string;

  // ══ 11. 수습기간 ══
  probation?: {
    hasProbation: boolean;
    probationEndDate?: string; // ISO 8601
  };

  // ══ 기타 메타데이터 ══
  companyName?: string; // 회사명 (기본값: "프레스코21")
  businessNumber?: string; // 사업자등록번호
  generatedAt: string; // ISO 8601 (생성일시)
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
