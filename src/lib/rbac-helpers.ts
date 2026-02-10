// RBAC 헬퍼 함수 — 역할 기반 데이터 접근 제어
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ActionError } from "@/lib/safe-action";
import type { Employee } from "@prisma/client";

/**
 * 데이터 범위 타입
 * - all: 전체 조직 (Admin)
 * - department: 자기 부서 (Manager)
 * - self: 본인만 (Viewer)
 */
export type DataScope = "all" | "department" | "self";

/**
 * 현재 세션의 Employee 조회
 * @returns Employee 또는 null (직원 계정이 없는 경우)
 */
export async function getCurrentUserEmployee(): Promise<Employee | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
  });

  return employee;
}

/**
 * 현재 사용자의 데이터 접근 범위 반환
 * @returns "all" | "department" | "self"
 */
export async function getDataScope(): Promise<DataScope> {
  const session = await auth();
  if (!session?.user?.role) {
    throw new ActionError("로그인이 필요합니다.");
  }

  const role = session.user.role;

  if (role === "admin") {
    return "all";
  }

  if (role === "manager") {
    return "department";
  }

  // viewer 또는 기타 역할
  return "self";
}

/**
 * Prisma 쿼리용 직원 필터 생성
 * @param scope 데이터 범위
 * @param employee 현재 사용자의 Employee (scope가 department/self일 때 필수)
 * @returns Prisma WHERE 조건
 */
export function buildEmployeeFilter(
  scope: DataScope,
  employee: Employee | null
): { id?: string; departmentId?: string } | undefined {
  if (scope === "all") {
    // Admin: 조건 없음 (전체 조회)
    return undefined;
  }

  if (scope === "department") {
    // Manager: 자기 부서
    if (!employee) {
      throw new ActionError("직원 정보를 찾을 수 없습니다.");
    }
    return { departmentId: employee.departmentId };
  }

  if (scope === "self") {
    // Viewer: 본인만
    if (!employee) {
      throw new ActionError("직원 정보를 찾을 수 없습니다.");
    }
    return { id: employee.id };
  }

  return undefined;
}

/**
 * 리소스 소유권 검증
 * @param resourceType 리소스 타입 ("employee" | "attendance" | "leave" | "payroll")
 * @param resourceId 리소스 ID
 * @param ctx Server Action 컨텍스트 (userId, userRole 포함)
 * @throws ActionError 권한이 없는 경우
 */
export async function requireDataOwnership(
  resourceType: "employee" | "attendance" | "leave" | "payroll",
  resourceId: string,
  ctx: { userId: string; userRole: string }
): Promise<void> {
  // Admin은 모든 리소스 접근 가능
  if (ctx.userRole === "admin") {
    return;
  }

  // 현재 사용자의 직원 정보 조회
  const currentEmployee = await prisma.employee.findUnique({
    where: { userId: ctx.userId },
  });

  if (!currentEmployee) {
    throw new ActionError("직원 정보를 찾을 수 없습니다.");
  }

  // 리소스별 소유권 검증
  switch (resourceType) {
    case "employee": {
      // Manager: 자기 부서 직원만 조회 가능
      // Viewer: 본인만 조회 가능
      const employee = await prisma.employee.findUnique({
        where: { id: resourceId },
      });

      if (!employee) {
        throw new ActionError("직원 정보를 찾을 수 없습니다.");
      }

      if (ctx.userRole === "manager") {
        if (employee.departmentId !== currentEmployee.departmentId) {
          throw new ActionError("다른 부서 직원의 정보는 조회할 수 없습니다.");
        }
      } else if (ctx.userRole === "viewer") {
        if (employee.id !== currentEmployee.id) {
          throw new ActionError("본인의 정보만 조회할 수 있습니다.");
        }
      }
      break;
    }

    case "attendance": {
      const attendance = await prisma.attendanceRecord.findUnique({
        where: { id: resourceId },
        include: { employee: true },
      });

      if (!attendance) {
        throw new ActionError("근태 기록을 찾을 수 없습니다.");
      }

      if (ctx.userRole === "manager") {
        if (attendance.employee.departmentId !== currentEmployee.departmentId) {
          throw new ActionError(
            "다른 부서 직원의 근태 기록은 접근할 수 없습니다."
          );
        }
      } else if (ctx.userRole === "viewer") {
        if (attendance.employeeId !== currentEmployee.id) {
          throw new ActionError("본인의 근태 기록만 접근할 수 있습니다.");
        }
      }
      break;
    }

    case "leave": {
      const leave = await prisma.leaveRecord.findUnique({
        where: { id: resourceId },
        include: { employee: true },
      });

      if (!leave) {
        throw new ActionError("휴가 기록을 찾을 수 없습니다.");
      }

      if (ctx.userRole === "manager") {
        if (leave.employee.departmentId !== currentEmployee.departmentId) {
          throw new ActionError(
            "다른 부서 직원의 휴가 기록은 접근할 수 없습니다."
          );
        }
      } else if (ctx.userRole === "viewer") {
        if (leave.employeeId !== currentEmployee.id) {
          throw new ActionError("본인의 휴가 기록만 접근할 수 있습니다.");
        }
      }
      break;
    }

    case "payroll": {
      const payroll = await prisma.payrollRecord.findUnique({
        where: { id: resourceId },
        include: { employee: true },
      });

      if (!payroll) {
        throw new ActionError("급여 기록을 찾을 수 없습니다.");
      }

      // 급여는 Admin과 본인만 조회 가능
      if (ctx.userRole === "manager" || ctx.userRole === "viewer") {
        if (payroll.employeeId !== currentEmployee.id) {
          throw new ActionError("본인의 급여 기록만 조회할 수 있습니다.");
        }
      }
      break;
    }
  }
}
