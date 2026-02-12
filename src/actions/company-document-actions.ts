"use server";

import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { put, del } from "@vercel/blob";
import {
  adminActionClient,
  authActionClient,
  ActionError,
} from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import {
  validateUploadFile,
  sanitizeFileName,
} from "@/lib/file-upload-validator";

// ─────────────────────────────────────────────
// 1. 업로드 (Admin 전용)
// ─────────────────────────────────────────────

const uploadSchema = z.object({
  title: z.string().min(1, "제목을 입력하세요").max(200, "제목은 200자 이내로 입력하세요"),
  category: z.enum(["BANK", "BUSINESS_LICENSE", "SEAL", "TAX", "OTHER"] as const),
  description: z.string().optional(),
  file: z.instanceof(File, { message: "파일을 선택하세요" }),
});

export const uploadCompanyDocument = adminActionClient
  .inputSchema(uploadSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { title, category, description, file } = parsedInput;

    // 파일 검증 (클라이언트 검증 재확인)
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      throw new ActionError(validation.error || "유효하지 않은 파일입니다.");
    }

    // 파일명 sanitize
    const sanitizedFileName = sanitizeFileName(file.name);

    // Vercel Blob 업로드
    try {
      const blob = await put(sanitizedFileName, file, {
        access: "public",
        addRandomSuffix: true, // 중복 방지
      });

      // DB 저장
      const document = await prisma.companyDocument.create({
        data: {
          title,
          category,
          description: description || null,
          fileName: sanitizedFileName,
          fileUrl: blob.url,
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: ctx.userId!,
        },
      });

      revalidatePath("/company-documents");

      return { success: true, data: document };
    } catch (error) {
      console.error("[uploadCompanyDocument] 업로드 실패", error);
      throw new ActionError("파일 업로드 중 오류가 발생했습니다.");
    }
  });

// ─────────────────────────────────────────────
// 2. 삭제 (Admin 전용)
// ─────────────────────────────────────────────

const deleteSchema = z.object({
  id: z.string().min(1, "문서 ID가 필요합니다"),
});

export const deleteCompanyDocument = adminActionClient
  .inputSchema(deleteSchema)
  .action(async ({ parsedInput }) => {
    const { id } = parsedInput;

    // 문서 조회
    const document = await prisma.companyDocument.findUnique({
      where: { id },
    });

    if (!document) {
      throw new ActionError("문서를 찾을 수 없습니다.");
    }

    // Vercel Blob 파일 삭제 (실패해도 DB는 삭제)
    try {
      await del(document.fileUrl);
    } catch (blobError) {
      console.error("[deleteCompanyDocument] Blob 삭제 실패", {
        fileUrl: document.fileUrl,
        error: blobError,
      });
      // 계속 진행 (DB는 삭제)
    }

    // DB 삭제
    await prisma.companyDocument.delete({
      where: { id },
    });

    revalidatePath("/company-documents");

    return { success: true };
  });

// ─────────────────────────────────────────────
// 3. 수정 (Admin 전용, 메타데이터만)
// ─────────────────────────────────────────────

const updateSchema = z.object({
  id: z.string().min(1, "문서 ID가 필요합니다"),
  title: z.string().min(1, "제목을 입력하세요").max(200, "제목은 200자 이내로 입력하세요"),
  category: z.enum(["BANK", "BUSINESS_LICENSE", "SEAL", "TAX", "OTHER"] as const),
  description: z.string().optional(),
});

export const updateCompanyDocument = adminActionClient
  .inputSchema(updateSchema)
  .action(async ({ parsedInput }) => {
    const { id, title, category, description } = parsedInput;

    // 문서 존재 확인
    const existingDocument = await prisma.companyDocument.findUnique({
      where: { id },
    });

    if (!existingDocument) {
      throw new ActionError("문서를 찾을 수 없습니다.");
    }

    const document = await prisma.companyDocument.update({
      where: { id },
      data: {
        title,
        category,
        description: description || null,
      },
    });

    revalidatePath("/company-documents");

    return { success: true, data: document };
  });

// ─────────────────────────────────────────────
// 4. 전체 조회 (인증된 사용자 모두)
// ─────────────────────────────────────────────

const listSchema = z.object({
  category: z.string().optional(),
});

export const getCompanyDocuments = authActionClient
  .inputSchema(listSchema)
  .action(async ({ parsedInput }) => {
    const { category } = parsedInput;

    const documents = await prisma.companyDocument.findMany({
      where: category ? { category } : undefined,
      include: {
        uploader: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    });

    return { success: true, data: documents };
  });
