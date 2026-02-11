/**
 * 이메일 알림 시스템 타입 정의
 *
 * Phase 3-F: 알림 시스템 (이메일, 웹 알림)
 */

/**
 * 이메일 템플릿 유형
 */
export type EmailTemplate =
  | "SUBSIDY_DEADLINE" // 지원금 신청 마감 알림
  | "APPROVAL_REQUEST" // 결재 요청
  | "APPROVAL_RESULT" // 결재 승인/반려
  | "LEAVE_REQUEST" // 휴가 신청
  | "LEAVE_APPROVED" // 휴가 승인
  | "PAYROLL_READY" // 급여명세서 발급
  | "DOCUMENT_CREATED"; // 문서 생성 알림

/**
 * 알림 발송 결과
 */
export interface NotificationResult {
  /** 성공 여부 */
  success: boolean;
  /** 오류 메시지 (실패 시) */
  error?: string;
  /** 이메일 ID (성공 시, Resend에서 반환) */
  emailId?: string;
}

/**
 * 지원금 마감 알림 이메일 Props
 */
export interface SubsidyDeadlineReminderProps {
  /** 직원 이름 */
  employeeName: string;
  /** 지원금 유형 (한글명) */
  subsidyTypeName: string;
  /** 마감일 (YYYY-MM-DD) */
  deadline: string;
  /** D-day (예: 3) */
  dDay: number;
  /** 예상 지급액 (숫자) */
  estimatedAmount: number;
  /** 지원금 신청 ID */
  subsidyId: string;
}

/**
 * 결재 요청 이메일 Props
 */
export interface ApprovalRequestProps {
  /** 결재자 이름 */
  approverName: string;
  /** 문서 유형 (한글명) */
  documentTypeName: string;
  /** 문서 제목 */
  documentTitle: string;
  /** 작성자 이름 */
  creatorName: string;
  /** 문서 ID */
  documentId: string;
}

/**
 * 결재 결과 이메일 Props
 */
export interface ApprovalResultProps {
  /** 작성자 이름 */
  creatorName: string;
  /** 문서 유형 (한글명) */
  documentTypeName: string;
  /** 문서 제목 */
  documentTitle: string;
  /** 승인/반려 여부 */
  isApproved: boolean;
  /** 결재자 이름 */
  approverName: string;
  /** 반려 사유 (반려 시) */
  rejectionReason?: string;
  /** 문서 ID */
  documentId: string;
}
