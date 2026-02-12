"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAction } from "next-safe-action/hooks";
import { getSeverancePayDetail } from "@/actions/severance-pay-actions";
import { useEffect } from "react";
import { formatCurrency } from "@/lib/accounting-utils";
import { Info } from "lucide-react";
import { format } from "date-fns";

interface SeverancePayDetailDialogProps {
  employeeId: string | null;
  open: boolean;
  onClose: () => void;
}

export function SeverancePayDetailDialog({
  employeeId,
  open,
  onClose,
}: SeverancePayDetailDialogProps) {
  const { execute, result, isPending } = useAction(getSeverancePayDetail);

  useEffect(() => {
    if (employeeId && open) {
      execute({ employeeId });
    }
  }, [employeeId, open, execute]);

  const detail = result.data?.data;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>퇴직금 계산 상세 내역</DialogTitle>
        </DialogHeader>

        {isPending && (
          <div className="text-center py-8 text-muted-foreground">
            로딩 중...
          </div>
        )}

        {detail && (
          <div className="space-y-6">
            {/* 직원 정보 */}
            <div className="border-b pb-4">
              <p className="text-sm text-muted-foreground">
                사번: {detail.employee.employeeNumber}
              </p>
              <p className="text-lg font-semibold">{detail.employee.name}</p>
              <p className="text-sm">
                입사일: {format(new Date(detail.employee.hireDate), "yyyy-MM-dd")}
              </p>
            </div>

            {/* 1년 미만 체크 */}
            {!detail.isEligible && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  근속 1년 미만으로 퇴직금 지급 대상이 아닙니다.
                  <br />
                  근속일수: {detail.continuousServiceDays}일 (
                  {detail.continuousServiceYears}년)
                </AlertDescription>
              </Alert>
            )}

            {detail.isEligible && (
              <>
                {/* 평균임금 */}
                <div>
                  <h3 className="font-semibold mb-2">
                    1. 평균임금 (최근 3개월 급여 평균)
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(detail.averageWage)} / 일
                  </p>
                </div>

                {/* 통상임금 */}
                <div>
                  <h3 className="font-semibold mb-2">
                    2. 통상임금 (기본급 + 정기 수당)
                  </h3>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(detail.ordinaryWage)} / 일
                  </p>
                </div>

                {/* 기준임금 Alert */}
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    최종 기준임금:{" "}
                    <strong>{formatCurrency(detail.applicableWage)}</strong> /
                    일
                    <br />
                    (평균임금과 통상임금 중 큰 값 적용)
                  </AlertDescription>
                </Alert>

                {/* 최종 퇴직금 */}
                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">3. 최종 퇴직금</h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    근속연수: {detail.continuousServiceYears}년 (
                    {detail.continuousServiceDays}일)
                  </p>
                  <p className="text-sm text-muted-foreground mb-2">
                    계산식: {formatCurrency(detail.applicableWage)} × 30일 ×{" "}
                    {detail.continuousServiceYears}년 / 365일
                  </p>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(detail.severancePay)}
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
