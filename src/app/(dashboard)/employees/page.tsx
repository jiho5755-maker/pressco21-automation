// 직원 관리 페이지 — DB 기반 + RBAC
import { PageHeader } from "@/components/shared/page-header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getDataScope, buildEmployeeFilter, getCurrentUserEmployee } from "@/lib/rbac-helpers";
import { redirect } from "next/navigation";

export default async function EmployeesPage() {
  const session = await auth();
  const role = session?.user?.role || "viewer";

  // Viewer는 직원 목록 접근 불가
  if (role === "viewer") {
    redirect("/dashboard");
  }

  // 데이터 범위 및 필터 생성
  const scope = await getDataScope();
  const currentEmployee = await getCurrentUserEmployee();
  const employeeFilter = buildEmployeeFilter(scope, currentEmployee);

  const [employees, departments] = await Promise.all([
    prisma.employee.findMany({
      where: employeeFilter,
      include: {
        department: true,
        replacementFor: { select: { name: true, employeeNo: true } },
      },
      orderBy: { employeeNo: "asc" },
    }),
    prisma.department.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <>
      <PageHeader
        title="직원 관리"
        description="직원 정보를 조회하고 관리합니다."
      />
      <EmployeeTable employees={employees} departments={departments} />
    </>
  );
}
