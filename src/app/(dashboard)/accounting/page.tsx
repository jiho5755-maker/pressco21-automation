import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { AccountingOverviewCards } from "@/components/accounting/accounting-overview-cards";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Receipt, TrendingUp, Wallet } from "lucide-react";
import { calculateDCContribution, calculateMonthlyDCTotal } from "@/lib/dc-pension-calculator";
import { subMonths } from "date-fns";

export default async function AccountingPage() {
  const session = await auth();

  // RBAC: Admin만 접근 가능
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  // 현재 연월
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // 1. 당월 급여 기록 조회
  const payrollRecords = await prisma.payrollRecord.findMany({
    where: {
      year: currentYear,
      month: currentMonth,
    },
  });

  // 당월 총 인건비
  const totalLaborCost = payrollRecords.reduce(
    (sum, r) => sum + r.totalGross,
    0
  );

  // 당월 원천징수 세액
  const totalWithholdingTax = payrollRecords.reduce(
    (sum, r) => sum + r.incomeTax + r.localIncomeTax,
    0
  );

  // 평균 급여
  const avgSalary =
    payrollRecords.length > 0
      ? Math.floor(totalLaborCost / payrollRecords.length)
      : 0;

  // 2. 재직자 조회 (퇴직금 추계용)
  const employees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      joinDate: true,
      baseSalary: true,
      mealAllowance: true,
      transportAllowance: true,
      positionAllowance: true,
    },
  });

  // 각 직원의 최근 3개월 급여 기록
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
          year: currentYear,
          month: { lte: currentMonth },
        },
      ],
    },
    select: { employeeId: true, totalGross: true, year: true, month: true },
  });

  // DC형 퇴직연금 월 부담금 총액 계산
  const dcContributions = employees.map((emp) => {
    const recentPayrolls = allPayrolls
      .filter((p) => p.employeeId === emp.id)
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      })
      .slice(0, 3);

    return calculateDCContribution(emp, recentPayrolls);
  });
  const totalMonthlyDCContribution = calculateMonthlyDCTotal(dcContributions);

  const stats = {
    totalLaborCost,
    totalWithholdingTax,
    totalMonthlyDCContribution,
    avgSalary,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="회계 대시보드"
        description="원천징수, 퇴직금, 급여 통계를 관리합니다"
      />

      <AccountingOverviewCards stats={stats} />

      {/* 빠른 이동 버튼 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              원천징수 세액
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              월별 원천징수 세액을 집계하고 Excel로 내보냅니다.
            </p>
            <Link href="/accounting/withholding-tax">
              <Button className="w-full">조회하기</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              급여 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              부서별/직급별 급여 통계 및 월별 트렌드를 확인합니다.
            </p>
            <Link href="/accounting/payroll-stats">
              <Button className="w-full">조회하기</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              DC형 퇴직연금
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              재직자별 월 부담금을 계산하고 확인합니다.
            </p>
            <Link href="/accounting/dc-pension">
              <Button className="w-full">조회하기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
