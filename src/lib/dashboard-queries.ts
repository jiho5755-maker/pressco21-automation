// 대시보드 데이터 페칭 함수 모음
"use server";

import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { getAnnualLeaveSummary } from "@/lib/leave-calculator";

/**
 * 월별 출근율 계산
 * @param year 연도
 * @param month 월 (1~12)
 * @param employeeId 직원 ID (선택)
 * @returns 출근율 (%)
 */
export async function calculateAttendanceRate(
  year: number,
  month: number,
  employeeId?: string
): Promise<number> {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  const where = {
    date: {
      gte: startDate,
      lte: endDate,
    },
    ...(employeeId && { employeeId }),
  };

  // 총 근무일 수 (주말 제외, 간단히 평일만 계산)
  const totalWorkdays = await prisma.attendanceRecord.count({ where });

  // 실제 출근 기록 수
  const actualAttendance = await prisma.attendanceRecord.count({
    where: {
      ...where,
      clockIn: { not: null },
    },
  });

  if (totalWorkdays === 0) return 0;

  return Math.round((actualAttendance / totalWorkdays) * 100);
}

/**
 * 평균 연차 잔여일수 계산
 * @returns 평균 연차 잔여 (일)
 */
export async function calculateAverageLeaveBalance(): Promise<number> {
  const activeEmployees = await prisma.employee.findMany({
    where: { status: "ACTIVE" },
  });

  if (activeEmployees.length === 0) return 0;

  const employeesWithLeaveRecords = await Promise.all(
    activeEmployees.map(async (emp) => {
      const leaveRecords = await prisma.leaveRecord.findMany({
        where: { employeeId: emp.id },
      });
      return { joinDate: emp.joinDate, leaveRecords };
    })
  );

  const balances = employeesWithLeaveRecords.map((emp) => {
    const summary = getAnnualLeaveSummary(emp.joinDate, emp.leaveRecords);
    return summary.remaining;
  });

  const total = balances.reduce((sum, val) => sum + val, 0);
  return Math.round(total / balances.length);
}

/**
 * 주간 초과근무 시간 계산 (현재 주)
 * @returns 총 연장근로 시간 (시간)
 */
export async function calculateWeeklyOvertime(): Promise<number> {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // 월요일 시작
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

  const records = await prisma.attendanceRecord.findMany({
    where: {
      date: {
        gte: weekStart,
        lte: weekEnd,
      },
    },
    select: {
      overtime: true,
    },
  });

  const total = records.reduce((sum, rec) => sum + (rec.overtime || 0), 0) / 60; // 분 → 시간
  return Math.round(total * 10) / 10; // 소수점 1자리
}

/**
 * 이번 달 총 급여 계산
 * @param year 연도
 * @param month 월 (1~12)
 * @returns 총 급여 (원)
 */
export async function calculateMonthlyTotalPayroll(
  year: number,
  month: number
): Promise<number> {
  const payrolls = await prisma.payrollRecord.findMany({
    where: {
      year,
      month,
    },
    select: {
      totalGross: true,
    },
  });

  const total = payrolls.reduce((sum, p) => sum + p.totalGross, 0);
  return total;
}

/**
 * 미처리 승인 건수 계산 (경비 + 휴가)
 * @param userId 사용자 ID
 * @param role 역할
 * @returns 경비 + 휴가 미승인 건수
 */
export async function calculatePendingApprovals(
  userId: string,
  role: string
): Promise<{ expense: number; leave: number; total: number }> {
  // 경비 미승인
  const pendingExpenseCount = await prisma.expense.count({
    where: { status: "PENDING" },
  });

  // 휴가 미승인 (admin/manager만 볼 수 있음)
  const pendingLeaveCount =
    role === "admin" || role === "manager"
      ? await prisma.leaveRecord.count({
          where: { status: "PENDING" },
        })
      : 0;

  return {
    expense: pendingExpenseCount,
    leave: pendingLeaveCount,
    total: pendingExpenseCount + pendingLeaveCount,
  };
}

/**
 * 핵심 통계 데이터 조회 (6개 카드용)
 */
export async function fetchCoreStats(year: number, month: number, userId: string, role: string) {
  const [
    activeCount,
    onLeaveCount,
    flexWorkCount,
    totalEmployees,
    attendanceRate,
    avgLeaveBalance,
    weeklyOvertime,
    monthlyPayroll,
    pendingApprovals,
  ] = await Promise.all([
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.employee.count({ where: { status: "ON_LEAVE" } }),
    prisma.employee.count({
      where: {
        status: "ACTIVE",
        workType: { not: "OFFICE" },
      },
    }),
    prisma.employee.count(),
    calculateAttendanceRate(year, month),
    calculateAverageLeaveBalance(),
    calculateWeeklyOvertime(),
    calculateMonthlyTotalPayroll(year, month),
    calculatePendingApprovals(userId, role),
  ]);

  return {
    activeCount,
    onLeaveCount,
    flexWorkCount,
    totalEmployees,
    attendanceRate,
    avgLeaveBalance,
    weeklyOvertime,
    monthlyPayroll,
    pendingApprovals,
  };
}

// ─────────────────────────────────────────────
// 차트 데이터 페칭 함수
// ─────────────────────────────────────────────

