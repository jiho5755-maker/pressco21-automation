"use server";

// 문서/전자결재 CRUD Server Actions (Phase 3)
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  authActionClient,
  managerActionClient,
  adminActionClient,
  ActionError,
} from "@/lib/safe-action";

// ── 문서 생성 스키마 ──
const createDocumentSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요.").max(200, "제목은 200자 이하로 입력해주세요."),
  type: z.enum([
    "EMPLOYMENT_CONTRACT",
    "PAYSLIP",
    "RESIGNATION",
    "NOTICE",
    "OTHER",
  ]),
  employeeId: z.string().min(1, "대상 직원을 선택해주세요."),
  content: z.string(), // JSON 문자열
  template: z.string().optional(),
  approvers: z
    .array(
      z.object({
        approverId: z.string(),
        approvalOrder: z.number().int().positive(),
      })
    )
    .min(1, "최소 1명의 결재자를 지정해주세요.")
    .max(5, "결재자는 최대 5명까지 지정할 수 있습니다."),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;

/**
 * 문서 생성 및 결재라인 설정
 * 권한: 인증된 사용자 (authActionClient)
 */
export const createDocument = authActionClient
  .inputSchema(createDocumentSchema)
  .action(async ({ parsedInput, ctx }) => {
    // 트랜잭션: Document + Approval 동시 생성
    const result = await prisma.$transaction(async (tx) => {
      // 1. 문서 생성
      const document = await tx.document.create({
        data: {
          title: parsedInput.title,
          type: parsedInput.type,
          employeeId: parsedInput.employeeId,
          createdBy: ctx.userId,
          content: parsedInput.content,
          template: parsedInput.template,
          status: "PENDING_APPROVAL", // 결재 요청 상태로 생성
          versionNumber: 1,
        },
      });

      // 2. 결재라인 생성
      for (const approver of parsedInput.approvers) {
        await tx.approval.create({
          data: {
            documentId: document.id,
            approverId: approver.approverId,
            approvalOrder: approver.approvalOrder,
            status: "PENDING",
          },
        });
      }

      return document;
    });

    revalidatePath("/documents");
    revalidatePath("/dashboard");
    return { success: true, document: result };
  });

// ── 문서 수정 스키마 (초안만) ──
const updateDocumentSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().optional(),
  approvers: z
    .array(
      z.object({
        approverId: z.string(),
        approvalOrder: z.number().int().positive(),
      })
    )
    .min(1)
    .max(5)
    .optional(),
});

export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

/**
 * 문서 수정 (초안 상태만)
 * 권한: 작성자 본인 or Admin
 */
export const updateDocument = authActionClient
  .inputSchema(updateDocumentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.document.findUnique({
      where: { id: parsedInput.id },
      include: { approvals: true },
    });

    if (!existing) throw new ActionError("문서를 찾을 수 없습니다.");

    // 초안 상태만 수정 가능
    if (existing.status !== "DRAFT" && existing.status !== "PENDING_APPROVAL") {
      throw new ActionError("결재 진행 중이거나 완료된 문서는 수정할 수 없습니다.");
    }

    // 권한 검증: 작성자 본인 or Admin
    if (existing.createdBy !== ctx.userId && ctx.userRole !== "admin") {
      throw new ActionError("본인이 작성한 문서만 수정할 수 있습니다.");
    }

    // 트랜잭션: 문서 수정 + 결재라인 재설정
    const result = await prisma.$transaction(async (tx) => {
      // 1. 문서 수정
      const updated = await tx.document.update({
        where: { id: parsedInput.id },
        data: {
          title: parsedInput.title,
          content: parsedInput.content,
        },
      });

      // 2. 결재라인 재설정 (approvers가 제공된 경우)
      if (parsedInput.approvers && parsedInput.approvers.length > 0) {
        // 기존 결재라인 삭제
        await tx.approval.deleteMany({
          where: { documentId: parsedInput.id },
        });

        // 새 결재라인 생성
        for (const approver of parsedInput.approvers) {
          await tx.approval.create({
            data: {
              documentId: parsedInput.id,
              approverId: approver.approverId,
              approvalOrder: approver.approvalOrder,
              status: "PENDING",
            },
          });
        }
      }

      return updated;
    });

    revalidatePath("/documents");
    return { success: true, document: result };
  });

