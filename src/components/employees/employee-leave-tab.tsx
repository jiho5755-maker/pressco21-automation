// 직원 휴가 탭 — 연차현황 + 휴가이력 테이블
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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
import { getAnnualLeaveSummary } from "@/lib/leave-calculator";
import { LEAVE_TYPES } from "@/lib/constants";
import { leaveTypeConfig } from "@/lib/ui-config";
import type { Employee, LeaveRecord } from "@prisma/client";

interface EmployeeLeaveTabProps {
  employee: Employee;
  leaveRecords: LeaveRecord[];
}

// 휴가 상태 Badge
const leaveStatusConfig: Record<string, { label: string; className: string }> = {
  PENDING: {
    label: "대기",
    className:
      "border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
  },
  APPROVED: {
    label: "승인",
    className:
      "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
  },
  REJECTED: {
    label: "반려",
    className:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
  },
  CANCELLED: {
    label: "취소",
    className:
      "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400",
  },
};

export function EmployeeLeaveTab({
  employee,
  leaveRecords,
}: EmployeeLeaveTabProps) {
  const summary = getAnnualLeaveSummary(
    new Date(employee.joinDate),
    leaveRecords.map((r) => ({
      type: r.type,
      days: r.days,
      status: r.status,
      startDate: new Date(r.startDate),
    }))
  );

  return (
    <div className="space-y-4">
      {/* 연차 현황 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              총 연차
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}일</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.year}년 기준
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              사용 연차
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.used}일</div>
            <p className="text-xs text-muted-foreground mt-1">
              승인 + 대기 포함
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              잔여 연차
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {summary.remaining}일
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 휴가 이력 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">휴가 이력</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRecords.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>유형</TableHead>
                  <TableHead>기간</TableHead>
                  <TableHead className="text-right">일수</TableHead>
                  <TableHead>사유</TableHead>
                  <TableHead>상태</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaveRecords.map((record) => {
                  const typeLabel =
                    LEAVE_TYPES[record.type as keyof typeof LEAVE_TYPES] ||
                    record.type;
                  const typeCfg = leaveTypeConfig[record.type];
                  const statusCfg = leaveStatusConfig[record.status] || {
                    label: record.status,
                    className: "",
                  };

                  return (
                    <TableRow key={record.id}>
                      <TableCell>
                        {typeCfg ? (
                          <Badge
                            variant="outline"
                            className={typeCfg.className}
                          >
                            {typeCfg.label}
                          </Badge>
                        ) : (
                          typeLabel
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(record.startDate), "yyyy.MM.dd", {
                          locale: ko,
                        })}{" "}
                        ~{" "}
                        {format(new Date(record.endDate), "yyyy.MM.dd", {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.days % 1 === 0
                          ? `${record.days}일`
                          : `${record.days}일`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {record.reason || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusCfg.className}
                        >
                          {statusCfg.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">
              휴가 이력이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
