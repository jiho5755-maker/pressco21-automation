// 정부지원사업 관리 메인 페이지 (Server Component)
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { SubsidiesPageClient } from "./client";
import {
  getDataScope,
  buildEmployeeFilter,
  getCurrentUserEmployee,
} from "@/lib/rbac-helpers";

export default async function SubsidiesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  // 1. RBAC 필터링 (rbac-helpers.ts 재사용)
  const scope = await getDataScope();
  const currentEmployee = await getCurrentUserEmployee();
  const employeeFilter = buildEmployeeFilter(scope, currentEmployee);

  // 2. 지원금 신청 조회 (최근 12개월)
  const currentYear = new Date().getFullYear();
  const applications = await prisma.subsidyApplication.findMany({
    where: {
      employee: employeeFilter,
      year: { gte: currentYear - 1 },
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeNo: true,
          name: true,
          departmentId: true,
          department: { select: { name: true } },
        },
      },
      submitter: { select: { id: true, name: true } },
      approver: { select: { id: true, name: true } },
      replacementEmployee: {
        select: { id: true, employeeNo: true, name: true },
      },
    },
    orderBy: { submittedAt: "desc" },
  });

  // 3. 통계 계산
  const stats = {
    totalCount: applications.length,
    approvedCount: applications.filter((a) => a.status === "APPROVED").length,
    paidCount: applications.filter((a) => a.status === "PAID").length,
    pendingCount: applications.filter((a) => a.status === "PENDING").length,
    totalApprovedAmount: applications
      .filter((a) => a.status === "APPROVED" || a.status === "PAID")
      .reduce((sum, a) => sum + (a.approvedAmount || 0), 0),
  };

  // 4. 직원 목록 (신청 폼용)
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE", ...employeeFilter },
    include: { department: true },
    orderBy: { name: "asc" },
  });

  return (
    <>
      <PageHeader
        title="정부지원사업 관리"
        description="정부 지원금을 신청하고 진행 현황을 관리합니다."
      />
      <SubsidiesPageClient
        applications={applications}
        stats={stats}
        employees={employees}
      />
    </>
  );
}
