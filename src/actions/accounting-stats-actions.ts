"use server";

import { z } from "zod/v4";
import { authActionClient, ActionError } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";

/**
 * 부서별 급여 통계 조회 (Admin 전용)
 */
const statsByDeptSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12).optional(),
});

export const getPayrollStatsByDepartment = authActionClient
  .inputSchema(statsByDeptSchema)
  .action(async ({ parsedInput: { year, month }, ctx }) => {
    if (ctx.userRole !== "admin") {
      throw new ActionError("관리자만 통계를 조회할 수 있습니다.");
    }

    const records = await prisma.payrollRecord.findMany({
      where: {
        year,
        ...(month && { month }),
      },
      include: {
        employee: {
          select: {
            departmentId: true,
            department: { select: { name: true } },
          },
        },
      },
    });

    // 부서별 그룹화
    const deptMap = new Map<
      string,
      {
        departmentId: string;
        departmentName: string;
        employees: Set<string>;
        totalGross: number;
        totalNet: number;
      }
    >();

    for (const record of records) {
      const deptId = record.employee.departmentId;
      const deptName = record.employee.department.name;

      if (!deptMap.has(deptId)) {
        deptMap.set(deptId, {
          departmentId: deptId,
          departmentName: deptName,
          employees: new Set(),
          totalGross: 0,
          totalNet: 0,
        });
      }

      const dept = deptMap.get(deptId)!;
      dept.employees.add(record.employeeId);
      dept.totalGross += record.totalGross;
      dept.totalNet += record.netSalary;
    }

    // 결과 변환
    const result = Array.from(deptMap.values())
      .map((dept) => ({
        departmentId: dept.departmentId,
        departmentName: dept.departmentName,
        employeeCount: dept.employees.size,
        totalGross: dept.totalGross,
        totalNet: dept.totalNet,
        avgSalary: Math.floor(dept.totalGross / dept.employees.size),
      }))
      .sort((a, b) => b.totalGross - a.totalGross); // 총 급여 내림차순

    return {
      success: true,
      data: result,
    };
  });

/**
 * 직급별 급여 통계 조회 (Admin 전용)
 */
const statsByPositionSchema = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12).optional(),
});

export const getPayrollStatsByPosition = authActionClient
  .inputSchema(statsByPositionSchema)
  .action(async ({ parsedInput: { year, month }, ctx }) => {
    if (ctx.userRole !== "admin") {
      throw new ActionError("관리자만 통계를 조회할 수 있습니다.");
    }

    const records = await prisma.payrollRecord.findMany({
      where: {
        year,
        ...(month && { month }),
      },
      include: {
        employee: {
          select: {
            position: true,
          },
        },
      },
    });

    // 직급별 그룹화
    const positionMap = new Map<
      string,
      {
        position: string;
        employees: Set<string>;
        totalGross: number;
      }
    >();

    for (const record of records) {
      const position = record.employee.position;

      if (!positionMap.has(position)) {
        positionMap.set(position, {
          position,
          employees: new Set(),
          totalGross: 0,
        });
      }

      const pos = positionMap.get(position)!;
      pos.employees.add(record.employeeId);
      pos.totalGross += record.totalGross;
    }

    // 결과 변환
    const result = Array.from(positionMap.values())
      .map((pos) => ({
        position: pos.position,
        employeeCount: pos.employees.size,
        totalGross: pos.totalGross,
        avgSalary: Math.floor(pos.totalGross / pos.employees.size),
      }))
      .sort((a, b) => b.avgSalary - a.avgSalary); // 평균 급여 내림차순

    return {
      success: true,
      data: result,
    };
  });

/**
 * 월별 인건비 트렌드 조회 (Admin 전용)
 */
const monthlyTrendSchema = z.object({
  year: z.number().int(),
});

export const getMonthlyTrend = authActionClient
  .inputSchema(monthlyTrendSchema)
  .action(async ({ parsedInput: { year }, ctx }) => {
    if (ctx.userRole !== "admin") {
      throw new ActionError("관리자만 통계를 조회할 수 있습니다.");
    }

    const result = [];

    for (let month = 1; month <= 12; month++) {
      const records = await prisma.payrollRecord.findMany({
        where: { year, month },
      });

      const totalGross = records.reduce((sum, r) => sum + r.totalGross, 0);
      const totalNet = records.reduce((sum, r) => sum + r.netSalary, 0);
      const employeeCount = records.length;

      result.push({
        year,
        month,
        employeeCount,
        totalGross,
        totalNet,
        avgSalary: employeeCount > 0 ? Math.floor(totalGross / employeeCount) : 0,
      });
    }

    return {
      success: true,
      data: result,
    };
  });
