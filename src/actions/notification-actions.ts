/**
 * 알림 시스템 Server Actions
 *
 * Phase 3-F: 이메일 알림 발송 (Resend)
 * - 지원금 마감 알림
 * - 결재 요청 알림
 * - 결재 결과 알림
 */

"use server";

import { Resend } from "resend";
import { render } from "@react-email/render";
import { differenceInDays, format } from "date-fns";
import { prisma } from "@/lib/prisma";
import type { NotificationResult } from "@/types/notification";
import SubsidyDeadlineReminder from "@/emails/subsidy-deadline-reminder";
import { SUBSIDY_TYPES } from "@/lib/constants";

// Resend 클라이언트 초기화
const resend = new Resend(process.env.RESEND_API_KEY);

// 이메일 발신자 정보
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "PRESSCO21 <admin@pressco21.com>";

/**
 * 지원금 마감 알림 이메일 발송
 *
 * @param employeeId - 직원 ID
 * @param subsidyType - 지원금 유형 (SUBSIDY_TYPES 키)
 * @param deadline - 마감일 (Date 객체 또는 ISO 문자열)
 * @param estimatedAmount - 예상 지급액 (원)
 * @param subsidyId - 지원금 신청 ID (선택, 기존 신청 시 전달)
 * @returns 발송 결과 (성공 여부, 오류 메시지, 이메일 ID)
 *
 * @example
 * ```ts
 * await sendSubsidyDeadlineReminder(
 *   "cm6g2a8h100006gbqf5fkgjfx",
 *   "FLEXIBLE_WORK",
 *   new Date("2026-02-28"),
 *   600000,
 *   "cm6g2a8h100006gbqf5fkgjfx"
 * );
 * ```
 */
