// 직원 급여/보험 탭 — 급여정보 + 4대보험 + 월 예상 공제액
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateHourlyRate,
  calculateMonthlyInsurance,
  formatCurrency,
} from "@/lib/salary-calculator";
import { INSURANCE_RATES_2026, LABOR_STANDARDS_2026 } from "@/lib/constants";
import type { Employee } from "@prisma/client";

interface EmployeeSalaryTabProps {
  employee: Employee;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

export function EmployeeSalaryTab({ employee }: EmployeeSalaryTabProps) {
  const hourlyRate = calculateHourlyRate(
    employee.baseSalary,
    employee.salaryType
  );
  const insurance = calculateMonthlyInsurance(employee.baseSalary, {
    nationalPension: employee.nationalPension,
    healthInsurance: employee.healthInsurance,
    employmentInsurance: employee.employmentInsurance,
    industrialAccident: employee.industrialAccident,
  });

  const isMinimumWage = hourlyRate < LABOR_STANDARDS_2026.minimumWage.hourly;

  return (
    <div className="space-y-4">
      {/* 급여 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">급여 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow
            label="급여유형"
            value={employee.salaryType === "MONTHLY" ? "월급제" : "시급제"}
          />
          <InfoRow
            label="기본급"
            value={formatCurrency(employee.baseSalary)}
          />
          <InfoRow
            label="통상시급"
            value={
              <span className="flex items-center gap-2">
                {formatCurrency(hourlyRate)}
                {isMinimumWage && (
                  <Badge variant="destructive" className="text-[10px]">
                    최저임금 미달
                  </Badge>
                )}
              </span>
            }
          />
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

      {/* 4대보험 가입 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">4대보험 가입 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow
            label="국민연금"
            value={
              <Badge
                variant="outline"
                className={
                  employee.nationalPension
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }
              >
                {employee.nationalPension ? "가입" : "미가입"}
              </Badge>
            }
          />
          <InfoRow
            label="건강보험"
            value={
              <Badge
                variant="outline"
                className={
                  employee.healthInsurance
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }
              >
                {employee.healthInsurance ? "가입" : "미가입"}
              </Badge>
            }
          />
          <InfoRow
            label="고용보험"
            value={
              <Badge
                variant="outline"
                className={
                  employee.employmentInsurance
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }
              >
                {employee.employmentInsurance ? "가입" : "미가입"}
              </Badge>
            }
          />
          <InfoRow
            label="산재보험"
            value={
              <Badge
                variant="outline"
                className={
                  employee.industrialAccident
                    ? "border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300"
                    : "border-gray-200 bg-gray-50 text-gray-500"
                }
              >
                {employee.industrialAccident ? "가입" : "미가입"}
              </Badge>
            }
          />
        </CardContent>
      </Card>

      {/* 월 예상 공제액 */}
      {employee.baseSalary > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">월 예상 공제액 (2026년 기준)</CardTitle>
            <CardDescription>
              기본급 {formatCurrency(employee.baseSalary)} 기준 자동 계산
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>항목</TableHead>
                  <TableHead className="text-right">요율</TableHead>
                  <TableHead className="text-right">근로자 부담</TableHead>
                  <TableHead className="text-right">사업주 부담</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>국민연금</TableCell>
                  <TableCell className="text-right">
                    {(INSURANCE_RATES_2026.nationalPension.employee * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.nationalPension)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.employer.nationalPension)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>건강보험</TableCell>
                  <TableCell className="text-right">
                    {(INSURANCE_RATES_2026.healthInsurance.employee * 100).toFixed(3)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.healthInsurance)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.employer.healthInsurance)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>장기요양보험</TableCell>
                  <TableCell className="text-right">
                    {(INSURANCE_RATES_2026.longTermCare.rate * 100).toFixed(2)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.longTermCare)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.employer.longTermCare)}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>고용보험</TableCell>
                  <TableCell className="text-right">
                    {(INSURANCE_RATES_2026.employmentInsurance.employee * 100).toFixed(1)}%
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.employmentInsurance)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.employer.employmentInsurance)}
                  </TableCell>
                </TableRow>
                {employee.industrialAccident && (
                  <TableRow>
                    <TableCell>산재보험</TableCell>
                    <TableCell className="text-right">0.7%</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(insurance.employer.industrialAccident)}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="font-bold border-t-2">
                  <TableCell>합계</TableCell>
                  <TableCell className="text-right" />
                  <TableCell className="text-right">
                    {formatCurrency(insurance.totalEmployee)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(insurance.employer.total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
