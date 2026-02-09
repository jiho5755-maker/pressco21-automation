// 휴가 목록 테이블
"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import type { LeaveRecord, Employee, User } from "@prisma/client";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { leaveTypeConfig, leaveStatusConfig } from "@/lib/ui-config";
import {
  approveLeaveRequest,
  rejectLeaveRequest,
} from "@/actions/leave-actions";
import { LeaveRejectDialog } from "./leave-reject-dialog";

type LeaveWithRelations = LeaveRecord & {
  employee: Pick<Employee, "id" | "name" | "employeeNo">;
  approver: Pick<User, "id" | "name"> | null;
};

interface LeaveTableProps {
  leaveRecords: LeaveWithRelations[];
}

export function LeaveTable({ leaveRecords }: LeaveTableProps) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);

  const { execute: executeApprove, isPending: isApproving } = useAction(
    approveLeaveRequest,
    {
      onSuccess: () => {
        toast.success("휴가가 승인되었습니다.");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "승인 실패");
      },
    }
  );

  const handleApprove = (id: string) => {
    if (confirm("이 휴가를 승인하시겠습니까?")) {
      executeApprove({ id });
    }
  };

  if (leaveRecords.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center text-muted-foreground">
        조회된 휴가 기록이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>직원</TableHead>
              <TableHead>유형</TableHead>
              <TableHead>시작일</TableHead>
              <TableHead>종료일</TableHead>
              <TableHead>일수</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>신청일</TableHead>
              <TableHead className="text-right">액션</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaveRecords.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">
                  {record.employee.name}
                  <div className="text-xs text-muted-foreground">
                    {record.employee.employeeNo}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={leaveTypeConfig[record.type]?.className}
                  >
                    {leaveTypeConfig[record.type]?.label || record.type}
                  </Badge>
                  {record.halfDayType && (
                    <div className="mt-1">
                      <Badge variant="outline" className="border-dashed text-xs">
                        {record.halfDayType === "AM" ? "오전" : "오후"} 반차
                      </Badge>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {format(new Date(record.startDate), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>
                  {format(new Date(record.endDate), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>{record.days}일</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={leaveStatusConfig[record.status]?.className}
                  >
                    {leaveStatusConfig[record.status]?.label || record.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(record.requestedAt), "MM-dd", { locale: ko })}
                </TableCell>
                <TableCell className="text-right">
                  {record.status === "PENDING" && (
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(record.id)}
                        disabled={isApproving}
                      >
                        승인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectingId(record.id)}
                      >
                        반려
                      </Button>
                    </div>
                  )}
                  {record.status === "REJECTED" && record.rejectedReason && (
                    <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                      사유: {record.rejectedReason}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {rejectingId && (
        <LeaveRejectDialog
          leaveId={rejectingId}
          onClose={() => setRejectingId(null)}
        />
      )}
    </>
  );
}
