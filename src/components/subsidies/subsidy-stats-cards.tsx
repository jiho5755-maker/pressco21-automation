// 정부지원사업 통계 카드 컴포넌트
import { StatCard } from "@/components/shared/stat-card";
import { HandCoins, CheckCircle2, Banknote, Clock } from "lucide-react";

interface SubsidyStatsCardsProps {
  stats: {
    totalCount: number;
    approvedCount: number;
    paidCount: number;
    pendingCount: number;
    totalApprovedAmount: number;
  };
}

export function SubsidyStatsCards({ stats }: SubsidyStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="총 신청건수"
        value={stats.totalCount}
        description="전체 지원금 신청"
        icon={<HandCoins className="h-4 w-4" />}
        variant="default"
      />
      <StatCard
        title="승인건수"
        value={stats.approvedCount}
        description="승인된 신청"
        icon={<CheckCircle2 className="h-4 w-4" />}
        variant="success"
      />
      <StatCard
        title="지급완료"
        value={stats.paidCount}
        description="지급 완료된 건수"
        icon={<Banknote className="h-4 w-4" />}
        variant="success"
      />
      <StatCard
        title="대기건수"
        value={stats.pendingCount}
        description="승인 대기 중"
        icon={<Clock className="h-4 w-4" />}
        variant="warning"
      />
      <StatCard
        title="총 지급액"
        value={`${(stats.totalApprovedAmount / 10000).toFixed(0)}만원`}
        description="승인+지급 금액"
        variant="default"
      />
    </div>
  );
}
