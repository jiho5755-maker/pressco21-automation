"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAction } from "next-safe-action/hooks";
import { exportWithholdingTaxToExcel } from "@/actions/withholding-tax-actions";
import { FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/accounting-utils";
import type { MonthlyWithholdingSummary } from "@/lib/withholding-tax-aggregator";

interface WithholdingTaxSummaryTableProps {
  summary: MonthlyWithholdingSummary[];
  year: number;
}

export function WithholdingTaxSummaryTable({
  summary,
  year,
}: WithholdingTaxSummaryTableProps) {
  const { execute, isPending } = useAction(exportWithholdingTaxToExcel, {
    onSuccess: ({ data }) => {
      if (!data) return;

      // base64 → Blob → 다운로드
      const byteCharacters = atob(data.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Excel 파일 다운로드 완료");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Excel 내보내기 실패");
    },
  });

  const handleExport = () => {
    execute({ year });
  };

  // 연간 합계 계산
  const yearlyTotal = summary.reduce(
    (acc, row) => ({
      totalGross: acc.totalGross + row.totalGross,
      totalTaxableAmount: acc.totalTaxableAmount + row.totalTaxableAmount,
      totalNonTaxable: acc.totalNonTaxable + row.totalNonTaxable,
      incomeTax: acc.incomeTax + row.incomeTax,
      localIncomeTax: acc.localIncomeTax + row.localIncomeTax,
      totalTax: acc.totalTax + row.totalTax,
    }),
    {
      totalGross: 0,
      totalTaxableAmount: 0,
      totalNonTaxable: 0,
      incomeTax: 0,
      localIncomeTax: 0,
      totalTax: 0,
    }
  );

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>연월</TableHead>
            <TableHead className="text-right">인원</TableHead>
            <TableHead className="text-right">총 급여</TableHead>
            <TableHead className="text-right">과세 대상</TableHead>
            <TableHead className="text-right">비과세</TableHead>
            <TableHead className="text-right">소득세</TableHead>
            <TableHead className="text-right">지방소득세</TableHead>
            <TableHead className="text-right">합계</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {summary.map((row) => (
            <TableRow key={row.month}>
              <TableCell className="font-medium">{row.month}</TableCell>
              <TableCell className="text-right">{row.employeeCount}명</TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.totalGross)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.totalTaxableAmount)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.totalNonTaxable)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.incomeTax)}
              </TableCell>
              <TableCell className="text-right">
                {formatCurrency(row.localIncomeTax)}
              </TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(row.totalTax)}
              </TableCell>
            </TableRow>
          ))}
          {/* 합계 행 */}
          <TableRow className="bg-muted/50 font-semibold">
            <TableCell>연간 합계</TableCell>
            <TableCell className="text-right">-</TableCell>
            <TableCell className="text-right">
              {formatCurrency(yearlyTotal.totalGross)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(yearlyTotal.totalTaxableAmount)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(yearlyTotal.totalNonTaxable)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(yearlyTotal.incomeTax)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(yearlyTotal.localIncomeTax)}
            </TableCell>
            <TableCell className="text-right">
              {formatCurrency(yearlyTotal.totalTax)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <div className="flex justify-end">
        <Button onClick={handleExport} disabled={isPending}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {isPending ? "다운로드 중..." : "Excel 내보내기"}
        </Button>
      </div>
    </div>
  );
}
