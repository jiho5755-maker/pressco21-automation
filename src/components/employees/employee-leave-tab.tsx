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
import { leaveTypeConfig, leaveStatusConfig } from "@/lib/ui-config";
import type { Employee, LeaveRecord } from "@prisma/client";

interface EmployeeLeaveTabProps {
  employee: Employee;
  leaveRecords: LeaveRecord[];
}

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
                  <TableHead>신청일</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>사유</TableHead>
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
                        <div className="space-y-1">
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
                          {record.halfDayType && (
                            <div>
                              <Badge variant="outline" className="border-dashed text-xs">
                                {record.halfDayType === "AM" ? "오전" : "오후"} 반차
                              </Badge>
                            </div>
                          )}
                        </div>
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
                        {record.days}일
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(record.requestedAt), "MM-dd", {
                          locale: ko,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge
                            variant="outline"
                            className={statusCfg.className}
                          >
                            {statusCfg.label}
                          </Badge>
                          {record.status === "REJECTED" && record.rejectedReason && (
                            <div className="text-xs text-muted-foreground max-w-[150px] truncate">
                              사유: {record.rejectedReason}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                        {record.reason || "-"}
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
