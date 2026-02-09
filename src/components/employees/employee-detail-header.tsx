"use client";

// 직원 상세 헤더 — 이름, 사번, 상태, 부서, 직급 + 뒤로가기 + 수정 버튼
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  employeeStatusConfig,
  contractTypeConfig,
  leaveTypeConfig,
} from "@/lib/ui-config";
import { EmployeeEditDialog } from "./employee-edit-dialog";
import type { Department, Employee } from "@prisma/client";

type EmployeeWithDept = Employee & {
  department: Department;
  replacementFor: { name: string; employeeNo: string } | null;
};

interface EmployeeDetailHeaderProps {
  employee: EmployeeWithDept;
  departments: Department[];
}

export function EmployeeDetailHeader({
  employee,
  departments,
}: EmployeeDetailHeaderProps) {
  const statusCfg = employeeStatusConfig[employee.status] || {
    label: employee.status,
    className: "",
  };
  const contractCfg = contractTypeConfig[employee.contractType];
  const leaveCfg = employee.leaveType
    ? leaveTypeConfig[employee.leaveType]
    : null;

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/employees">
            <ArrowLeft className="mr-1 h-4 w-4" />
            목록
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{employee.name}</h1>
            <span className="font-mono text-sm text-muted-foreground">
              {employee.employeeNo}
            </span>
            <Badge variant="outline" className={statusCfg.className}>
              {statusCfg.label}
            </Badge>
            {contractCfg && employee.contractType !== "REGULAR" && (
              <Badge variant="outline" className={contractCfg.className}>
                {contractCfg.label}
              </Badge>
            )}
            {leaveCfg && (
              <Badge variant="outline" className={leaveCfg.className}>
                {leaveCfg.label}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {employee.department.name} · {employee.position}
            {employee.replacementFor && (
              <span>
                {" "}
                · {employee.replacementFor.name}(
                {employee.replacementFor.employeeNo}) 대체
              </span>
            )}
          </p>
        </div>
      </div>

      <EmployeeEditDialog employee={employee} departments={departments} />
    </div>
  );
}
