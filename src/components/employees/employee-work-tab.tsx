// 직원 근무정보 탭 — 근무설정 + 주간 스케줄 테이블
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WORK_TYPES, WEEKDAYS } from "@/lib/constants";
import { workTypeConfig } from "@/lib/ui-config";
import type { Employee, WorkSchedule } from "@prisma/client";

interface EmployeeWorkTabProps {
  employee: Employee;
  workSchedules: WorkSchedule[];
}

// dayOfWeek 숫자를 한글 요일로 변환 (1=월 ~ 5=금)
const dayLabels: Record<number, string> = {
  1: "월요일",
  2: "화요일",
  3: "수요일",
  4: "목요일",
  5: "금요일",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

export function EmployeeWorkTab({
  employee,
  workSchedules,
}: EmployeeWorkTabProps) {
  const workLabel =
    WORK_TYPES[employee.workType as keyof typeof WORK_TYPES] ||
    employee.workType;
  const workCfg = workTypeConfig[employee.workType];

  // 재택근무 요일 파싱
  const remoteWorkDays: string[] = employee.remoteWorkDays
    ? JSON.parse(employee.remoteWorkDays)
    : [];
  const remoteDayLabels = remoteWorkDays
    .map((d) => WEEKDAYS[d as keyof typeof WEEKDAYS])
    .join(", ");

  return (
    <div className="space-y-4">
      {/* 근무 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">근무 설정</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow
            label="근무 유형"
            value={
              workCfg ? (
                <Badge variant="outline" className={workCfg.className}>
                  {workCfg.label}
                </Badge>
              ) : (
                workLabel
              )
            }
          />
          <InfoRow label="주간 근로시간" value={`${employee.weeklyWorkHours}시간`} />
          <InfoRow
            label="기본 근무시간"
            value={`${employee.workStartTime} ~ ${employee.workEndTime}`}
          />
          <InfoRow label="휴게시간" value={`${employee.breakMinutes}분`} />
          {employee.flexStartTime && employee.flexEndTime && (
            <InfoRow
              label="시차출퇴근 시간"
              value={`${employee.flexStartTime} ~ ${employee.flexEndTime}`}
            />
          )}
          {remoteDayLabels && (
            <InfoRow label="재택근무 요일" value={remoteDayLabels} />
          )}
        </CardContent>
      </Card>

      {/* 주간 스케줄 테이블 */}
      {workSchedules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">주간 근무 스케줄</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>요일</TableHead>
                  <TableHead>출근</TableHead>
                  <TableHead>퇴근</TableHead>
                  <TableHead>근무형태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workSchedules
                  .filter((ws) => ws.isWorkDay)
                  .map((ws) => (
                    <TableRow key={ws.id}>
                      <TableCell className="font-medium">
                        {dayLabels[ws.dayOfWeek] || `Day ${ws.dayOfWeek}`}
                      </TableCell>
                      <TableCell>{ws.startTime}</TableCell>
                      <TableCell>{ws.endTime}</TableCell>
                      <TableCell>
                        {ws.isRemote ? (
                          <Badge
                            variant="outline"
                            className="border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-300"
                          >
                            재택
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                          >
                            사무실
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
