import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { CompanyDocumentsClient } from "@/components/company-documents/company-documents-client";

export const metadata = {
  title: "회사 공용 문서",
  description: "회사에서 자주 사용하는 구비서류 관리",
};

export default async function CompanyDocumentsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userRole = session.user.role as "admin" | "manager" | "viewer";

  // 전체 문서 조회 (모든 직원 조회 가능)
  const documents = await prisma.companyDocument.findMany({
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="회사 공용 문서"
        description="통장사본, 사업자등록증 등 회사에서 자주 사용하는 구비서류를 관리합니다."
      />

      <CompanyDocumentsClient documents={documents} userRole={userRole} />
    </div>
  );
}
