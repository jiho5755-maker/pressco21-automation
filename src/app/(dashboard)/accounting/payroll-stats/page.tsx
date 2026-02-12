import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/accounting-utils";

export default async function PayrollStatsPage() {
  const session = await auth();

  // RBAC: Admin만 접근 가능
  if (!session?.user || session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // 당월 급여 기록 조회
  const records = await prisma.payrollRecord.findMany({
    where: {
      year: currentYear,
      month: currentMonth,
    },
    include: {
      employee: {
        select: {
          departmentId: true,
          department: { select: { name: true } },
          position: true,
        },
      },
    },
  });

  // 부서별 집계
  const deptMap = new Map<
    string,
    {
      departmentName: string;
      employees: Set<string>;
      totalGross: number;
    }
  >();

  for (const record of records) {
    const deptId = record.employee.departmentId;
    const deptName = record.employee.department.name;

    if (!deptMap.has(deptId)) {
      deptMap.set(deptId, {
        departmentName: deptName,
        employees: new Set(),
        totalGross: 0,
      });
    }

    const dept = deptMap.get(deptId)!;
    dept.employees.add(record.employeeId);
    dept.totalGross += record.totalGross;
  }

  const deptStats = Array.from(deptMap.values())
    .map((dept) => ({
      departmentName: dept.departmentName,
      employeeCount: dept.employees.size,
      totalGross: dept.totalGross,
      avgSalary: Math.floor(dept.totalGross / dept.employees.size),
    }))
    .sort((a, b) => b.totalGross - a.totalGross);

  // 직급별 집계
  const posMap = new Map<
    string,
    {
      position: string;
      employees: Set<string>;
      totalGross: number;
    }
  >();

  for (const record of records) {
    const position = record.employee.position;

    if (!posMap.has(position)) {
      posMap.set(position, {
        position,
        employees: new Set(),
        totalGross: 0,
      });
    }

    const pos = posMap.get(position)!;
    pos.employees.add(record.employeeId);
    pos.totalGross += record.totalGross;
  }

  const posStats = Array.from(posMap.values())
    .map((pos) => ({
      position: pos.position,
      employeeCount: pos.employees.size,
      totalGross: pos.totalGross,
      avgSalary: Math.floor(pos.totalGross / pos.employees.size),
    }))
    .sort((a, b) => b.avgSalary - a.avgSalary);

  return (
    <div className="space-y-6">
      <PageHeader
        title="급여 통계"
        description={`${currentYear}년 ${currentMonth}월 부서별/직급별 급여 통계`}
      />

      {/* 부서별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>부서별 급여 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>부서명</TableHead>
                <TableHead className="text-right">인원</TableHead>
                <TableHead className="text-right">총 급여</TableHead>
                <TableHead className="text-right">평균 급여</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deptStats.map((dept, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    {dept.departmentName}
                  </TableCell>
                  <TableCell className="text-right">
                    {dept.employeeCount}명
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(dept.totalGross)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(dept.avgSalary)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 직급별 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>직급별 급여 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>직급</TableHead>
                <TableHead className="text-right">인원</TableHead>
                <TableHead className="text-right">총 급여</TableHead>
                <TableHead className="text-right">평균 급여</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posStats.map((pos, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{pos.position}</TableCell>
                  <TableCell className="text-right">
                    {pos.employeeCount}명
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(pos.totalGross)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(pos.avgSalary)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