// ── 문서 삭제 스키마 ──
const deleteDocumentSchema = z.object({
  id: z.string(),
});

/**
 * 문서 삭제 (초안만)
 * 권한: 작성자 본인 or Admin
 */
export const deleteDocument = authActionClient
  .inputSchema(deleteDocumentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.document.findUnique({
      where: { id: parsedInput.id },
    });

    if (!existing) throw new ActionError("문서를 찾을 수 없습니다.");

    // 초안 또는 반려 상태만 삭제 가능
    if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
      throw new ActionError("초안 또는 반려된 문서만 삭제할 수 있습니다.");
    }

    // 권한 검증: 작성자 본인 or Admin
    if (existing.createdBy !== ctx.userId && ctx.userRole !== "admin") {
      throw new ActionError("본인이 작성한 문서만 삭제할 수 있습니다.");
    }

    await prisma.document.delete({
      where: { id: parsedInput.id },
    });

    revalidatePath("/documents");
    return { success: true };
  });

// ── 결재 승인 스키마 ──
const approveDocumentSchema = z.object({
  approvalId: z.string(),
  comment: z.string().max(500, "의견은 500자 이하로 입력해주세요.").optional(),
});

/**
 * 순차 결재 승인
 * 권한: Manager 이상 (Manager는 자기 부서만)
 */
export const approveDocument = managerActionClient
  .inputSchema(approveDocumentSchema)
  .action(async ({ parsedInput, ctx }) => {
    // 1. 현재 결재 단계 확인
    const approval = await prisma.approval.findUnique({
      where: { id: parsedInput.approvalId },
      include: {
        document: {
          include: {
            employee: {
              include: { department: true },
            },
          },
        },
      },
    });

    if (!approval) throw new ActionError("결재 정보를 찾을 수 없습니다.");
    if (approval.status !== "PENDING") {
      throw new ActionError("이미 처리된 결재입니다.");
    }

    // 2. 결재자 본인 확인
    if (approval.approverId !== ctx.userId) {
      throw new ActionError("담당 결재자만 승인할 수 있습니다.");
    }

    // 3. Manager 부서 검증 (expense-actions.ts 패턴)
    if (ctx.userRole === "manager") {
      const currentEmployee = await prisma.employee.findUnique({
        where: { userId: ctx.userId },
      });

      if (!currentEmployee) {
        throw new ActionError("직원 정보를 찾을 수 없습니다.");
      }

      // 같은 부서인지 확인
      if (
        approval.document.employee.departmentId !== currentEmployee.departmentId
      ) {
        throw new ActionError("다른 부서 직원의 문서는 승인할 수 없습니다.");
      }
    }

    // 4. 이전 순위 승인 확인 (순차 결재)
    if (approval.approvalOrder > 1) {
      const previousApproval = await prisma.approval.findFirst({
        where: {
          documentId: approval.documentId,
          approvalOrder: approval.approvalOrder - 1,
        },
      });

      if (previousApproval?.status !== "APPROVED") {
        throw new ActionError("이전 순위 결재가 승인되지 않았습니다.");
      }
    }

    // 5. 트랜잭션: 결재 처리 + 문서 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      // 현재 결재 승인
      const updated = await tx.approval.update({
        where: { id: parsedInput.approvalId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
          comment: parsedInput.comment,
        },
      });

      // 전체 결재 완료 확인
      const allApprovals = await tx.approval.findMany({
        where: { documentId: approval.documentId },
      });

      const allApproved = allApprovals.every((a) => a.status === "APPROVED");

      // 모든 결재 완료 시 문서 상태 업데이트
      if (allApproved) {
        await tx.document.update({
          where: { id: approval.documentId },
          data: { status: "APPROVED" },
        });
      }

      return { approval: updated, documentComplete: allApproved };
    });

    revalidatePath("/documents");
    return { success: true, ...result };
  });

// ── 결재 반려 스키마 ──
const rejectDocumentSchema = z.object({
  approvalId: z.string(),
  rejectReason: z
    .string()
    .min(1, "반려 사유를 입력해주세요.")
    .max(500, "반려 사유는 500자 이하로 입력해주세요."),
});

