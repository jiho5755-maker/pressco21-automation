"use client";

import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/accounting-utils";
import { Wallet, Receipt, TrendingUp, Users } from "lucide-react";

interface AccountingOverviewCardsProps {
  stats: {
    totalLaborCost: number;            // 당월 총 인건비
    totalWithholdingTax: number;       // 당월 원천징수 세액
    totalMonthlyDCContribution: number; // DC형 월 부담금 총액
    avgSalary: number;                 // 평균 급여
  };
}

export function AccountingOverviewCards({
  stats,
}: AccountingOverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="당월 총 인건비"
        value={formatCurrency(stats.totalLaborCost)}
        icon={<Wallet className="h-4 w-4" />}
      />
      <StatCard
        title="당월 원천징수 세액"
        value={formatCurrency(stats.totalWithholdingTax)}
        icon={<Receipt className="h-4 w-4" />}
        description="소득세 + 지방소득세"
      />
      <StatCard
        title="DC형 월 부담금"
        value={formatCurrency(stats.totalMonthlyDCContribution)}
        icon={<TrendingUp className="h-4 w-4" />}
        description="재직자 전체 (신한은행)"
      />
      <StatCard
        title="평균 급여"
        value={formatCurrency(stats.avgSalary)}
        icon={<Users className="h-4 w-4" />}
        description="재직자 기준"
      />
    </div>
  );
}
