// 경비 신청 페이지 — DB 기반
import { PageHeader } from "@/components/shared/page-header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseHistory } from "@/components/expenses/expense-history";
import { prisma } from "@/lib/prisma";
import {
  getDataScope,
  buildEmployeeFilter,
  getCurrentUserEmployee,
} from "@/lib/rbac-helpers";

export default async function ExpensesPage() {
  // 데이터 범위 및 필터 생성
  const scope = await getDataScope();
  const currentEmployee = await getCurrentUserEmployee();
  const employeeFilter = buildEmployeeFilter(scope, currentEmployee);

  // 경비 조회 (역할별 필터링)
  const expenses = await prisma.expense.findMany({
    where: {
      employee: employeeFilter, // 역할별 필터 적용
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeNo: true,
          name: true,
          departmentId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <>
      <PageHeader
        title="경비 신청"
        description="경비를 신청하고 처리 현황을 확인합니다."
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <ExpenseForm />
        <ExpenseHistory expenses={expenses} />
      </div>
    </>
  );
}
