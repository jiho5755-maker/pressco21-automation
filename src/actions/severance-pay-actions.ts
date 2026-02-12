"use server";

import { z } from "zod/v4";
import { authActionClient, ActionError } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { calculateSeverancePay } from "@/lib/severance-pay-calculator";
import { subMonths } from "date-fns";

/**
 * 단일 직원 퇴직금 상세 계산 (Admin 전용)
 */
const detailSchema = z.object({
  employeeId: z.string().cuid(),
  retirementDate: z.string().optional(), // ISO date
});

export const getSeverancePayDetail = authActionClient
  .inputSchema(detailSchema)
  .action(async ({ parsedInput: { employeeId, retirementDate }, ctx }) => {
    if (ctx.userRole !== "admin") {
      throw new ActionError("관리자만 퇴직금 상세를 조회할 수 있습니다.");
    }

    const targetDate = retirementDate ? new Date(retirementDate) : new Date();

    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        employeeNo: true,
        name: true,
        joinDate: true,
        baseSalary: true,
        mealAllowance: true,
        transportAllowance: true,
        positionAllowance: true,
      },
    });

    if (!employee) {
      throw new ActionError("직원을 찾을 수 없습니다.");
    }

    // 최근 3개월 급여 기록 조회
    const threeMonthsAgo = subMonths(targetDate, 3);
    const recentPayrolls = await prisma.payrollRecord.findMany({
      where: {
        employeeId,
        OR: [
          {
            year: threeMonthsAgo.getFullYear(),
            month: { gte: threeMonthsAgo.getMonth() + 1 },
          },
          {
            year: targetDate.getFullYear(),
            month: { lte: targetDate.getMonth() + 1 },
          },
        ],
      },
      orderBy: [{ year: "desc" }, { month: "desc" }],
      take: 3,
      select: { totalGross: true, year: true, month: true },
    });

    const detail = calculateSeverancePay(employee, recentPayrolls, targetDate);

    return {
      success: true,
      data: {
        employee: {
          employeeNumber: employee.employeeNo,
          name: employee.name,
          hireDate: employee.joinDate,
        },
        ...detail,
      },
    };
  });

/**
 * 전체 재직자 퇴직금 추계액 조회 (Admin 전용)
 */
const allEstimatesSchema = z.object({
  retirementDate: z.string().optional(), // ISO date
});

export const getAllSeverancePayEstimates = authActionClient
  .inputSchema(allEstimatesSchema)
  .action(async ({ parsedInput: { retirementDate }, ctx }) => {
    if (ctx.userRole !== "admin") {
      throw new ActionError("관리자만 퇴직금 추계를 조회할 수 있습니다.");
    }

    const targetDate = retirementDate ? new Date(retirementDate) : new Date();

    // 재직자 조회
    const employees = await prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        employeeNo: true,
        name: true,
        departmentId: true,
        department: { select: { name: true } },
        position: true,
        joinDate: true,
        baseSalary: true,
        mealAllowance: true,
        transportAllowance: true,
        positionAllowance: true,
      },
    });

    // 각 직원의 최근 3개월 급여 기록 조회
    const threeMonthsAgo = subMonths(targetDate, 3);
    const allPayrolls = await prisma.payrollRecord.findMany({
      where: {
        employeeId: { in: employees.map((e) => e.id) },
        OR: [
          {
            year: threeMonthsAgo.getFullYear(),
            month: { gte: threeMonthsAgo.getMonth() + 1 },
          },
          {
            year: targetDate.getFullYear(),
            month: { lte: targetDate.getMonth() + 1 },
          },
        ],
      },
      select: { employeeId: true, totalGross: true, year: true, month: true },
    });

    // 직원별 퇴직금 계산
    const estimates = employees.map((emp) => {
      const recentPayrolls = allPayrolls
        .filter((p) => p.employeeId === emp.id)
        .sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        })
        .slice(0, 3);

      const result = calculateSeverancePay(emp, recentPayrolls, targetDate);

      return {
        id: emp.id,
        employeeNumber: emp.employeeNo,
        name: emp.name,
        departmentName: emp.department.name,
        position: emp.position,
        hireDate: emp.joinDate,
        ...result,
      };
    });

    // 퇴직금 내림차순 정렬
    const sorted = estimates.sort((a, b) => b.severancePay - a.severancePay);

    return {
      success: true,
      data: sorted,
    };
  });
