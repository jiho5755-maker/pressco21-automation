"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/accounting-utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DCPensionDetailDialog } from "./dc-pension-detail-dialog";
import type { DCContributionResult } from "@/lib/dc-pension-calculator";
import { ArrowUpDown } from "lucide-react";

interface DCPensionEmployee extends DCContributionResult {
  id: string;
  employeeNumber: string;
  name: string;
  departmentName: string;
  position: string;
  hireDate: Date;
}

interface DCPensionTableProps {
  contributions: DCPensionEmployee[];
}

type SortKey = "contribution" | "annual";

export function DCPensionTable({ contributions }: DCPensionTableProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("contribution");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const sorted = [...contributions].sort((a, b) => {
    let comparison = 0;
    if (sortKey === "contribution") {
      comparison = a.recommendedContribution - b.recommendedContribution;
    } else if (sortKey === "annual") {
      comparison = a.annualProjection - b.annualProjection;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const selectedEmployee = sorted.find((e) => e.id === selectedEmployeeId);

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
            <TableHead>기준소득월액</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => toggleSort("contribution")}
            >
              <div className="flex items-center gap-1">
                월 부담금
                {sortKey === "contribution" && (
                  sortOrder === "desc" ? " ↓" : " ↑"
                )}
                {sortKey !== "contribution" && (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => toggleSort("annual")}
            >
              <div className="flex items-center gap-1">
                연간 예상
                {sortKey === "annual" && (
                  sortOrder === "desc" ? " ↓" : " ↑"
                )}
                {sortKey !== "annual" && (
                  <ArrowUpDown className="h-3 w-3 opacity-30" />
                )}
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((emp) => (
            <TableRow
              key={emp.id}
              className="cursor-pointer hover:bg-accent/50"
              onClick={() => setSelectedEmployeeId(emp.id)}
            >
              <TableCell>{emp.employeeNumber}</TableCell>
              <TableCell className="font-medium">{emp.name}</TableCell>
              <TableCell>{emp.departmentName}</TableCell>
              <TableCell>{emp.position}</TableCell>
              <TableCell>
                {format(new Date(emp.hireDate), "yyyy-MM-dd", { locale: ko })}
              </TableCell>
              <TableCell>{formatCurrency(emp.monthlyBaseSalary)}</TableCell>
              <TableCell className="font-medium">
                {formatCurrency(emp.recommendedContribution)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatCurrency(emp.annualProjection)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedEmployee && (
        <DCPensionDetailDialog
          employee={selectedEmployee}
          open={selectedEmployeeId !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedEmployeeId(null);
          }}
        />
      )}
    </>
  );
}
