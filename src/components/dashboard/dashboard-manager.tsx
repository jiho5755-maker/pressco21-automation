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
import { getCurrentUserEmployee } from "@/lib/rbac-helpers";
import { prisma } from "@/lib/prisma";

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
  // 현재 사용자의 직원 정보 조회
  const currentEmployee = await getCurrentUserEmployee();

  if (!currentEmployee) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        직원 정보를 찾을 수 없습니다. 관리자에게 문의하세요.
      </div>
    );
  }

  // Manager는 자기 부서 데이터만 조회
  const employeeFilter = { departmentId: currentEmployee.departmentId };

  const [
    coreStats,
    payrollTrend,
    attendanceData,
    leaveUsage,
    recentAnomalies,
    pendingApprovals,
  ] = await Promise.all([
    fetchCoreStats(year, month, userId, "manager", "department", employeeFilter),
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
