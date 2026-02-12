// 알림 생성 헬퍼 함수 — 중복 코드 방지, 비즈니스 로직 중앙화
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * 사용자 정보 조회 (스냅샷용)
 *
 * recipientName, recipientEmail 스냅샷 보존
 * User 삭제 시에도 알림 기록 유지 (SetNull 관계)
 */
async function getUserSnapshot(userId: string): Promise<{
  name: string;
  email: string;
} | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      email: true,
    },
  });

  if (!user || !user.name || !user.email) {
    return null;
  }

  return {
    name: user.name,
    email: user.email,
  };
}

/**
 * 웹 알림 생성 (공통 헬퍼)
 *
 * 모든 승인/반려 Server Actions에서 호출
 * Notification 테이블에 레코드 생성 + revalidatePath 자동 처리
 */
export async function createWebNotification(params: {
  recipientId: string;
  type: string;
  title: string;
  message: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  actionUrl?: string;
}): Promise<{ success: boolean; notificationId: string }> {
  // 수신자 정보 조회 (스냅샷)
  const snapshot = await getUserSnapshot(params.recipientId);
  if (!snapshot) {
    throw new Error(`User not found or incomplete: ${params.recipientId}`);
  }

  const notification = await prisma.notification.create({
    data: {
      recipientId: params.recipientId,
      recipientName: snapshot.name,
      recipientEmail: snapshot.email,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedEntityType: params.relatedEntityType,
      relatedEntityId: params.relatedEntityId,
      actionUrl: params.actionUrl,
    },
  });

  revalidatePath("/notifications");
  return { success: true, notificationId: notification.id };
}

/**
 * 경비 승인 알림
 */
export async function notifyExpenseApproved(expenseId: string): Promise<void> {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      submitter: {
        select: { id: true, name: true },
      },
    },
  });

  if (!expense || !expense.submitter) return;

  await createWebNotification({
    recipientId: expense.submitterId,
    type: "EXPENSE_APPROVED",
    title: "경비 승인 완료",
    message: `"${expense.title}" 경비가 승인되었습니다. (${expense.amount.toLocaleString()}원)`,
    relatedEntityType: "Expense",
    relatedEntityId: expenseId,
    actionUrl: `/expenses`,
  });
}

/**
 * 경비 반려 알림
 */
export async function notifyExpenseRejected(
  expenseId: string,
  rejectReason: string
): Promise<void> {
  const expense = await prisma.expense.findUnique({
    where: { id: expenseId },
    include: {
      submitter: {
        select: { id: true, name: true },
      },
    },
  });

  if (!expense || !expense.submitter) return;

  await createWebNotification({
    recipientId: expense.submitterId,
    type: "EXPENSE_REJECTED",
    title: "경비 반려됨",
    message: `"${expense.title}" 경비가 반려되었습니다. 사유: ${rejectReason}`,
    relatedEntityType: "Expense",
    relatedEntityId: expenseId,
    actionUrl: `/expenses`,
  });
}

/**
 * 휴가 승인 알림
 */
export async function notifyLeaveApproved(leaveId: string): Promise<void> {
  const leave = await prisma.leaveRecord.findUnique({
    where: { id: leaveId },
    include: {
      employee: {
        select: {
          userId: true,
          name: true,
        },
      },
    },
  });

  if (!leave || !leave.employee.userId) return;

  const { LEAVE_TYPES } = await import("@/lib/constants");
  const leaveTypeName = LEAVE_TYPES[leave.type as keyof typeof LEAVE_TYPES] || leave.type;

  await createWebNotification({
    recipientId: leave.employee.userId,
    type: "LEAVE_APPROVED",
    title: "휴가 승인 완료",
    message: `${leaveTypeName} 신청이 승인되었습니다. (${leave.days}일)`,
    relatedEntityType: "LeaveRecord",
    relatedEntityId: leaveId,
    actionUrl: `/leaves`,
  });
}

/**
 * 휴가 반려 알림
 */
export async function notifyLeaveRejected(
  leaveId: string,
  rejectReason: string
): Promise<void> {
  const leave = await prisma.leaveRecord.findUnique({
    where: { id: leaveId },
    include: {
      employee: {
        select: {
          userId: true,
          name: true,
        },
      },
    },
  });

  if (!leave || !leave.employee.userId) return;

  const { LEAVE_TYPES } = await import("@/lib/constants");
  const leaveTypeName = LEAVE_TYPES[leave.type as keyof typeof LEAVE_TYPES] || leave.type;

  await createWebNotification({
    recipientId: leave.employee.userId,
    type: "LEAVE_REJECTED",
    title: "휴가 반려됨",
    message: `${leaveTypeName} 신청이 반려되었습니다. 사유: ${rejectReason}`,
    relatedEntityType: "LeaveRecord",
    relatedEntityId: leaveId,
    actionUrl: `/leaves`,
  });
}

/**
 * 문서 결재 대기 알림 (다음 결재자)
 *
 * 순차 결재 시 다음 결재자에게 "결재 대기" 알림 전송
 */
export async function notifyDocumentApprovalPending(
  documentId: string,
  nextApproverId: string
): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    include: {
      creator: {
        select: {
          employee: {
            select: { name: true },
          },
        },
      },
    },
  });

  if (!document) return;

  const { DOCUMENT_TYPES } = await import("@/lib/constants");
  const documentTypeName =
    DOCUMENT_TYPES[document.type as keyof typeof DOCUMENT_TYPES] || document.type;

  await createWebNotification({
    recipientId: nextApproverId,
    type: "APPROVAL_REQUEST",
    title: "결재 대기",
    message: `${document.creator?.employee?.name || "알 수 없음"}님의 ${documentTypeName} 결재가 요청되었습니다.`,
    relatedEntityType: "Document",
    relatedEntityId: documentId,
    actionUrl: `/documents`,
  });
}

/**
 * 문서 최종 승인 알림 (작성자)
 *
 * 모든 결재 완료 시 작성자에게 "승인 완료" 알림
 */
export async function notifyDocumentApproved(documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      createdBy: true,
      title: true,
      type: true,
    },
  });

  if (!document) return;

  const { DOCUMENT_TYPES } = await import("@/lib/constants");
  const documentTypeName =
    DOCUMENT_TYPES[document.type as keyof typeof DOCUMENT_TYPES] || document.type;

  await createWebNotification({
    recipientId: document.createdBy,
    type: "DOCUMENT_APPROVED",
    title: "문서 승인 완료",
    message: `"${document.title}" ${documentTypeName}가 최종 승인되었습니다.`,
    relatedEntityType: "Document",
    relatedEntityId: documentId,
    actionUrl: `/documents`,
  });
}

/**
 * 문서 반려 알림 (작성자)
 */
export async function notifyDocumentRejected(
  documentId: string,
  rejectReason: string
): Promise<void> {
  const document = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      createdBy: true,
      title: true,
      type: true,
    },
  });

  if (!document) return;

  const { DOCUMENT_TYPES } = await import("@/lib/constants");
  const documentTypeName =
    DOCUMENT_TYPES[document.type as keyof typeof DOCUMENT_TYPES] || document.type;

  await createWebNotification({
    recipientId: document.createdBy,
    type: "DOCUMENT_REJECTED",
    title: "문서 반려됨",
    message: `"${document.title}" ${documentTypeName}가 반려되었습니다. 사유: ${rejectReason}`,
    relatedEntityType: "Document",
    relatedEntityId: documentId,
    actionUrl: `/documents`,
  });
}