export async function sendSubsidyDeadlineReminder(
  employeeId: string,
  subsidyType: keyof typeof SUBSIDY_TYPES,
  deadline: Date | string,
  estimatedAmount: number,
  subsidyId?: string
): Promise<NotificationResult> {
  try {
    // 1. 직원 정보 조회
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        name: true,
        email: true,
      },
    });

    if (!employee) {
      return {
        success: false,
        error: "직원을 찾을 수 없습니다.",
      };
    }

    if (!employee.email) {
      return {
        success: false,
        error: "직원의 이메일 주소가 없습니다.",
      };
    }

    // 2. 마감일 계산
    const deadlineDate = typeof deadline === "string" ? new Date(deadline) : deadline;
    const today = new Date();
    const dDay = differenceInDays(deadlineDate, today);

    if (dDay < 0) {
      return {
        success: false,
        error: "마감일이 이미 지났습니다.",
      };
    }

    // 3. 지원금 유형명
    const subsidyTypeName = SUBSIDY_TYPES[subsidyType];
    if (!subsidyTypeName) {
      return {
        success: false,
        error: "유효하지 않은 지원금 유형입니다.",
      };
    }

    // 4. 이메일 HTML 생성
    const emailHtml = await render(
      SubsidyDeadlineReminder({
        employeeName: employee.name,
        subsidyTypeName,
        deadline: format(deadlineDate, "yyyy-MM-dd"),
        dDay,
        estimatedAmount,
        subsidyId: subsidyId || "", // 신규 신청 시 빈 문자열
      })
    );

    // 5. 이메일 발송
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: employee.email,
      subject: `[긴급] ${subsidyTypeName} 신청 마감 D-${dDay}일 전`,
      html: emailHtml,
    });

    // 6. 발송 결과 처리
    if (result.error) {
      console.error("[이메일 발송 실패]", {
        employeeId,
        subsidyType,
        error: result.error,
      });

      return {
        success: false,
        error: `이메일 발송 실패: ${result.error.message}`,
      };
    }

    console.log("[이메일 발송 성공]", {
      employeeId,
      employeeName: employee.name,
      subsidyType,
      emailId: result.data?.id,
    });

    return {
      success: true,
      emailId: result.data?.id,
    };
  } catch (error) {
    console.error("[sendSubsidyDeadlineReminder 오류]", {
      employeeId,
      subsidyType,
      error,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 배치 지원금 마감 알림 발송 (관리자 전용)
 *
 * 특정 지원금 유형에 대해 자격이 있는 모든 직원에게 마감 알림 발송
 *
 * @param subsidyType - 지원금 유형
 * @param deadline - 마감일
 * @param eligibleEmployeeIds - 자격 있는 직원 ID 배열
 * @param estimatedAmount - 예상 지급액 (단일 금액)
 * @returns 발송 결과 요약
 *
 * @example
 * ```ts
 * await sendBatchSubsidyDeadlineReminders(
 *   "FLEXIBLE_WORK",
 *   new Date("2026-02-28"),
 *   ["emp1", "emp2", "emp3"],
 *   600000
 * );
 * ```
 */
export async function sendBatchSubsidyDeadlineReminders(
  subsidyType: keyof typeof SUBSIDY_TYPES,
  deadline: Date | string,
  eligibleEmployeeIds: string[],
  estimatedAmount: number
): Promise<{
  success: boolean;
  totalSent: number;
  totalFailed: number;
  errors: string[];
}> {
  try {
    const results = await Promise.allSettled(
      eligibleEmployeeIds.map((employeeId) =>
        sendSubsidyDeadlineReminder(employeeId, subsidyType, deadline, estimatedAmount)
      )
    );

    const successCount = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failedCount = results.length - successCount;

    const errors = results
      .filter((r) => r.status === "fulfilled" && !r.value.success)
      .map((r) => (r.status === "fulfilled" ? r.value.error : "알 수 없는 오류"))
      .filter((e): e is string => !!e);

    console.log("[배치 이메일 발송 완료]", {
      subsidyType,
      total: results.length,
      success: successCount,
      failed: failedCount,
    });

    return {
      success: failedCount === 0,
      totalSent: successCount,
      totalFailed: failedCount,
      errors,
    };
  } catch (error) {
    console.error("[sendBatchSubsidyDeadlineReminders 오류]", {
      subsidyType,
      error,
    });

    return {
      success: false,
      totalSent: 0,
      totalFailed: eligibleEmployeeIds.length,
      errors: [error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다."],
    };
  }
}

// ============================================================================
// Phase 3-F-2: 전자결재 이메일 템플릿
// ============================================================================

/**
 * 결재 요청 이메일 발송
 *
 * 문서 제출 시 다음 결재자에게 알림 발송
 *
 * @param approverId - 결재자 ID (User ID)
 * @param documentId - 문서 ID
 * @returns 발송 결과 (성공 여부, 오류 메시지, 이메일 ID)
 *
 * @example
 * ```ts
 * await sendApprovalRequest(
 *   "cm6g2a8h100006gbqf5fkgjfx", // 결재자 User ID
 *   "cm6g2a8h100006gbqf5fkgjfy"  // 문서 ID
 * );
 * ```
 */
export async function sendApprovalRequest(
  approverId: string,
  documentId: string
): Promise<NotificationResult> {
  try {
    // 1. 결재자 정보 조회
    const approver = await prisma.user.findUnique({
      where: { id: approverId },
      select: {
        email: true,
        employee: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!approver) {
      return {
        success: false,
        error: "결재자를 찾을 수 없습니다.",
      };
    }

    if (!approver.email) {
      return {
        success: false,
        error: "결재자의 이메일 주소가 없습니다.",
      };
    }

    if (!approver.employee) {
      return {
        success: false,
        error: "결재자의 직원 정보를 찾을 수 없습니다.",
      };
    }

    // 2. 문서 정보 조회
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        employee: {
          select: { name: true },
        },
        creator: {
          select: {
            employee: {
              select: { name: true },
            },
          },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        error: "문서를 찾을 수 없습니다.",
      };
    }

    // 3. 문서 유형명 (DOCUMENT_TYPES에서 가져오기)
    const { DOCUMENT_TYPES } = await import("@/lib/constants");
    const documentTypeName = DOCUMENT_TYPES[document.type as keyof typeof DOCUMENT_TYPES];

    // 4. 이메일 HTML 생성
    const DocumentApprovalRequest = (await import("@/emails/document-approval-request"))
      .default;

    const emailHtml = await render(
      DocumentApprovalRequest({
        approverName: approver.employee.name,
        documentTypeName,
        documentTitle: document.title,
        creatorName: document.creator?.employee?.name || "알 수 없음",
        documentId: document.id,
      })
    );

    // 5. 이메일 발송
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: approver.email,
      subject: `[결재 요청] ${documentTypeName} - ${document.creator?.employee?.name || "알 수 없음"}`,
      html: emailHtml,
    });

    // 6. 발송 결과 처리
    if (result.error) {
      console.error("[결재 요청 이메일 발송 실패]", {
        approverId,
        documentId,
        error: result.error,
      });

      return {
        success: false,
        error: `이메일 발송 실패: ${result.error.message}`,
      };
    }

    console.log("[결재 요청 이메일 발송 성공]", {
      approverId,
      approverName: approver.employee.name,
      documentId,
      documentTitle: document.title,
      emailId: result.data?.id,
    });

    return {
      success: true,
      emailId: result.data?.id,
    };
  } catch (error) {
    console.error("[sendApprovalRequest 오류]", {
      approverId,
      documentId,
      error,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}

/**
 * 결재 결과 이메일 발송 (승인/반려)
 *
 * 결재 처리 완료 시 작성자에게 알림 발송
 *
 * @param creatorId - 작성자 ID (User ID)
 * @param documentId - 문서 ID
 * @param isApproved - 승인 여부 (true: 승인, false: 반려)
 * @param rejectionReason - 반려 사유 (반려 시 필수)
 * @returns 발송 결과 (성공 여부, 오류 메시지, 이메일 ID)
 *
 * @example
 * ```ts
 * // 승인
 * await sendApprovalResult(
 *   "cm6g2a8h100006gbqf5fkgjfx", // 작성자 User ID
 *   "cm6g2a8h100006gbqf5fkgjfy", // 문서 ID
 *   true
 * );
 *
 * // 반려
 * await sendApprovalResult(
 *   "cm6g2a8h100006gbqf5fkgjfx",
 *   "cm6g2a8h100006gbqf5fkgjfy",
 *   false,
 *   "계약 기간이 명확하지 않습니다."
 * );
 * ```
 */
export async function sendApprovalResult(
  creatorId: string,
  documentId: string,
  isApproved: boolean,
  rejectionReason?: string
): Promise<NotificationResult> {
  try {
    // 1. 작성자 정보 조회
    const creator = await prisma.user.findUnique({
      where: { id: creatorId },
      select: {
        email: true,
        employee: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!creator) {
      return {
        success: false,
        error: "작성자를 찾을 수 없습니다.",
      };
    }

    if (!creator.email) {
      return {
        success: false,
        error: "작성자의 이메일 주소가 없습니다.",
      };
    }

    if (!creator.employee) {
      return {
        success: false,
        error: "작성자의 직원 정보를 찾을 수 없습니다.",
      };
    }

    // 2. 문서 정보 조회
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        approvals: {
          where: {
            status: isApproved ? "APPROVED" : "REJECTED",
          },
          orderBy: {
            updatedAt: "desc",
          },
          take: 1,
          include: {
            approver: {
              select: {
                employee: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!document) {
      return {
        success: false,
        error: "문서를 찾을 수 없습니다.",
      };
    }

    // 3. 최신 결재자 정보
    const latestApproval = document.approvals[0];
    if (!latestApproval) {
      return {
        success: false,
        error: "결재 정보를 찾을 수 없습니다.",
      };
    }

    const approverName = latestApproval.approver?.employee?.name || "알 수 없음";

    // 4. 문서 유형명
    const { DOCUMENT_TYPES } = await import("@/lib/constants");
    const documentTypeName = DOCUMENT_TYPES[document.type as keyof typeof DOCUMENT_TYPES];

    // 5. 이메일 HTML 생성 (승인/반려 분기)
    let emailHtml: string;
    let subject: string;

    if (isApproved) {
      const DocumentApproved = (await import("@/emails/document-approved")).default;

      emailHtml = await render(
        DocumentApproved({
          creatorName: creator.employee.name,
          documentTypeName,
          documentTitle: document.title,
          approverName,
          documentId: document.id,
        })
      );

      subject = `[결재 승인] ${documentTypeName} 승인 완료`;
    } else {
      if (!rejectionReason) {
        return {
          success: false,
          error: "반려 사유가 필요합니다.",
        };
      }

      const DocumentRejected = (await import("@/emails/document-rejected")).default;

      emailHtml = await render(
        DocumentRejected({
          creatorName: creator.employee.name,
          documentTypeName,
          documentTitle: document.title,
          approverName,
          rejectionReason,
          documentId: document.id,
        })
      );

      subject = `[결재 반려] ${documentTypeName} 반려됨`;
    }

    // 6. 이메일 발송
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: creator.email,
      subject,
      html: emailHtml,
    });

    // 7. 발송 결과 처리
    if (result.error) {
      console.error("[결재 결과 이메일 발송 실패]", {
        creatorId,
        documentId,
        isApproved,
        error: result.error,
      });

      return {
        success: false,
        error: `이메일 발송 실패: ${result.error.message}`,
      };
    }

    console.log("[결재 결과 이메일 발송 성공]", {
      creatorId,
      creatorName: creator.employee.name,
      documentId,
      documentTitle: document.title,
      isApproved,
      emailId: result.data?.id,
    });

    return {
      success: true,
      emailId: result.data?.id,
    };
  } catch (error) {
    console.error("[sendApprovalResult 오류]", {
      creatorId,
      documentId,
      isApproved,
      error,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
    };
  }
}
