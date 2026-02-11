// 문서 관리 메인 페이지 (Server Component, Phase 3-C)
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentsPageClient } from "@/components/documents/documents-page-client";
import {
  getDataScope,
  buildEmployeeFilter,
  getCurrentUserEmployee,
} from "@/lib/rbac-helpers";

export default async function DocumentsPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // 1. RBAC 필터링 (rbac-helpers.ts 재사용)
  const scope = await getDataScope();
  const currentEmployee = await getCurrentUserEmployee();
  const employeeFilter = buildEmployeeFilter(scope, currentEmployee);

  // 2. 문서 조회 (최근 6개월)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const documents = await prisma.document.findMany({
    where: {
      employee: employeeFilter,
      createdAt: { gte: sixMonthsAgo },
    },
    include: {
      employee: {
        include: { department: true },
      },
      creator: true,
      approvals: {
        include: { approver: true },
        orderBy: { approvalOrder: "asc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3. 직원 목록 (문서 생성 폼용)
  const employees = await prisma.employee.findMany({
    where: {
      status: { in: ["ACTIVE", "ON_LEAVE"] },
      ...employeeFilter,
    },
    include: { department: true },
    orderBy: { name: "asc" },
  });

  // 4. 결재자 목록 (Manager/Admin만)
  const users = await prisma.user.findMany({
    where: {
      role: { in: ["admin", "manager"] },
    },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="문서 관리"
        description="근로계약서, 임금명세서 등 문서를 생성하고 전자결재를 진행합니다."
      />
      <DocumentsPageClient
        documents={documents}
        employees={employees}
        users={users}
      />
    </>
  );
}
