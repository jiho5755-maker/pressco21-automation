// Manager 전용 대시보드 (자기 부서 데이터 + 경비 차트 제외)
import { StatCards } from "@/components/dashboard/stat-cards";
import { PayrollTrendChart } from "@/components/dashboard/payroll-trend-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { LeaveUsageChart } from "@/components/dashboard/leave-usage-chart";
import { RecentAnomaliesCard } from "@/components/dashboard/recent-anomalies-card";
import { PendingApprovalsCard } from "@/components/dashboard/pending-approvals-card";
import {
  fetchCoreStats,
  fetchPayrollTrendData,
  fetchAttendanceData,
  fetchLeaveUsageData,
  fetchRecentAnomalies,
  fetchPendingApprovalsList,
} from "@/lib/dashboard-queries";

interface DashboardManagerProps {
  userId: string;
  year: number;
  month: number;
}

export async function DashboardManager({
  userId,
  year,
  month,
}: DashboardManagerProps) {
  // Manager는 경비 차트 제외
  const [
    coreStats,
    payrollTrend,
    attendanceData,
    leaveUsage,
    recentAnomalies,
    pendingApprovals,
  ] = await Promise.all([
    fetchCoreStats(year, month, userId, "manager"),
    fetchPayrollTrendData(),
    fetchAttendanceData(),
    fetchLeaveUsageData(),
    fetchRecentAnomalies(),
    fetchPendingApprovalsList(userId, "manager"),
  ]);

  return (
    <>
      {/* 통계 카드 (6개) */}
      <StatCards data={coreStats} />

      {/* 차트 섹션 (3개 표시, 경비 차트 제외) */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <PayrollTrendChart data={payrollTrend} />
        <AttendanceChart data={attendanceData} />
        {leaveUsage.length > 0 && <LeaveUsageChart data={leaveUsage} />}
      </div>

      {/* 최근 활동 섹션 */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <RecentAnomaliesCard data={recentAnomalies} />
        <PendingApprovalsCard
          expenses={pendingApprovals.expenses}
          leaves={pendingApprovals.leaves}
        />
      </div>
    </>
  );
}
