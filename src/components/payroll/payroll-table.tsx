// 급여 대장 테이블 컴포넌트
"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Trash2 } from "lucide-react";
import type { PayrollRecord, Employee, Department } from "@prisma/client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/salary-calculator";

type PayrollRecordWithEmployee = PayrollRecord & {
  employee: Employee & {
    department: Department;
  };
};

interface PayrollTableProps {
  records: PayrollRecordWithEmployee[];
  onConfirm: (ids: string[]) => void;
  onDelete: (id: string) => void;
}

export function PayrollTable({
  records,
  onConfirm,
  onDelete,
}: PayrollTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map((r) => r.id));
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleConfirmSelected = () => {
    if (selectedIds.length === 0) {
      alert("확정할 급여를 선택해주세요.");
      return;
    }

    const unconfirmed = selectedIds.filter((id) => {
      const record = records.find((r) => r.id === id);
      return record && !record.isConfirmed;
    });

    if (unconfirmed.length === 0) {
      alert("이미 확정된 급여만 선택되었습니다.");
      return;
    }

    if (confirm(`${unconfirmed.length}건의 급여를 확정하시겠습니까?`)) {
      onConfirm(unconfirmed);
      setSelectedIds([]);
    }
  };

  if (records.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>급여 기록이 없습니다.</p>
        <p className="text-sm mt-2">
          &quot;급여 생성&quot; 버튼을 클릭하여 급여를 생성하세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 액션 버튼 */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2">
          <Button onClick={handleConfirmSelected} size="sm">
            선택 항목 확정 ({selectedIds.length}건)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedIds([])}
          >
            선택 해제
          </Button>
        </div>
      )}

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.length === records.length &&
                    records.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>사번</TableHead>
              <TableHead>이름</TableHead>
              <TableHead>부서</TableHead>
              <TableHead className="text-right">총 급여</TableHead>
              <TableHead className="text-right">공제액</TableHead>
              <TableHead className="text-right">실수령액</TableHead>
              <TableHead className="text-center">확정</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((record) => {
              const totalDeduction =
                record.totalInsurance +
                record.incomeTax +
                record.localIncomeTax;

              return (
                <TableRow key={record.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(record.id)}
                      onCheckedChange={() => handleSelectOne(record.id)}
                      disabled={record.isConfirmed}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {record.employee.employeeNo}
                  </TableCell>
                  <TableCell>{record.employee.name}</TableCell>
                  <TableCell>{record.employee.department.name}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(record.totalGross)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(totalDeduction)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(record.netSalary)}
                  </TableCell>
                  <TableCell className="text-center">
                    {record.isConfirmed ? (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        확정
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Circle className="h-3 w-3" />
                        미확정
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {!record.isConfirmed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(record.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
