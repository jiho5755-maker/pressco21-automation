// 문서 첨부파일 Server Actions
"use server";

import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import {
  authActionClient,
  adminActionClient,
  ActionError,
} from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import {
  validateUploadFile,
  sanitizeFileName,
} from "@/lib/file-upload-validator";

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

const uploadAttachmentSchema = z.object({
  documentId: z.string(),
  file: z.instanceof(File),
});

const deleteAttachmentSchema = z.object({
  id: z.string(),
});

// ─────────────────────────────────────────────
// 첨부파일 업로드
// 권한: 문서 작성자 또는 Admin만
// ─────────────────────────────────────────────

export const uploadAttachment = authActionClient
  .inputSchema(uploadAttachmentSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { documentId, file } = parsedInput;

    // 1. 문서 조회 및 권한 검증
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      select: { createdBy: true, status: true },
    });

    if (!document) {
      throw new ActionError("문서를 찾을 수 없습니다.");
    }

    // 작성자 또는 Admin만 첨부 가능
    if (ctx.userRole !== "admin" && document.createdBy !== ctx.userId) {
      throw new ActionError("문서 작성자만 파일을 첨부할 수 있습니다.");
    }

    // DRAFT 상태에서만 첨부 가능
    if (document.status !== "DRAFT") {
      throw new ActionError("작성 중인 문서만 파일을 첨부할 수 있습니다.");
    }

    // 2. 파일 검증
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      throw new ActionError(validation.error || "파일 검증 실패");
    }

    // 3. 기존 첨부파일 개수 확인 (최대 5개)
    const existingCount = await prisma.attachment.count({
      where: { documentId },
    });

    if (existingCount >= 5) {
      throw new ActionError("문서당 최대 5개의 파일만 첨부할 수 있습니다.");
    }

    // 4. 파일명 정제
    const sanitizedFileName = sanitizeFileName(file.name);

    try {
      // 5. Vercel Blob에 업로드
      const blob = await put(sanitizedFileName, file, {
        access: "public",
        addRandomSuffix: false, // 타임스탬프로 이미 충돌 방지됨
      });

      // 6. DB에 첨부파일 레코드 생성
      const attachment = await prisma.attachment.create({
        data: {
          documentId,
          fileName: file.name, // 원본 파일명
          fileUrl: blob.url, // Vercel Blob URL
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: ctx.userId,
        },
      });

      // 7. 경로 재검증
      revalidatePath("/documents");
      revalidatePath(`/documents/${documentId}`);

      return {
        success: true,
        data: {
          id: attachment.id,
          fileName: attachment.fileName,
          fileSize: attachment.fileSize,
          downloadUrl: attachment.fileUrl,
        },
      };
    } catch (error) {
      console.error("[uploadAttachment] Blob 업로드 실패", {
        documentId,
        fileName: file.name,
        error,
      });
      throw new ActionError("파일 업로드 중 오류가 발생했습니다.");
    }
  });

// ─────────────────────────────────────────────
// 첨부파일 삭제
// 권한: Admin만
// ─────────────────────────────────────────────

export const deleteAttachment = adminActionClient
  .inputSchema(deleteAttachmentSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    // 1. 첨부파일 조회
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        document: {
          select: { status: true },
        },
      },
    });

    if (!attachment) {
      throw new ActionError("첨부파일을 찾을 수 없습니다.");
    }

    // DRAFT 상태에서만 삭제 가능
    if (attachment.document.status !== "DRAFT") {
      throw new ActionError("작성 중인 문서의 파일만 삭제할 수 있습니다.");
    }

    try {
      // 2. Vercel Blob에서 삭제 (선택적)
      // Note: Vercel Blob의 del() API는 별도 패키지 필요
      // MVP에서는 DB 레코드만 삭제하고 Blob은 수동 관리

      // 3. DB에서 첨부파일 레코드 삭제
      await prisma.attachment.delete({
        where: { id },
      });

      // 4. 경로 재검증
      revalidatePath("/documents");
      revalidatePath(`/documents/${attachment.documentId}`);

      return { success: true };
    } catch (error) {
      console.error("[deleteAttachment] 삭제 실패", {
        attachmentId: id,
        error,
      });
      throw new ActionError("파일 삭제 중 오류가 발생했습니다.");
    }
  });

// ─────────────────────────────────────────────
// 첨부파일 목록 조회
// 권한: 인증된 사용자
// ─────────────────────────────────────────────

export const getAttachmentsByDocument = authActionClient
  .inputSchema(z.object({ documentId: z.string() }))
  .action(async ({ parsedInput }) => {
    const { documentId } = parsedInput;

    const attachments = await prisma.attachment.findMany({
      where: { documentId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        fileName: true,
        fileSize: true,
        mimeType: true,
        fileUrl: true,
        createdAt: true,
      },
    });

    return { success: true, data: attachments };
  });
