// Badge 스타일 매핑 — 상태별 시각적 표현

type BadgeConfig = { label: string; className: string };

// ── 직원 상태 Badge ──
export const employeeStatusConfig: Record<string, BadgeConfig> = {
  ACTIVE: {
    label: "재직",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  ON_LEAVE: {
    label: "휴직",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  },
  RESIGNED: {
    label: "퇴사",
    className:
      "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
  },
};

// ── 경비 상태 Badge ──
export const expenseStatusBadgeConfig: Record<string, BadgeConfig> = {
  PENDING: {
    label: "대기",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  },
  APPROVED: {
    label: "승인",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  REJECTED: {
    label: "반려",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
};

// ── 계약 유형 Badge ──
export const contractTypeConfig: Record<string, BadgeConfig> = {
  REGULAR: {
    label: "정규직",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  CONTRACT: {
    label: "계약직",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  PARTTIME: {
    label: "파트타임",
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  REPLACEMENT: {
    label: "대체인력",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
};

// ── 유연근무 유형 Badge ──
export const workTypeConfig: Record<string, BadgeConfig> = {
  OFFICE: {
    label: "사무실",
    className:
      "border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300",
  },
  FLEXIBLE_HOURS: {
    label: "시차출퇴근",
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  },
  REMOTE: {
    label: "재택근무",
    className:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  HYBRID: {
    label: "하이브리드",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
};

// ── 휴직 유형 Badge ──
export const leaveTypeConfig: Record<string, BadgeConfig> = {
  ANNUAL: {
    label: "연차",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  MATERNITY: {
    label: "출산휴가",
    className:
      "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300",
  },
  PARENTAL: {
    label: "육아휴직",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
  },
  SPOUSE_MATERNITY: {
    label: "배우자출산",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
  SICK: {
    label: "병가",
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  PERSONAL: {
    label: "개인사유",
    className:
      "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
  },
  COMPENSATORY: {
    label: "대체휴무",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
};

// ── 휴가 상태 Badge ──
export const leaveStatusConfig: Record<string, BadgeConfig> = {
  PENDING: {
    label: "대기",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  },
  APPROVED: {
    label: "승인",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  REJECTED: {
    label: "반려",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
  CANCELLED: {
    label: "취소",
    className:
      "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
  },
};

// ── 정부지원사업 유형 Badge ──
export const subsidyTypeConfig: Record<string, BadgeConfig> = {
  // 기존 5가지 (Phase 2)
  FLEXIBLE_WORK: {
    label: "유연근무",
    className:
      "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
  },
  REPLACEMENT_WORKER: {
    label: "대체인력",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
  PARENTAL_LEAVE_GRANT: {
    label: "육아휴직부여",
    className:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300",
  },
  WORK_SHARING: {
    label: "업무분담",
    className:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
  },
  INFRA_SUPPORT: {
    label: "인프라구축",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  // 신규 5가지 (Phase 3-D)
  MATERNITY_LEAVE_PAY: {
    label: "출산휴가급여",
    className:
      "border-pink-200 bg-pink-50 text-pink-700 dark:border-pink-800 dark:bg-pink-950 dark:text-pink-300",
  },
  SPOUSE_MATERNITY_PAY: {
    label: "배우자출산급여",
    className:
      "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700 dark:border-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-300",
  },
  PARENTAL_LEAVE_PAY: {
    label: "육아휴직급여",
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  SHORTENED_WORK_HOURS_PAY: {
    label: "육아기단축급여",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  },
  PREGNANCY_REDUCED_HOURS: {
    label: "임신기단축급여",
    className:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",
  },
};

// ── 정부지원사업 상태 Badge ──
export const subsidyStatusConfig: Record<string, BadgeConfig> = {
  PENDING: {
    label: "대기",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  },
  APPROVED: {
    label: "승인",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  REJECTED: {
    label: "반려",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
  PAID: {
    label: "지급완료",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
};

// ── 문서 유형 Badge (Phase 3) ──
export const documentTypeConfig: Record<string, BadgeConfig> = {
  EMPLOYMENT_CONTRACT: {
    label: "근로계약서",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  PAYSLIP: {
    label: "임금명세서",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  EMPLOYMENT_CERTIFICATE: {
    label: "재직증명서",
    className:
      "border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300",
  },
  CAREER_CERTIFICATE: {
    label: "경력증명서",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
  },
  RESIGNATION: {
    label: "퇴직서류",
    className:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
  },
  NOTICE: {
    label: "공지사항",
    className:
      "border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
  },
  OTHER: {
    label: "기타",
    className:
      "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
  },
};

// ── 문서 상태 Badge (Phase 3) ──
export const documentStatusConfig: Record<string, BadgeConfig> = {
  DRAFT: {
    label: "초안",
    className:
      "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
  },
  PENDING_APPROVAL: {
    label: "결재요청",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  },
  APPROVED: {
    label: "결재완료",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  REJECTED: {
    label: "반려",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
  ISSUED: {
    label: "발급완료",
    className:
      "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
  },
  ARCHIVED: {
    label: "보관",
    className:
      "border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400",
  },
};

// ── 결재 상태 Badge (Phase 3) ──
export const approvalStatusConfig: Record<string, BadgeConfig> = {
  PENDING: {
    label: "대기",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  },
  APPROVED: {
    label: "승인",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  REJECTED: {
    label: "반려",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
  SKIPPED: {
    label: "후속생략",
    className:
      "border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-500",
  },
};
