import { Suspense } from "react";
import { startOfMonth, endOfMonth } from "date-fns";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import {
  getDataScope,
  buildEmployeeFilter,
  getCurrentUserEmployee,
} from "@/lib/rbac-helpers";
import { calculateMonthlyStats } from "@/lib/attendance-calculator";
import { AttendancePageClient } from "./client";

export default async function AttendancePage() {
  // 현재 월의 시작일과 종료일
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  // 데이터 범위 및 필터 생성
  const scope = await getDataScope();
  const currentEmployee = await getCurrentUserEmployee();
  const employeeFilter = buildEmployeeFilter(scope, currentEmployee);

  // 1. 근태 기록 조회 (현재 월 + 역할별 필터링)
  const records = await prisma.attendanceRecord.findMany({
    where: {
      date: {
        gte: monthStart,
        lte: monthEnd,
      },
      employee: {
        status: "ACTIVE", // 재직자만
        ...employeeFilter, // 역할별 필터
      },
    },
    include: {
      employee: {
        include: {
          department: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
  });

  // 2. 월별 통계 계산
  const stats = calculateMonthlyStats(records);

  // 3. 직원 목록 조회 (재직자만 + 역할별 필터링)
  const employees = await prisma.employee.findMany({
    where: {
      status: "ACTIVE",
      ...employeeFilter,
    },
    include: {
      department: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  // 4. 부서 목록 조회
  const departments = await prisma.department.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <>
      <PageHeader
        title="근태 관리"
        description="직원별 출퇴근 기록 및 근무시간을 관리합니다."
      />

      <Suspense fallback={<div>로딩 중...</div>}>
        <AttendancePageClient
          initialRecords={records}
          initialStats={stats}
          employees={employees}
          departments={departments}
        />
      </Suspense>
    </>
  );
}
