"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { formatCurrency } from "@/lib/accounting-utils";
import { format } from "date-fns";
import { SeverancePayDetailDialog } from "./severance-pay-detail-dialog";

interface SeverancePayTableProps {
  employees: Array<{
    id: string;
    employeeNumber: string;
    name: string;
    departmentName: string;
    position: string;
    hireDate: Date;
    continuousServiceYears: number;
    severancePay: number;
    isEligible: boolean;
  }>;
}

export function SeverancePayTable({ employees }: SeverancePayTableProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [sortKey, setSortKey] = useState<"severancePay" | "continuousServiceYears">(
    "severancePay"
  );

  const sorted = [...employees].sort((a, b) => {
    if (sortKey === "severancePay") {
      return b.severancePay - a.severancePay;
    } else {
      return b.continuousServiceYears - a.continuousServiceYears;
    }
  });

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>사번</TableHead>
            <TableHead>이름</TableHead>
            <TableHead>부서</TableHead>
            <TableHead>직급</TableHead>
            <TableHead>입사일</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-muted"
              onClick={() => setSortKey("continuousServiceYears")}
            >
              근속연수 {sortKey === "continuousServiceYears" && "↓"}
            </TableHead>
            <TableHead
              className="text-right cursor-pointer hover:bg-muted"
              onClick={() => setSortKey("severancePay")}
            >
              퇴직금 추계액 {sortKey === "severancePay" && "↓"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((emp) => (
            <TableRow
              key={emp.id}
              className="cursor-pointer hover:bg-muted"
              onClick={() => setSelectedEmployeeId(emp.id)}
            >
              <TableCell>{emp.employeeNumber}</TableCell>
              <TableCell className="font-semibold">{emp.name}</TableCell>
              <TableCell>{emp.departmentName}</TableCell>
              <TableCell>{emp.position}</TableCell>
              <TableCell>{format(emp.hireDate, "yyyy-MM-dd")}</TableCell>
              <TableCell>{emp.continuousServiceYears.toFixed(1)}년</TableCell>
              <TableCell className="text-right font-semibold">
                {emp.isEligible ? (
                  formatCurrency(emp.severancePay)
                ) : (
                  <span className="text-muted-foreground">1년 미만</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SeverancePayDetailDialog
        employeeId={selectedEmployeeId}
        open={!!selectedEmployeeId}
        onClose={() => setSelectedEmployeeId(null)}
      />
    </>
  );
}
