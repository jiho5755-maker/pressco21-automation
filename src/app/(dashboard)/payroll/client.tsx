// 급여 관리 페이지 클라이언트 래퍼
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { PayrollRecord, Employee, Department } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { PayrollStatsCards } from "@/components/payroll/payroll-stats-cards";
import { PayrollFilters } from "@/components/payroll/payroll-filters";
import { PayrollTable } from "@/components/payroll/payroll-table";
import { PayrollGenerateDialog } from "@/components/payroll/payroll-generate-dialog";
import {
  confirmPayrollRecords,
  deletePayrollRecord,
  exportPayrollToExcel,
} from "@/actions/payroll-actions";
import { FileSpreadsheet } from "lucide-react";

type PayrollRecordWithEmployee = PayrollRecord & {
  employee: Employee & {
    department: Department;
  };
};

interface PayrollPageClientProps {
  initialRecords: PayrollRecordWithEmployee[];
  initialStats: {
    totalGross: number;
    totalDeduction: number;
    totalNetSalary: number;
    confirmedCount: number;
    totalCount: number;
  };
  employees: Array<{
    id: string;
    employeeNo: string;
    name: string;
    departmentId: string;
    useFixedOT: boolean;
  }>;
  departments: Department[];
  initialYear: number;
  initialMonth: number;
}

export function PayrollPageClient({
  initialRecords,
  initialStats,
  employees,
  departments,
  initialYear,
  initialMonth,
}: PayrollPageClientProps) {
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date(initialYear, initialMonth - 1)
  );
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  // 연월 변경 시 페이지 리로드 (searchParams 업데이트)
  const handleMonthChange = (month: Date) => {
    setSelectedMonth(month);
    const year = month.getFullYear();
    const monthNum = month.getMonth() + 1;
    router.push(`/payroll?year=${year}&month=${monthNum}`);
  };

  // 필터링
  const filteredRecords = useMemo(() => {
    let filtered = initialRecords;

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (r) => r.employee.departmentId === selectedDepartment
      );
    }

    if (selectedEmployee !== "all") {
      filtered = filtered.filter((r) => r.employeeId === selectedEmployee);
    }

    return filtered;
  }, [initialRecords, selectedDepartment, selectedEmployee]);

  // Server Actions
  const confirmAction = useAction(confirmPayrollRecords, {
    onSuccess: ({ data }) => {
      toast.success(`${data?.count || 0}건의 급여가 확정되었습니다.`);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "확정 실패");
    },
  });

  const deleteAction = useAction(deletePayrollRecord, {
    onSuccess: () => {
      toast.success("급여 기록이 삭제되었습니다.");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "삭제 실패");
    },
  });

  const exportAction = useAction(exportPayrollToExcel, {
    onSuccess: ({ data }) => {
      if (!data) return;

      // Base64 Buffer를 Blob으로 변환
      const byteCharacters = atob(data.buffer);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // 다운로드
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Excel 파일이 다운로드되었습니다.");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "내보내기 실패");
    },
  });

  const handleConfirm = (ids: string[]) => {
    confirmAction.execute({ ids });
  };

  const handleDelete = (id: string) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteAction.execute({ id });
    }
  };

  const handleExportExcel = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth() + 1;
    exportAction.execute({ year, month });
  };

  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={exportAction.isPending || initialRecords.length === 0}
        >
          <FileSpreadsheet className="mr-2 h-4 w-4" />
          {exportAction.isPending ? "내보내는 중..." : "Excel 내보내기"}
        </Button>
        <Button onClick={() => setGenerateDialogOpen(true)}>급여 생성</Button>
      </div>

      {/* 필터 */}
      <PayrollFilters
        departments={departments}
        employees={employees}
        selectedDepartment={selectedDepartment}
        selectedEmployee={selectedEmployee}
        selectedMonth={selectedMonth}
        onDepartmentChange={setSelectedDepartment}
        onEmployeeChange={setSelectedEmployee}
        onMonthChange={handleMonthChange}
      />

      {/* 통계 카드 */}
      <PayrollStatsCards stats={initialStats} />

      {/* 테이블 */}
      <PayrollTable
        records={filteredRecords}
        onConfirm={handleConfirm}
        onDelete={handleDelete}
      />

      {/* 급여 생성 Dialog */}
      <PayrollGenerateDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        employees={employees}
      />
    </div>
  );
}
