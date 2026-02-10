// 급여 관리 페이지 (Server Component) - Admin 전용
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { PayrollPageClient } from "./client";

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  // 권한 검증: Admin만 접근 가능
  const session = await auth();
  const role = session?.user?.role || "viewer";

  if (role !== "admin") {
    redirect("/dashboard"); // Manager/Viewer는 리다이렉트
  }

  const params = await searchParams;
  const now = new Date();
  const year = params.year ? parseInt(params.year) : now.getFullYear();
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1;

  // 지정된 연월 급여 기록 조회 (Admin이므로 전체 조회)
  const payrollRecords = await prisma.payrollRecord.findMany({
    where: { year, month },
    include: {
      employee: { include: { department: true } },
    },
    orderBy: [
      { employee: { department: { sortOrder: "asc" } } },
      { employee: { name: "asc" } },
    ],
  });

  // 통계 계산
  const stats = {
    totalGross: payrollRecords.reduce((sum, r) => sum + r.totalGross, 0),
    totalDeduction: payrollRecords.reduce(
      (sum, r) => sum + r.totalInsurance + r.incomeTax + r.localIncomeTax,
      0
    ),
    totalNetSalary: payrollRecords.reduce((sum, r) => sum + r.netSalary, 0),
    confirmedCount: payrollRecords.filter((r) => r.isConfirmed).length,
    totalCount: payrollRecords.length,
  };

  // 활성 직원 목록 (급여 생성용) - Admin이므로 전체 조회
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      employeeNo: true,
      name: true,
      departmentId: true,
      useFixedOT: true,
    },
    orderBy: { name: "asc" },
  });

  // 부서 목록 (필터용)
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <PageHeader
        title="급여 관리"
        description="월별 급여를 계산, 확정 및 관리합니다."
      />
      <Suspense fallback={<div>로딩 중...</div>}>
        <PayrollPageClient
          initialRecords={payrollRecords}
          initialStats={stats}
          employees={employees}
          departments={departments}
          initialYear={year}
          initialMonth={month}
        />
      </Suspense>
    </>
  );
}
