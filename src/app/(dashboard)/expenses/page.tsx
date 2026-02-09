// 경비 신청 페이지 — DB 기반
import { PageHeader } from "@/components/shared/page-header";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { ExpenseHistory } from "@/components/expenses/expense-history";
import { prisma } from "@/lib/prisma";

export default async function ExpensesPage() {
  const expenses = await prisma.expense.findMany({
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
