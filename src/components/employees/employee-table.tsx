"use client";

// 직원 테이블 — 검색 + 목록 + 직원 추가 Dialog
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { employeeStatusConfig, workTypeConfig, contractTypeConfig } from "@/lib/ui-config";
import { AddEmployeeDialog } from "./add-employee-dialog";
import type { Department, Employee } from "@prisma/client";

type EmployeeWithRelations = Employee & {
  department: Department;
  replacementFor: { name: string; employeeNo: string } | null;
};

interface EmployeeTableProps {
  employees: EmployeeWithRelations[];
  departments: Department[];
}

export function EmployeeTable({ employees, departments }: EmployeeTableProps) {
  const [search, setSearch] = useState("");

  const filtered = employees.filter(
    (emp) =>
      emp.name.includes(search) ||
      emp.department.name.includes(search) ||
      emp.position.includes(search) ||
      emp.employeeNo.includes(search)
  );

  return (
    <div className="space-y-4">
      {/* 검색 + 직원 추가 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="이름, 부서, 직급, 사번으로 검색..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <AddEmployeeDialog departments={departments} />
      </div>

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>사번</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>부서</TableHead>
              <TableHead>직급</TableHead>
              <TableHead>입사일</TableHead>
              <TableHead>근무유형</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((emp) => {
                const statusCfg = employeeStatusConfig[emp.status] || {
                  label: emp.status,
                  className: "",
                };
                const workCfg = workTypeConfig[emp.workType] || {
                  label: emp.workType,
                  className: "",
                };
                const contractCfg = contractTypeConfig[emp.contractType];

                return (
                  <TableRow key={emp.id}>
                    <TableCell className="font-mono text-xs">
                      {emp.employeeNo}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <Link
                          href={`/employees/${emp.id}`}
                          className="hover:underline text-primary"
                        >
                          {emp.name}
                        </Link>
                        {contractCfg &&
                          emp.contractType !== "REGULAR" && (
                            <Badge
                              variant="outline"
                              className={`ml-2 text-[10px] ${contractCfg.className}`}
                            >
                              {contractCfg.label}
                            </Badge>
                          )}
                        {emp.replacementFor && (
                          <span className="block text-xs text-muted-foreground">
                            {emp.replacementFor.name} 대체
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{emp.department.name}</TableCell>
                    <TableCell>{emp.position}</TableCell>
                    <TableCell>
                      {format(new Date(emp.joinDate), "yyyy년 M월 d일", {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={workCfg.className}>
                        {workCfg.label}
                      </Badge>
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
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  검색 결과가 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <p className="text-sm text-muted-foreground">
        총 {filtered.length}명의 직원
      </p>
    </div>
  );
}
