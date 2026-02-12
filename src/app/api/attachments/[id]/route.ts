// 첨부파일 다운로드 API (RBAC 적용)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/attachments/[id]
 *
 * 첨부파일 다운로드 (RBAC 적용)
 * - 문서 작성자
 * - 문서 결재자 (Approval 레코드 존재)
 * - Admin
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 인증 확인
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { id } = await params;

    // 2. 첨부파일 조회 (문서 및 결재 정보 포함)
    const attachment = await prisma.attachment.findUnique({
      where: { id },
      include: {
        document: {
          include: {
            approvals: {
              select: { approverId: true },
            },
          },
        },
      },
    });

    if (!attachment) {
      return NextResponse.json(
        { error: "첨부파일을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 3. RBAC 검증
    const isCreator = attachment.document.createdBy === session.user.id;
    const isApprover = attachment.document.approvals.some(
      (approval) => approval.approverId === session.user.id
    );
    const isAdmin = session.user.role === "admin";

    if (!isCreator && !isApprover && !isAdmin) {
      return NextResponse.json(
        { error: "이 파일에 접근할 권한이 없습니다." },
        { status: 403 }
      );
    }

    // 4. Vercel Blob URL로 리다이렉트
    // Vercel Blob은 public access이므로 URL로 직접 접근 가능
    return NextResponse.redirect(attachment.fileUrl);
  } catch (error) {
    console.error("[GET /api/attachments/:id] 파일 다운로드 실패", error);
    return NextResponse.json(
      { error: "파일 다운로드 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
