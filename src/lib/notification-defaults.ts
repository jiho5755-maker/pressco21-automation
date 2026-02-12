/**
 * 알림 설정 기본값
 * User 생성 시 또는 첫 접속 시 적용
 * 전략: 중요 알림만 기본 활성화 (사용자 피로도 최소화)
 */

export const DEFAULT_NOTIFICATION_PREFERENCES = {
  emailEnabled: true, // 전체 이메일 알림 활성화
  webEnabled: true, // 전체 웹 알림 활성화
  typePreferences: [
    // 🔴 높은 우선순위: 이메일 + 웹 모두 활성화
    {
      type: "APPROVAL_REQUEST",
      emailEnabled: true,
      webEnabled: true,
    },
    {
      type: "DOCUMENT_APPROVED",
      emailEnabled: true,
      webEnabled: true,
    },
    {
      type: "DOCUMENT_REJECTED",
      emailEnabled: true,
      webEnabled: true,
    },
    {
      type: "PAYSLIP_READY",
      emailEnabled: true,
      webEnabled: true,
    },

    // 🟡 중간 우선순위: 웹만 활성화
    {
      type: "SUBSIDY_APPROVED",
      emailEnabled: false,
      webEnabled: true,
    },
    {
      type: "LEAVE_APPROVED",
      emailEnabled: false,
      webEnabled: true,
    },
    {
      type: "LEAVE_REJECTED",
      emailEnabled: false,
      webEnabled: true,
    },
    {
      type: "EXPENSE_APPROVED",
      emailEnabled: false,
      webEnabled: true,
    },
    {
      type: "EXPENSE_REJECTED",
      emailEnabled: false,
      webEnabled: true,
    },
    {
      type: "ATTENDANCE_CONFIRMED",
      emailEnabled: false,
      webEnabled: true,
    },

    // 🟢 낮은 우선순위: 기본 비활성화
    {
      type: "ANNUAL_LEAVE_LOW",
      emailEnabled: false,
      webEnabled: false,
    },
    {
      type: "CONTRACT_EXPIRING",
      emailEnabled: false,
      webEnabled: false,
    },
    {
      type: "PROBATION_ENDING",
      emailEnabled: false,
      webEnabled: false,
    },
    {
      type: "SYSTEM",
      emailEnabled: false,
      webEnabled: false,
    },
  ],
} as const;

/**
 * 알림 유형별 그룹핑 (UI 표시용)
 */
export const NOTIFICATION_GROUPS = [
  {
    id: "approval",
    title: "결재 및 승인 알림",
    description: "문서 결재 및 승인/반려 알림",
    types: [
      "APPROVAL_REQUEST",
      "DOCUMENT_APPROVED",
      "DOCUMENT_REJECTED",
      "SUBSIDY_APPROVED",
      "LEAVE_APPROVED",
      "LEAVE_REJECTED",
      "EXPENSE_APPROVED",
      "EXPENSE_REJECTED",
    ],
  },
  {
    id: "payroll",
    title: "급여 및 근태 알림",
    description: "급여명세서 발급 및 근태 확정 알림",
    types: ["PAYSLIP_READY", "ATTENDANCE_CONFIRMED"],
  },
  {
    id: "auto",
    title: "자동 알림",
    description: "연차 부족, 계약 만료, 수습 종료 등 자동 발송 알림",
    types: ["ANNUAL_LEAVE_LOW", "CONTRACT_EXPIRING", "PROBATION_ENDING"],
  },
  {
    id: "system",
    title: "시스템 알림",
    description: "시스템 공지 및 유지보수 알림",
    types: ["SYSTEM"],
  },
] as const;

/**
 * 알림 유형별 라벨 및 설명
 */
export const NOTIFICATION_TYPE_INFO = {
  APPROVAL_REQUEST: {
    label: "결재 요청",
    description: "내가 결재해야 할 문서가 도착했을 때",
    badge: { text: "즉시", variant: "default" as const },
  },
  DOCUMENT_APPROVED: {
    label: "문서 승인",
    description: "내가 제출한 문서가 승인되었을 때",
    badge: { text: "즉시", variant: "default" as const },
  },
  DOCUMENT_REJECTED: {
    label: "문서 반려",
    description: "내가 제출한 문서가 반려되었을 때",
    badge: { text: "즉시", variant: "destructive" as const },
  },
  PAYSLIP_READY: {
    label: "급여명세서 발급",
    description: "월급이 지급되고 명세서가 발급되었을 때",
    badge: { text: "월 1회", variant: "secondary" as const },
  },
  SUBSIDY_APPROVED: {
    label: "지원금 승인",
    description: "지원금 신청이 승인되었을 때",
    badge: { text: "즉시", variant: "default" as const },
  },
  LEAVE_APPROVED: {
    label: "휴가 승인",
    description: "휴가 신청이 승인되었을 때",
    badge: { text: "즉시", variant: "default" as const },
  },
  LEAVE_REJECTED: {
    label: "휴가 반려",
    description: "휴가 신청이 반려되었을 때",
    badge: { text: "즉시", variant: "destructive" as const },
  },
  EXPENSE_APPROVED: {
    label: "경비 승인",
    description: "경비 신청이 승인되었을 때",
    badge: { text: "즉시", variant: "default" as const },
  },
  EXPENSE_REJECTED: {
    label: "경비 반려",
    description: "경비 신청이 반려되었을 때",
    badge: { text: "즉시", variant: "destructive" as const },
  },
  ATTENDANCE_CONFIRMED: {
    label: "근태 확정",
    description: "관리자가 내 근태 기록을 확정했을 때",
    badge: { text: "주간", variant: "secondary" as const },
  },
  ANNUAL_LEAVE_LOW: {
    label: "연차 부족 알림",
    description: "남은 연차가 5일 이하일 때 (분기별)",
    badge: { text: "자동", variant: "outline" as const },
  },
  CONTRACT_EXPIRING: {
    label: "계약 만료 임박",
    description: "계약 종료일 30일 전",
    badge: { text: "자동", variant: "outline" as const },
  },
  PROBATION_ENDING: {
    label: "수습 종료 알림",
    description: "수습 종료일 7일 전",
    badge: { text: "자동", variant: "outline" as const },
  },
  SYSTEM: {
    label: "시스템 알림",
    description: "시스템 공지 및 유지보수 알림",
    badge: { text: "시스템", variant: "secondary" as const },
  },
} as const;
