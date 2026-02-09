// 직원 관리 페이지 — DB 기반
import { PageHeader } from "@/components/shared/page-header";
import { EmployeeTable } from "@/components/employees/employee-table";
import { prisma } from "@/lib/prisma";

export default async function EmployeesPage() {
  const [employees, departments] = await Promise.all([
    prisma.employee.findMany({
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
