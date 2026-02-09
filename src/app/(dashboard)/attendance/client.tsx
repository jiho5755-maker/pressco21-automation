"use client";

import { useState, useMemo } from "react";
import { isSameDay } from "date-fns";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import type { Employee, Department, AttendanceRecord } from "@prisma/client";

import {
  deleteAttendanceRecord,
  confirmAttendanceRecords,
  unconfirmAttendanceRecord,
} from "@/actions/attendance-actions";
import { Button } from "@/components/ui/button";
import { AttendanceStatsCards } from "@/components/attendance/attendance-stats-cards";
import { AttendanceCalendar } from "@/components/attendance/attendance-calendar";
import { AttendanceTable } from "@/components/attendance/attendance-table";
import { AttendanceFilters } from "@/components/attendance/attendance-filters";
import { AttendanceRecordDialog } from "@/components/attendance/attendance-record-dialog";

type EmployeeWithDepartment = Employee & {
  department: Department;
};

type AttendanceRecordWithEmployee = AttendanceRecord & {
  employee: EmployeeWithDepartment;
};

interface AttendancePageClientProps {
  initialRecords: AttendanceRecordWithEmployee[];
  initialStats: {
    totalWorkDays: number;
    totalWorkHours: number;
    totalOvertimeHours: number;
    totalNightWorkHours: number;
  };
  employees: EmployeeWithDepartment[];
  departments: Department[];
}

export function AttendancePageClient({
  initialRecords,
  initialStats,
  employees,
  departments,
}: AttendancePageClientProps) {
  // 필터 상태
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Dialog 상태
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<AttendanceRecordWithEmployee | null>(null);

  // 필터링된 기록
  const filteredRecords = useMemo(() => {
    let filtered = initialRecords;

    // 부서 필터
    if (selectedDepartment) {
      filtered = filtered.filter(
        (r) => r.employee.departmentId === selectedDepartment
      );
    }

    // 직원 필터
    if (selectedEmployee) {
      filtered = filtered.filter((r) => r.employeeId === selectedEmployee);
    }

    // 날짜 필터 (달력 클릭 시)
    if (selectedDate) {
      filtered = filtered.filter((r) => isSameDay(r.date, selectedDate));
    }

    return filtered;
  }, [
    initialRecords,
    selectedDepartment,
    selectedEmployee,
    selectedDate,
  ]);

  // Server Actions
  const deleteAction = useAction(deleteAttendanceRecord, {
    onSuccess: () => {
      toast.success("근태 기록이 삭제되었습니다.");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "삭제에 실패했습니다.");
    },
  });

  const confirmAction = useAction(confirmAttendanceRecords, {
    onSuccess: () => {
      toast.success("근태 기록이 확정되었습니다.");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "확정에 실패했습니다.");
    },
  });

  const unconfirmAction = useAction(unconfirmAttendanceRecord, {
    onSuccess: () => {
      toast.success("확정이 해제되었습니다.");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "확정 해제에 실패했습니다.");
    },
  });

  const handleEdit = (record: AttendanceRecordWithEmployee) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteAction.execute({ id });
    }
  };

  const handleConfirm = (id: string) => {
    confirmAction.execute({ ids: [id] });
  };

  const handleUnconfirm = (id: string) => {
    unconfirmAction.execute({ id });
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    setDialogOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          출퇴근 기록 추가
        </Button>
      </div>

      {/* 필터 */}
      <AttendanceFilters
        departments={departments}
        employees={employees}
        selectedDepartment={selectedDepartment}
        selectedEmployee={selectedEmployee}
        selectedMonth={selectedMonth}
        onDepartmentChange={setSelectedDepartment}
        onEmployeeChange={setSelectedEmployee}
        onMonthChange={setSelectedMonth}
      />

      {/* 통계 카드 */}
      <AttendanceStatsCards {...initialStats} />

      {/* 달력 */}
      <AttendanceCalendar
        records={initialRecords}
        onDateClick={handleDateClick}
      />

      {/* 테이블 */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {selectedDate
              ? `${selectedDate.toLocaleDateString("ko-KR")} 근태 기록`
              : "전체 근태 기록"}
          </h3>
          {selectedDate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(null)}
            >
              전체 보기
            </Button>
          )}
        </div>

        <AttendanceTable
          records={filteredRecords}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onConfirm={handleConfirm}
          onUnconfirm={handleUnconfirm}
        />
      </div>

      {/* Dialog */}
      <AttendanceRecordDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={employees}
        editingRecord={editingRecord}
      />
    </div>
  );
}
