// Viewer 전용 대시보드 (본인 데이터만)
import { StatCards } from "@/components/dashboard/stat-cards";
import { PayrollTrendChart } from "@/components/dashboard/payroll-trend-chart";
import { AttendanceChart } from "@/components/dashboard/attendance-chart";
import {
  fetchCoreStats,
  fetchPayrollTrendData,
  fetchAttendanceData,
} from "@/lib/dashboard-queries";

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
  // Viewer는 본인 데이터만 + 차트 제한
  const [coreStats, payrollTrend, attendanceData] = await Promise.all([
    fetchCoreStats(year, month, userId, "viewer"),
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
