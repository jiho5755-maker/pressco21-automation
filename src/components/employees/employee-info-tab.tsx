// 직원 기본정보 탭 — 인적사항 + 계약정보
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CONTRACT_TYPES } from "@/lib/constants";
import type { Department, Employee } from "@prisma/client";

type EmployeeWithDept = Employee & {
  department: Department;
  replacementFor: { name: string; employeeNo: string } | null;
  replacements: { name: string; employeeNo: string }[];
};

interface EmployeeInfoTabProps {
  employee: EmployeeWithDept;
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value || "-"}</span>
    </div>
  );
}

export function EmployeeInfoTab({ employee }: EmployeeInfoTabProps) {
  const contractLabel =
    CONTRACT_TYPES[employee.contractType as keyof typeof CONTRACT_TYPES] ||
    employee.contractType;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* 인적사항 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">인적사항</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="이름" value={employee.name} />
          <InfoRow label="사번" value={employee.employeeNo} />
          <InfoRow label="이메일" value={employee.email} />
          <InfoRow label="연락처" value={employee.phone} />
          <InfoRow label="주소" value={employee.address} />
          <InfoRow
            label="20세 이하 자녀"
            value={
              employee.childrenUnder20 > 0
                ? `${employee.childrenUnder20}명`
                : "-"
            }
          />
          <InfoRow label="부서" value={employee.department.name} />
          <InfoRow label="직급" value={employee.position} />
        </CardContent>
      </Card>

      {/* 계약정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">계약정보</CardTitle>
        </CardHeader>
        <CardContent>
          <InfoRow label="계약유형" value={contractLabel} />
          <InfoRow
            label="입사일"
            value={format(new Date(employee.joinDate), "yyyy년 M월 d일", {
              locale: ko,
            })}
          />
          {employee.contractEndDate && (
            <InfoRow
              label="계약종료일"
              value={format(
                new Date(employee.contractEndDate),
                "yyyy년 M월 d일",
                { locale: ko }
              )}
            />
          )}
          {employee.probationEnd && (
            <InfoRow
              label="수습종료일"
              value={format(
                new Date(employee.probationEnd),
                "yyyy년 M월 d일",
                { locale: ko }
              )}
            />
          )}
          {employee.replacementFor && (
            <InfoRow
              label="대체 대상"
              value={`${employee.replacementFor.name} (${employee.replacementFor.employeeNo})`}
            />
          )}
          {employee.replacements.length > 0 && (
            <InfoRow
              label="대체인력"
              value={employee.replacements
                .map((r) => `${r.name} (${r.employeeNo})`)
                .join(", ")}
            />
          )}
          {employee.status === "ON_LEAVE" && employee.leaveStartDate && (
            <>
              <InfoRow
                label="휴직 시작"
                value={format(
                  new Date(employee.leaveStartDate),
                  "yyyy년 M월 d일",
                  { locale: ko }
                )}
              />
              {employee.leaveEndDate && (
                <InfoRow
                  label="휴직 종료"
                  value={format(
                    new Date(employee.leaveEndDate),
                    "yyyy년 M월 d일",
                    { locale: ko }
                  )}
                />
              )}
            </>
          )}
          {employee.status === "RESIGNED" && employee.resignDate && (
            <>
              <InfoRow
                label="퇴사일"
                value={format(
                  new Date(employee.resignDate),
                  "yyyy년 M월 d일",
                  { locale: ko }
                )}
              />
              {employee.resignReason && (
                <InfoRow label="퇴사사유" value={employee.resignReason} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
