import { CalendarCheck, Clock, TrendingUp, Moon } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";

interface AttendanceStatsCardsProps {
  totalWorkDays: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalNightWorkHours: number;
}

export function AttendanceStatsCards({
  totalWorkDays,
  totalWorkHours,
  totalOvertimeHours,
  totalNightWorkHours,
}: AttendanceStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard
        title="총 근무일"
        value={`${totalWorkDays}일`}
        icon={<CalendarCheck className="h-4 w-4" />}
      />
      <StatCard
        title="총 근무시간"
        value={`${totalWorkHours}시간`}
        icon={<Clock className="h-4 w-4" />}
      />
      <StatCard
        title="연장근로"
        value={`${totalOvertimeHours}시간`}
        icon={<TrendingUp className="h-4 w-4 text-orange-500" />}
      />
      <StatCard
        title="야간근로"
        value={`${totalNightWorkHours}시간`}
        icon={<Moon className="h-4 w-4 text-purple-500" />}
      />
    </div>
  );
}
