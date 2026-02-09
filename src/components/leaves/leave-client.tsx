// 휴가 관리 클라이언트 래퍼
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LeaveRecord, Employee, User } from "@prisma/client";

import { LeaveFilters } from "./leave-filters";
import { LeaveTable } from "./leave-table";

type LeaveWithRelations = LeaveRecord & {
  employee: Pick<Employee, "id" | "name" | "employeeNo">;
  approver: Pick<User, "id" | "name"> | null;
};

interface LeaveClientProps {
  leaveRecords: LeaveWithRelations[];
  employees: Array<{
    id: string;
    employeeNo: string;
    name: string;
  }>;
}

export function LeaveClient({ leaveRecords, employees }: LeaveClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedEmployee, setSelectedEmployee] = useState(
    searchParams.get("employee") || "all"
  );
  const [selectedType, setSelectedType] = useState(
    searchParams.get("type") || "all"
  );
  const [selectedStatus, setSelectedStatus] = useState(
    searchParams.get("status") || "all"
  );
  const [selectedMonth] = useState(new Date());

  // 필터링
  const filteredRecords = leaveRecords.filter((record) => {
    if (selectedEmployee !== "all" && record.employeeId !== selectedEmployee)
      return false;
    if (selectedType !== "all" && record.type !== selectedType) return false;
    if (selectedStatus !== "all" && record.status !== selectedStatus)
      return false;
    return true;
  });

  const handleEmployeeChange = (employeeId: string) => {
    setSelectedEmployee(employeeId);
    const params = new URLSearchParams(searchParams);
    if (employeeId === "all") {
      params.delete("employee");
    } else {
      params.set("employee", employeeId);
    }
    router.push(`?${params.toString()}`);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    const params = new URLSearchParams(searchParams);
    if (type === "all") {
      params.delete("type");
    } else {
      params.set("type", type);
    }
    router.push(`?${params.toString()}`);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    const params = new URLSearchParams(searchParams);
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <LeaveFilters
        employees={employees}
        selectedEmployee={selectedEmployee}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        selectedMonth={selectedMonth}
        onEmployeeChange={handleEmployeeChange}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        onMonthChange={() => {}}
      />
      <LeaveTable leaveRecords={filteredRecords} />
    </div>
  );
}