/**
 * 결재 반려 (후속 결재 모두 SKIPPED)
 * 권한: Manager 이상 (Manager는 자기 부서만)
 */
export const rejectDocument = managerActionClient
  .inputSchema(rejectDocumentSchema)
  .action(async ({ parsedInput, ctx }) => {
    // 1. 결재 확인 (approveDocument와 동일)
    const approval = await prisma.approval.findUnique({
      where: { id: parsedInput.approvalId },
      include: {
        document: {
          include: {
            employee: {
              include: { department: true },
            },
          },
        },
      },
    });

    if (!approval) throw new ActionError("결재 정보를 찾을 수 없습니다.");
    if (approval.status !== "PENDING") {
      throw new ActionError("이미 처리된 결재입니다.");
    }

    // 2. 결재자 본인 확인
    if (approval.approverId !== ctx.userId) {
      throw new ActionError("담당 결재자만 반려할 수 있습니다.");
    }

    // 3. Manager 부서 검증
    if (ctx.userRole === "manager") {
      const currentEmployee = await prisma.employee.findUnique({
        where: { userId: ctx.userId },
      });

      if (!currentEmployee) {
        throw new ActionError("직원 정보를 찾을 수 없습니다.");
      }

      if (
        approval.document.employee.departmentId !== currentEmployee.departmentId
      ) {
        throw new ActionError("다른 부서 직원의 문서는 반려할 수 없습니다.");
      }
    }

    // 4. 트랜잭션: 현재 결재 반려 + 후속 결재 SKIPPED + 문서 상태 반려
    const result = await prisma.$transaction(async (tx) => {
      // 현재 결재 반려
      const rejected = await tx.approval.update({
        where: { id: parsedInput.approvalId },
        data: {
          status: "REJECTED",
          rejectedAt: new Date(),
          comment: parsedInput.rejectReason,
        },
      });

      // 후속 결재 SKIPPED
      await tx.approval.updateMany({
        where: {
          documentId: approval.documentId,
          approvalOrder: { gt: approval.approvalOrder },
        },
        data: { status: "SKIPPED" },
      });

      // 문서 상태 반려
      await tx.document.update({
        where: { id: approval.documentId },
        data: { status: "REJECTED" },
      });

      return rejected;
    });

    revalidatePath("/documents");
    return { success: true, approval: result };
  });

// ── 최종 발급 스키마 ──
const issueDocumentSchema = z.object({
  documentId: z.string(),
});

/**
 * 최종 발급 (Admin 전용)
 * 권한: Admin만
 */
export const issueDocument = adminActionClient
  .inputSchema(issueDocumentSchema)
  .action(async ({ parsedInput }) => {
    const document = await prisma.document.findUnique({
      where: { id: parsedInput.documentId },
    });

    if (!document) throw new ActionError("문서를 찾을 수 없습니다.");

    if (document.status !== "APPROVED") {
      throw new ActionError("승인된 문서만 발급할 수 있습니다.");
    }

    const updated = await prisma.document.update({
      where: { id: parsedInput.documentId },
      data: {
        status: "ISSUED",
        issuedAt: new Date(),
      },
    });

    revalidatePath("/documents");
    return { success: true, document: updated };
  });

// ── 문서 보관 스키마 ──
const archiveDocumentSchema = z.object({
  documentId: z.string(),
});

/**
 * 문서 보관 (Admin 전용)
 * 권한: Admin만
 */
export const archiveDocument = adminActionClient
  .inputSchema(archiveDocumentSchema)
  .action(async ({ parsedInput }) => {
    const document = await prisma.document.findUnique({
      where: { id: parsedInput.documentId },
    });

    if (!document) throw new ActionError("문서를 찾을 수 없습니다.");

    if (document.status !== "ISSUED") {
      throw new ActionError("발급된 문서만 보관할 수 있습니다.");
    }

    const updated = await prisma.document.update({
      where: { id: parsedInput.documentId },
      data: {
        status: "ARCHIVED",
      },
    });

    revalidatePath("/documents");
    return { success: true, document: updated };
  });
