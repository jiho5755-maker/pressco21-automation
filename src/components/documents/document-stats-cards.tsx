// 문서 통계 카드 (Phase 3-C)
import { StatCard } from "@/components/shared/stat-card";
import { FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

interface DocumentStatsCardsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
}

export function DocumentStatsCards({ stats }: DocumentStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="전체 문서"
        value={stats.total}
        icon={<FileText className="h-4 w-4" />}
        description="등록된 문서 수"
      />
      <StatCard
        title="결재 대기"
        value={stats.pending}
        icon={<Clock className="h-4 w-4" />}
        description="처리 필요"
        variant="warning"
      />
      <StatCard
        title="결재 완료"
        value={stats.approved}
        icon={<CheckCircle2 className="h-4 w-4" />}
        description="승인된 문서"
        variant="success"
      />
      <StatCard
        title="반려"
        value={stats.rejected}
        icon={<XCircle className="h-4 w-4" />}
        description="반려된 문서"
        variant="destructive"
      />
    </div>
  );
}