/**
 * 월별 급여 추이 데이터 조회 (최근 6개월)
 */
export async function fetchPayrollTrendData() {
  const now = new Date();
  const data = [];

  for (let i = 5; i >= 0; i--) {
    const targetDate = subMonths(now, i);
    const year = targetDate.getFullYear();
    const month = targetDate.getMonth() + 1;

    const payrolls = await prisma.payrollRecord.findMany({
      where: { year, month },
      select: {
        totalGross: true,
        netSalary: true,
      },
    });

    const totalGross = payrolls.reduce((sum, p) => sum + p.totalGross, 0);
    const totalNet = payrolls.reduce((sum, p) => sum + p.netSalary, 0);

    data.push({
      month: `${year}.${String(month).padStart(2, "0")}`,
      totalGross,
      netSalary: totalNet,
    });
  }

  return data;
}

/**
 * 주별 근태 현황 데이터 조회 (최근 4주)
 */
export async function fetchAttendanceData() {
  const now = new Date();
  const data = [];

  for (let i = 3; i >= 0; i--) {
    const targetDate = subMonths(now, i);
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 });

    const records = await prisma.attendanceRecord.findMany({
      where: {
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    });

    // 정상출근: clockIn이 09:00 이전
    const onTime = records.filter((r) => {
      if (!r.clockIn) return false;
      const hour = r.clockIn.getHours();
      return hour < 9;
    }).length;

    // 지각: clockIn이 09:00 이후
    const late = records.filter((r) => {
      if (!r.clockIn) return false;
      const hour = r.clockIn.getHours();
      return hour >= 9;
    }).length;

    // 결근: clockIn 없음
    const absent = records.filter((r) => !r.clockIn).length;

    const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

    data.push({
      week: weekLabel,
      onTime,
      late,
      absent,
    });
  }

  return data;
}

/**
 * 휴가 사용률 데이터 조회 (유형별 비율)
 */
export async function fetchLeaveUsageData() {
  const leaveRecords = await prisma.leaveRecord.findMany({
    where: {
      status: "APPROVED",
    },
    select: {
      type: true,
      days: true,
    },
  });

  // 유형별 집계
  const summary: Record<string, number> = {};

  leaveRecords.forEach((record) => {
    if (!summary[record.type]) {
      summary[record.type] = 0;
    }
    summary[record.type] += record.days;
  });

  // Pie Chart 데이터 형식
  return Object.entries(summary).map(([type, days]) => ({
    type,
    days,
  }));
}

/**
 * 부서별 경비 데이터 조회 (당월)
 */
export async function fetchExpenseByDepartment(year: number, month: number) {
  const startDate = startOfMonth(new Date(year, month - 1));
  const endDate = endOfMonth(new Date(year, month - 1));

  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: "APPROVED",
    },
    include: {
      employee: {
        include: {
          department: true,
        },
      },
    },
  });

  // 부서별 집계
  const summary: Record<string, number> = {};

  expenses.forEach((expense) => {
    const deptName = expense.employee?.department?.name || "미지정";
    if (!summary[deptName]) {
      summary[deptName] = 0;
    }
    summary[deptName] += expense.amount;
  });

  return Object.entries(summary).map(([department, amount]) => ({
    department,
    amount,
  }));
}

// ─────────────────────────────────────────────
// 최근 활동 데이터
// ─────────────────────────────────────────────

/**
 * 최근 7일 근태 이상 기록 조회
 */
export async function fetchRecentAnomalies() {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const records = await prisma.attendanceRecord.findMany({
    where: {
      date: {
        gte: sevenDaysAgo,
      },
      OR: [
        // 지각: clockIn이 09:00 이후
        {
          clockIn: {
            not: null,
          },
        },
        // 조퇴: clockOut이 18:00 이전 (간단히 workMinutes < 480으로 판단)
        {
          workMinutes: {
            lt: 480,
          },
        },
      ],
    },
    include: {
      employee: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 10,
  });

  return records.map((record) => ({
    id: record.id,
    employeeName: record.employee.name,
    date: record.date,
    clockIn: record.clockIn,
    clockOut: record.clockOut,
    workMinutes: record.workMinutes,
  }));
}

/**
 * 미처리 승인 목록 조회 (경비 + 휴가)
 */
export async function fetchPendingApprovalsList(userId: string, role: string) {
  // 경비 미승인
  const pendingExpenses = await prisma.expense.findMany({
    where: { status: "PENDING" },
    include: {
      employee: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      date: "desc",
    },
    take: 5,
  });

  // 휴가 미승인 (admin/manager만)
  const pendingLeaves =
    role === "admin" || role === "manager"
      ? await prisma.leaveRecord.findMany({
          where: { status: "PENDING" },
          include: {
            employee: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5,
        })
      : [];

  return {
    expenses: pendingExpenses.map((e) => ({
      id: e.id,
      employeeName: e.employee?.name || "알 수 없음",
      category: e.category,
      amount: e.amount,
      date: e.date,
    })),
    leaves: pendingLeaves.map((l) => ({
      id: l.id,
      employeeName: l.employee.name,
      leaveType: l.type,
      startDate: l.startDate,
      endDate: l.endDate,
      days: l.days,
    })),
  };
}
