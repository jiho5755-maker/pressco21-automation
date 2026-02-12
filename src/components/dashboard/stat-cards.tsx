// 대시보드 통계 카드 모음
import { StatCard } from "@/components/shared/stat-card";
import {
  Receipt,
  Users,
  CalendarCheck,
  Wallet,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/salary-calculator";

interface CoreStatsData {
  activeCount: number;
  onLeaveCount: number;
  flexWorkCount: number;
  totalEmployees: number;
  attendanceRate: number;
  avgLeaveBalance: number;
  weeklyOvertime: number;
  monthlyPayroll: number;
  pendingApprovals: {
    expenses: number;
    leaves: number;
    total: number;
  };
}

interface StatCardsProps {
  data: CoreStatsData;
}

export function StatCards({ data }: StatCardsProps) {
  // 주52시간 초과 여부 (주 평균 12시간 * 4.345주 = 52.14시간)
  const isOvertimeExceeded = data.weeklyOvertime > 52;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 재직 직원 */}
      <StatCard
        title="재직 직원"
        value={`${data.activeCount}명`}
        description={`총 ${data.totalEmployees}명 중 재직`}
        icon={<Users className="h-4 w-4" />}
      />

      {/* 출근율 (이번 달) */}
      <StatCard
        title="출근율 (이번 달)"
        value={`${data.attendanceRate}%`}
        description="월별 평균 출근율"
        icon={<CalendarCheck className="h-4 w-4" />}
        variant={data.attendanceRate >= 95 ? "success" : data.attendanceRate >= 90 ? "default" : "warning"}
      />

      {/* 평균 연차 잔여 */}
      <StatCard
        title="평균 연차 잔여"
        value={`${data.avgLeaveBalance}일`}
        description="재직자 평균"
        icon={<CalendarDays className="h-4 w-4" />}
      />

      {/* 이번 달 총 급여 */}
      <StatCard
        title="이번 달 총 급여"
        value={formatCurrency(data.monthlyPayroll)}
        description="확정된 급여 기준"
        icon={<Wallet className="h-4 w-4" />}
      />

      {/* 주간 초과근무 */}
      <StatCard
        title="주간 초과근무"
        value={`${data.weeklyOvertime}시간`}
        description="이번 주 연장근로 합계"
        icon={<TrendingUp className="h-4 w-4" />}
        variant={isOvertimeExceeded ? "destructive" : "default"}
      />

      {/* 미처리 승인 */}
      <StatCard
        title="미처리 승인"
        value={`${data.pendingApprovals.total}건`}
        description={`경비 ${data.pendingApprovals.expenses}건, 휴가 ${data.pendingApprovals.leaves}건`}
        icon={<Receipt className="h-4 w-4" />}
        variant={data.pendingApprovals.total > 5 ? "warning" : "default"}
      />
    </div>
  );
}
