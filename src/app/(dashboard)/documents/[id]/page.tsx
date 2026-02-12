// 문서 상세 페이지 (Server Component, Phase 3-C)
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { DocumentDetailClient } from "@/components/documents/document-detail-client";

interface DocumentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DocumentDetailPage({
  params,
}: DocumentDetailPageProps) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  // 문서 조회 (관계 데이터 포함)
  const document = await prisma.document.findUnique({
    where: { id },
    include: {
      employee: {
        include: { department: true },
      },
      creator: true,
      approvals: {
        include: { approver: true },
        orderBy: { approvalOrder: "asc" },
      },
      attachments: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!document) notFound();

  return (
    <DocumentDetailClient
      document={document}
      currentUserId={session.user.id}
      currentUserRole={session.user.role || "viewer"}
    />
  );
}
