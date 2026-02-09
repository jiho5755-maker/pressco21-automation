// 급여 관리 통계 카드
"use client";

import { StatCard } from "@/components/shared/stat-card";
import { formatCurrency } from "@/lib/salary-calculator";

interface PayrollStatsCardsProps {
  stats: {
    totalGross: number;
    totalDeduction: number;
    totalNetSalary: number;
    confirmedCount: number;
    totalCount: number;
  };
}

export function PayrollStatsCards({ stats }: PayrollStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="총 지급액"
        value={formatCurrency(stats.totalGross)}
        description="모든 직원 총 급여 합계"
      />
      <StatCard
        title="총 공제액"
        value={formatCurrency(stats.totalDeduction)}
        description="4대보험 + 소득세 합계"
      />
      <StatCard
        title="실수령액 합계"
        value={formatCurrency(stats.totalNetSalary)}
        description="총 지급액 - 총 공제액"
      />
      <StatCard
        title="확정 현황"
        value={`${stats.confirmedCount} / ${stats.totalCount}`}
        description="확정된 급여 건수"
      />
    </div>
  );
}
