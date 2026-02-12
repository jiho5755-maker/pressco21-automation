import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { SeverancePayTable } from "@/components/accounting/severance-pay-table";
import { calculateSeverancePay } from "@/lib/severance-pay-calculator";
import { subMonths } from "date-fns";
import { formatCurrency } from "@/lib/accounting-utils";

export default async function SeverancePayPage() {
  const session = await auth();

  // RBAC: Admin만 접근 가능
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const now = new Date();

  // 재직자 조회
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      employeeNo: true,
      name: true,
      departmentId: true,
      department: { select: { name: true } },
      position: true,
      joinDate: true,
      baseSalary: true,
      mealAllowance: true,
      transportAllowance: true,
      positionAllowance: true,
    },
  });

  // 각 직원의 최근 3개월 급여 기록 조회
  const threeMonthsAgo = subMonths(now, 3);
  const allPayrolls = await prisma.payrollRecord.findMany({
    where: {
      employeeId: { in: employees.map((e) => e.id) },
      OR: [
        {
          year: threeMonthsAgo.getFullYear(),
          month: { gte: threeMonthsAgo.getMonth() + 1 },
        },
        {
          year: now.getFullYear(),
          month: { lte: now.getMonth() + 1 },
        },
      ],
    },
    select: { employeeId: true, totalGross: true, year: true, month: true },
  });

  // 직원별 퇴직금 계산
  const estimates = employees.map((emp) => {
    const recentPayrolls = allPayrolls
      .filter((p) => p.employeeId === emp.id)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })
      .slice(0, 3);

    const result = calculateSeverancePay(emp, recentPayrolls);

    return {
      id: emp.id,
      employeeNumber: emp.employeeNo,
      name: emp.name,
      departmentName: emp.department.name,
      position: emp.position,
      hireDate: emp.joinDate,
      ...result,
    };
  });

  // 총 퇴직금 추계액
  const totalSeverancePay = estimates.reduce(
    (sum, e) => sum + e.severancePay,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="퇴직금 추계"
        description="재직자별 퇴직금 추계액을 계산합니다"
      />

      <div className="bg-muted p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">
          총 퇴직금 추계액 (재직자 {estimates.length}명)
        </p>
        <p className="text-2xl font-bold">{formatCurrency(totalSeverancePay)}</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {estimates.length > 0 ? (
            <SeverancePayTable employees={estimates} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              재직자가 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
