// Admin 전용 대시보드
import { StatCards } from "@/components/dashboard/stat-cards";
import { PayrollTrendChart } from "@/components/dashboard/payroll-trend-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import { LeaveUsageChart } from "@/components/dashboard/leave-usage-chart";
import { ExpenseByDeptChart } from "@/components/dashboard/expense-by-dept-chart";
import { RecentAnomaliesCard } from "@/components/dashboard/recent-anomalies-card";
import { PendingApprovalsCard } from "@/components/dashboard/pending-approvals-card";
import {
  fetchCoreStats,
  fetchPayrollTrendData,
  fetchAttendanceData,
  fetchLeaveUsageData,
  fetchExpenseByDepartment,
  fetchRecentAnomalies,
  fetchPendingApprovalsList,
} from "@/lib/dashboard-queries";

interface DashboardAdminProps {
  userId: string;
  year: number;
  month: number;
}

export async function DashboardAdmin({
  userId,
  year,
  month,
}: DashboardAdminProps) {
  // 모든 데이터 조회 (Admin은 전체 접근 권한)
  const [
    coreStats,
    payrollTrend,
    attendanceData,
    leaveUsage,
    expenseByDept,
    recentAnomalies,
    pendingApprovals,
  ] = await Promise.all([
    fetchCoreStats(year, month, userId, "admin", "all"), // scope: all
    fetchPayrollTrendData(),
    fetchAttendanceData(),
    fetchLeaveUsageData(),
    fetchExpenseByDepartment(year, month),
    fetchRecentAnomalies(),
    fetchPendingApprovalsList(userId, "admin"),
  ]);

  return (
    <>
      {/* 통계 카드 (6개) */}
      <StatCards data={coreStats} />

      {/* 차트 섹션 (4개 모두 표시) */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <PayrollTrendChart data={payrollTrend} />
        <AttendanceChart data={attendanceData} />
        {leaveUsage.length > 0 && <LeaveUsageChart data={leaveUsage} />}
        {expenseByDept.length > 0 && <ExpenseByDeptChart data={expenseByDept} />}
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
