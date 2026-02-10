// Viewer 전용 대시보드 (본인 데이터만)
import { StatCards } from "@/components/dashboard/stat-cards";
import { PayrollTrendChart } from "@/components/dashboard/payroll-trend-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import {
  fetchCoreStats,
  fetchPayrollTrendData,
  fetchAttendanceData,
} from "@/lib/dashboard-queries";
import { getCurrentUserEmployee } from "@/lib/rbac-helpers";

interface DashboardViewerProps {
  userId: string;
  year: number;
  month: number;
}

export async function DashboardViewer({
  userId,
  year,
  month,
}: DashboardViewerProps) {
  // 현재 사용자의 직원 정보 조회
  const currentEmployee = await getCurrentUserEmployee();

  if (!currentEmployee) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        직원 정보를 찾을 수 없습니다. 관리자에게 문의하세요.
      </div>
    );
  }

  // Viewer는 본인 데이터만 조회
  const employeeFilter = { id: currentEmployee.id };

  const [coreStats, payrollTrend, attendanceData] = await Promise.all([
    fetchCoreStats(year, month, userId, "viewer", "self", employeeFilter),
    fetchPayrollTrendData(),
    fetchAttendanceData(),
  ]);

  return (
    <>
      {/* 통계 카드 (6개) */}
      <StatCards data={coreStats} />

      {/* 차트 섹션 (2개만 표시) */}
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <PayrollTrendChart data={payrollTrend} />
        <AttendanceChart data={attendanceData} />
      </div>
    </>
  );
}
