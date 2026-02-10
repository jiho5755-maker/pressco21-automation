"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { MoreHorizontal, Check, X } from "lucide-react";
import type { Employee, Department, AttendanceRecord } from "@prisma/client";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMinutesToHours } from "@/lib/attendance-calculator";
import { useRole } from "@/hooks/use-role";

type AttendanceRecordWithEmployee = AttendanceRecord & {
  employee: Employee & {
    department: Department;
  };
};

interface AttendanceTableProps {
  records: AttendanceRecordWithEmployee[];
  onEdit: (record: AttendanceRecordWithEmployee) => void;
  onDelete: (id: string) => void;
  onConfirm: (id: string) => void;
  onUnconfirm: (id: string) => void;
}

export function AttendanceTable({
  records,
  onEdit,
  onDelete,
  onConfirm,
  onUnconfirm,
}: AttendanceTableProps) {
  const { isAdminOrManager } = useRole();

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        근태 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>직원명</TableHead>
            <TableHead>부서</TableHead>
            <TableHead>근무일</TableHead>
            <TableHead>출근</TableHead>
            <TableHead>퇴근</TableHead>
            <TableHead>근무시간</TableHead>
            <TableHead>연장</TableHead>
            <TableHead>야간</TableHead>
            <TableHead>확정</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/employees/${record.employeeId}`}
                  className="hover:underline"
                >
                  {record.employee.name}
                </Link>
              </TableCell>
              <TableCell>{record.employee.department.name}</TableCell>
              <TableCell>
                {format(record.date, "yyyy-MM-dd (EEE)", { locale: ko })}
              </TableCell>
              <TableCell>
                {record.clockIn
                  ? format(record.clockIn, "HH:mm")
                  : "-"}
              </TableCell>
              <TableCell>
                {record.clockOut
                  ? format(record.clockOut, "HH:mm")
                  : "-"}
              </TableCell>
              <TableCell>
                {record.workMinutes
                  ? formatMinutesToHours(record.workMinutes)
                  : "-"}
              </TableCell>
              <TableCell>
                {record.overtime ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                    {formatMinutesToHours(record.overtime)}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {record.nightWork ? (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    {formatMinutesToHours(record.nightWork)}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Badge variant={record.isConfirmed ? "default" : "outline"}>
                  {record.isConfirmed ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      확정
                    </>
                  ) : (
                    <>
                      <X className="h-3 w-3 mr-1" />
                      미확정
                    </>
                  )}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">메뉴 열기</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(record)}>
                      수정
                    </DropdownMenuItem>
                    {/* Admin/Manager만 확정 기능 사용 가능 */}
                    {isAdminOrManager && (
                      <>
                        {record.isConfirmed ? (
                          <DropdownMenuItem onClick={() => onUnconfirm(record.id)}>
                            확정 해제
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => onConfirm(record.id)}>
                            확정
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(record.id)}
                      className="text-destructive"
                      disabled={record.isConfirmed}
                    >
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
