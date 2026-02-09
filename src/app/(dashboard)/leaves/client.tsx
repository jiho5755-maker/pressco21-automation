// 휴가 관리 클라이언트 래퍼
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { LeaveRecord, Employee, User, Department } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { LeaveStatsCards } from "@/components/leaves/leave-stats-cards";
import { LeaveClient } from "@/components/leaves/leave-client";
import { LeaveFormDialog } from "@/components/leaves/leave-form-dialog";

type LeaveWithRelations = LeaveRecord & {
  employee: Pick<Employee, "id" | "name" | "employeeNo">;
  approver: Pick<User, "id" | "name"> | null;
};

type EmployeeWithDepartment = Employee & {
  department: Department;
};

interface LeavesPageClientProps {
  leaveRecords: LeaveWithRelations[];
  stats: {
    totalCount: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
  };
  employees: EmployeeWithDepartment[];
}

export function LeavesPageClient({
  leaveRecords,
  stats,
  employees,
}: LeavesPageClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* 액션 버튼 */}
      <div className="flex justify-end">
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          휴가 신청
        </Button>
      </div>

      {/* 통계 카드 */}
      <LeaveStatsCards stats={stats} />

      {/* 필터 + 테이블 */}
      <LeaveClient
        leaveRecords={leaveRecords}
        employees={employees.map((emp) => ({
          id: emp.id,
          employeeNo: emp.employeeNo,
          name: emp.name,
        }))}
      />

      {/* 휴가 신청 Dialog */}
      <LeaveFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employees={employees}
      />
    </div>
  );
}
