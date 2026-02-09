// 직원 상세 페이지 — Server Component
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeDetailHeader } from "@/components/employees/employee-detail-header";
import { EmployeeInfoTab } from "@/components/employees/employee-info-tab";
import { EmployeeWorkTab } from "@/components/employees/employee-work-tab";
import { EmployeeSalaryTab } from "@/components/employees/employee-salary-tab";
import { EmployeeLeaveTab } from "@/components/employees/employee-leave-tab";

interface EmployeeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EmployeeDetailPage({
  params,
}: EmployeeDetailPageProps) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: { id },
    include: {
      department: true,
      replacementFor: { select: { name: true, employeeNo: true } },
      replacements: { select: { name: true, employeeNo: true } },
      workSchedules: {
        where: { effectiveTo: null },
        orderBy: { dayOfWeek: "asc" },
      },
      leaveRecords: {
        orderBy: { startDate: "desc" },
      },
    },
  });

  if (!employee) notFound();

  // 수정 Dialog에 필요한 부서 목록
  const departments = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <EmployeeDetailHeader employee={employee} departments={departments} />

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">기본정보</TabsTrigger>
          <TabsTrigger value="work">근무정보</TabsTrigger>
          <TabsTrigger value="salary">급여/보험</TabsTrigger>
          <TabsTrigger value="leave">휴가</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <EmployeeInfoTab employee={employee} />
        </TabsContent>

        <TabsContent value="work" className="mt-4">
          <EmployeeWorkTab
            employee={employee}
            workSchedules={employee.workSchedules}
          />
        </TabsContent>

        <TabsContent value="salary" className="mt-4">
          <EmployeeSalaryTab employee={employee} />
        </TabsContent>

        <TabsContent value="leave" className="mt-4">
          <EmployeeLeaveTab
            employee={employee}
            leaveRecords={employee.leaveRecords}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
