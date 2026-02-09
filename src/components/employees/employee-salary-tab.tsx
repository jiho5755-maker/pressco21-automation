// 직원 급여/보험 탭 — Phase 1-B: 수당 분리 및 비과세 처리
"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateSalary } from "@/lib/salary-calculator";
import { INSURANCE_RATES_2026 } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Employee } from "@prisma/client";

interface EmployeeSalaryTabProps {
  employee: Employee;
}

function InfoRow({
  label,
  value,
  className,
}: {
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex justify-between items-center py-2", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value || "-"}</span>
    </div>
  );
}

export function EmployeeSalaryTab({ employee }: EmployeeSalaryTabProps) {
  // 급여 계산 (고정OT 포함)
  const salaryResult = calculateSalary(
    {
      baseSalary: employee.baseSalary,
      mealAllowance: employee.mealAllowance || 0,
      transportAllowance: employee.transportAllowance || 0,
      positionAllowance: employee.positionAllowance || 0,
      taxFreeMeal: employee.taxFreeMeal ?? true,
      taxFreeTransport: employee.taxFreeTransport ?? true,
      useFixedOT: employee.useFixedOT || false,
      fixedOTAmount: employee.fixedOTAmount || 0,
      fixedNightWorkAmount: employee.fixedNightWorkAmount || 0,
      fixedHolidayWorkAmount: employee.fixedHolidayWorkAmount || 0,
    },
    {
      nationalPension: employee.nationalPension,
      healthInsurance: employee.healthInsurance,
      employmentInsurance: employee.employmentInsurance,
      dependents: employee.dependents,
      childrenUnder20: employee.childrenUnder20,
    }
  );

  return (
    <div className="space-y-6">
      {/* 급여 구성 */}
      <Card>
        <CardHeader>
          <CardTitle>급여 구성</CardTitle>
          <CardDescription>
            {employee.salaryType === "MONTHLY" ? "월급제" : "시급제"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            label="기본급"
            value={`${employee.baseSalary.toLocaleString()}원`}
          />
          <InfoRow
            label="식대"
            value={
              <span className="flex items-center gap-2">
                {(employee.mealAllowance || 0).toLocaleString()}원
                {employee.taxFreeMeal && (employee.mealAllowance || 0) > 0 && (
                  <Badge variant="outline" className="text-[10px]">
                    비과세
                  </Badge>
                )}
              </span>
            }
          />
          <InfoRow
            label="교통비"
            value={
              <span className="flex items-center gap-2">
                {(employee.transportAllowance || 0).toLocaleString()}원
                {employee.taxFreeTransport &&
                  (employee.transportAllowance || 0) > 0 && (
                    <Badge variant="outline" className="text-[10px]">
                      비과세
                    </Badge>
                  )}
              </span>
            }
          />
          <InfoRow
            label="직책수당"
            value={`${(employee.positionAllowance || 0).toLocaleString()}원`}
          />

          {/* 고정OT (포괄임금제) */}
          {employee.useFixedOT && (
            <>
              <div className="border-t pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    포괄임금제
                  </Badge>
                </div>
              </div>

              {salaryResult.fixedOTAmount > 0 && (
                <InfoRow
                  label={`고정 연장수당 (${employee.fixedOTHours || 0}시간)`}
                  value={`${salaryResult.fixedOTAmount.toLocaleString()}원`}
                  className="text-sm"
                />
              )}

              {salaryResult.fixedNightWorkAmount > 0 && (
                <InfoRow
                  label={`고정 야간수당 (${employee.fixedNightWorkHours || 0}시간)`}
                  value={`${salaryResult.fixedNightWorkAmount.toLocaleString()}원`}
                  className="text-sm"
                />
              )}

              {salaryResult.fixedHolidayWorkAmount > 0 && (
                <InfoRow
                  label={`고정 휴일수당 (${employee.fixedHolidayWorkHours || 0}시간)`}
                  value={`${salaryResult.fixedHolidayWorkAmount.toLocaleString()}원`}
                  className="text-sm"
                />
              )}
            </>
          )}

          <div className="border-t pt-3 mt-3">
            <InfoRow
              label="총 급여"
              value={
                <span className="text-lg font-bold">
                  {salaryResult.totalGross.toLocaleString()}원
                </span>
              }
            />
            <InfoRow
              label="과세 대상"
              value={
                <span className="text-sm text-muted-foreground">
                  {salaryResult.totalTaxable.toLocaleString()}원
                </span>
              }
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* 공제 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>공제 내역</CardTitle>
          <CardDescription>2026년 기준 자동 계산</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow
            label="국민연금"
            value={
              <span className="flex items-center gap-2">
                {salaryResult.nationalPension.toLocaleString()}원
                <span className="text-xs text-muted-foreground">
                  ({(INSURANCE_RATES_2026.rates.nationalPension * 100).toFixed(2)}%)
                </span>
              </span>
            }
          />
          <InfoRow
            label="건강보험"
            value={
              <span className="flex items-center gap-2">
                {salaryResult.healthInsurance.toLocaleString()}원
                <span className="text-xs text-muted-foreground">
                  ({(INSURANCE_RATES_2026.rates.healthInsurance * 100).toFixed(3)}%)
                </span>
              </span>
            }
          />
          <InfoRow
            label="장기요양"
            value={
              <span className="flex items-center gap-2">
                {salaryResult.longTermCare.toLocaleString()}원
                <span className="text-xs text-muted-foreground">
                  ({(INSURANCE_RATES_2026.rates.longTermCare * 100).toFixed(2)}%)
                </span>
              </span>
            }
          />
          <InfoRow
            label="고용보험"
            value={
              <span className="flex items-center gap-2">
                {salaryResult.employmentInsurance.toLocaleString()}원
                <span className="text-xs text-muted-foreground">
                  ({(INSURANCE_RATES_2026.rates.employmentInsurance * 100).toFixed(1)}%)
                </span>
              </span>
            }
          />
          <InfoRow
            label="소득세"
            value={`${salaryResult.incomeTax.toLocaleString()}원`}
          />
          <InfoRow
            label="지방소득세"
            value={`${salaryResult.localIncomeTax.toLocaleString()}원`}
          />
          <div className="border-t pt-3 mt-3">
            <InfoRow
              label="총 공제액"
              value={
                <span className="text-lg font-bold">
                  {(
                    salaryResult.totalInsurance +
                    salaryResult.incomeTax +
                    salaryResult.localIncomeTax
                  ).toLocaleString()}
                  원
                </span>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 실수령액 */}
      <Card>
        <CardHeader>
          <CardTitle>실수령액</CardTitle>
          <CardDescription>
            총 급여 - 공제액 (소득세는 간이세액표 간단 버전)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            {salaryResult.netSalary.toLocaleString()}원
          </div>
        </CardContent>
      </Card>

      {/* 기타 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>기타 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <InfoRow label="은행" value={employee.bankName} />
          <InfoRow label="계좌번호" value={employee.bankAccount} />
          <InfoRow label="부양가족 수" value={`${employee.dependents}명`} />
          <InfoRow
            label="20세 이하 자녀"
            value={
              employee.childrenUnder20 > 0 ? (
                <span className="flex items-center gap-2">
                  {employee.childrenUnder20}명
                  <Badge variant="outline" className="text-[10px]">
                    자녀세액공제 대상
                  </Badge>
                </span>
              ) : (
                "-"
              )
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
