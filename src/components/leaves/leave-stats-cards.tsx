// 휴가 관리 통계 카드
"use client";

import { StatCard } from "@/components/shared/stat-card";

interface LeaveStatsCardsProps {
  stats: {
    totalCount: number; // 총 신청
    approvedCount: number; // 승인
    pendingCount: number; // 대기
    rejectedCount: number; // 반려
  };
}

export function LeaveStatsCards({ stats }: LeaveStatsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="총 신청"
        value={`${stats.totalCount}건`}
        description="전체 휴가 신청 건수"
      />
      <StatCard
        title="승인"
        value={`${stats.approvedCount}건`}
        description="승인된 휴가"
      />
      <StatCard
        title="대기"
        value={`${stats.pendingCount}건`}
        description="승인 대기 중"
      />
      <StatCard
        title="반려"
        value={`${stats.rejectedCount}건`}
        description="반려된 휴가"
      />
    </div>
  );
}
