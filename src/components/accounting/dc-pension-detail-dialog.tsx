"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/accounting-utils";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import type { DCContributionResult } from "@/lib/dc-pension-calculator";

interface DCPensionDetailDialogProps {
  employee: {
    employeeNumber: string;
    name: string;
    hireDate: Date;
  } & DCContributionResult;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DCPensionDetailDialog({
  employee,
  open,
  onOpenChange,
}: DCPensionDetailDialogProps) {
  const {
    employeeNumber,
    name,
    hireDate,
    monthlyBaseSalary,
    minimumContribution,
    recommendedContribution,
    annualProjection,
    taxDeductibleLimit,
    isWithinTaxLimit,
    contributionRate,
  } = employee;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>DC형 부담금 상세 내역</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* 기본 정보 */}
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <p className="text-sm text-muted-foreground">사번: {employeeNumber}</p>
              <p className="text-lg font-semibold">{name}</p>
              <p className="text-sm text-muted-foreground">
                입사일: {format(new Date(hireDate), "yyyy-MM-dd", { locale: ko })}
              </p>
            </div>
          </div>

          {/* 기준소득월액 */}
          <div>
            <h3 className="text-sm font-semibold mb-2">1. 기준소득월액 (최근 3개월 평균)</h3>
            <p className="text-2xl font-bold">{formatCurrency(monthlyBaseSalary)} / 월</p>
            <p className="text-xs text-muted-foreground mt-1">
              포함: 기본급, 고정수당 (식대·교통비·직책수당·고정OT) 전액
            </p>
            <p className="text-xs text-muted-foreground">
              제외: 변동수당 (연장·야간·휴일근로 수당)
            </p>
          </div>

          {/* 월 부담금 */}
          <div>
            <h3 className="text-sm font-semibold mb-2">2. DC형 월 부담금 ({contributionRate})</h3>
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <p>
                    <strong>법정 최소:</strong> {formatCurrency(minimumContribution)} / 월
                  </p>
                  <p>
                    <strong>권장 부담금:</strong> {formatCurrency(recommendedContribution)} / 월
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    근로자퇴직급여 보장법: 연간 임금총액의 1/12 이상 납입 의무
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          </div>

          {/* 연간 예상 */}
          <div>
            <h3 className="text-sm font-semibold mb-2">3. 연간 예상 부담금</h3>
            <p className="text-xl font-semibold">{formatCurrency(annualProjection)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              계산식: {formatCurrency(recommendedContribution)} × 12개월
            </p>

            {!isWithinTaxLimit && (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  세법상 손비 인정 한도 ({formatCurrency(taxDeductibleLimit)}) 초과
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* 납입처 정보 */}
          <div className="border-t pt-3">
            <p className="text-sm text-muted-foreground">
              <strong>납입처:</strong> 신한은행 DC형 퇴직연금
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              매월 급여일에 회사가 개인 퇴직연금 계좌에 직접 납입
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
