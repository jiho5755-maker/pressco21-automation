"use server";

// 정부지원사업 CRUD Server Actions (Phase 2)
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  authActionClient,
  managerActionClient,
  adminActionClient,
  ActionError,
} from "@/lib/safe-action";
import {
  checkFlexibleWorkEligibility,
  checkReplacementWorkerEligibility,
  checkParentalLeaveGrantEligibility,
  checkWorkSharingEligibility,
  checkInfraSupportEligibility,
  checkDuplicateApplication,
  // Phase 3-D: 출산육아 지원금 5가지
  checkMaternityLeavePayEligibility,
  checkSpouseMaternityPayEligibility,
  checkParentalLeavePayEligibility,
  checkShortenedWorkHoursPayEligibility,
  checkPregnancyReducedHoursEligibility,
} from "@/lib/subsidy-calculator";

// ── 지원금 신청 생성 스키마 ──
const createSubsidySchema = z.object({
  type: z.enum([
    // 기존 5가지 (Phase 2)
    "FLEXIBLE_WORK",
    "REPLACEMENT_WORKER",
    "PARENTAL_LEAVE_GRANT",
    "WORK_SHARING",
    "INFRA_SUPPORT",
    // 신규 5가지 (Phase 3-D)
    "MATERNITY_LEAVE_PAY",
    "SPOUSE_MATERNITY_PAY",
    "PARENTAL_LEAVE_PAY",
    "SHORTENED_WORK_HOURS_PAY",
    "PREGNANCY_REDUCED_HOURS",
  ]),
  year: z.number().int().min(2020).max(2099),
  month: z.number().int().min(1).max(12),
  employeeId: z.string(),

  // 유형별 조건부 필드 (기존 5가지)
  flexibleWorkCount: z.number().int().min(0).optional(),
  replacementEmployeeId: z.string().optional(),
  replacementStartDate: z.string().optional(), // ISO date
  replacementEndDate: z.string().optional(),
  childBirthDate: z.string().optional(),
  note: z.string().max(500).optional(),

  // Phase 3-D: 출산육아 지원금 조건부 필드
  maternityLeaveStartDate: z.string().optional(),
  maternityLeaveEndDate: z.string().optional(),
  parentalLeaveStartDate: z.string().optional(),
  parentalLeaveEndDate: z.string().optional(),
  shortenedHoursPerWeek: z.number().int().min(0).optional(),
});

export type CreateSubsidyInput = z.infer<typeof createSubsidySchema>;

/**
 * 1. 지원금 신청 생성
 * 권한: authActionClient (인증된 사용자)
 * 자격 자동 검증: subsidy-calculator 활용
 */
export const createSubsidyApplication = authActionClient
  .inputSchema(createSubsidySchema)
  .action(async ({ parsedInput, ctx }) => {
    // 1. 중복 신청 검증
    const isDuplicate = await checkDuplicateApplication(
      parsedInput.employeeId,
      parsedInput.type,
      parsedInput.year,
      parsedInput.month
    );

    if (isDuplicate) {
      throw new ActionError(
        "이미 해당 연월에 동일한 지원금을 신청했습니다."
      );
    }

    // 2. 직원 정보 조회
    const employee = await prisma.employee.findUnique({
      where: { id: parsedInput.employeeId },
      include: { department: true },
    });

    if (!employee) {
      throw new ActionError("직원을 찾을 수 없습니다.");
    }

    // 3. 유형별 자격 검증 및 금액 계산
    let eligibility: {
      eligible: boolean;
      reason?: string;
      calculatedAmount: number;
    };
    let replacementEmployee: { contractType: string; birthDate: Date | null; joinDate: Date } | null = null;

    switch (parsedInput.type) {
      case "FLEXIBLE_WORK":
        if (!parsedInput.flexibleWorkCount) {
          throw new ActionError("월 유연근무 사용 횟수를 입력해주세요.");
        }
        eligibility = checkFlexibleWorkEligibility(
          {
            workType: employee.workType,
            joinDate: employee.joinDate,
          },
          parsedInput.year,
          parsedInput.month,
          parsedInput.flexibleWorkCount
        );
        break;

      case "REPLACEMENT_WORKER":
        if (!parsedInput.replacementEmployeeId || !parsedInput.replacementStartDate) {
          throw new ActionError("대체인력 정보를 입력해주세요.");
        }
        replacementEmployee = await prisma.employee.findUnique({
          where: { id: parsedInput.replacementEmployeeId },
          select: { contractType: true, birthDate: true, joinDate: true },
        });
        if (!replacementEmployee) {
          throw new ActionError("대체인력을 찾을 수 없습니다.");
        }
        eligibility = checkReplacementWorkerEligibility(
          {
            status: employee.status,
            leaveType: employee.leaveType,
            leaveStartDate: employee.leaveStartDate,
          },
          replacementEmployee,
          new Date(parsedInput.replacementStartDate)
        );
        break;

      case "PARENTAL_LEAVE_GRANT":
        if (!parsedInput.childBirthDate) {
          throw new ActionError("자녀 출생일을 입력해주세요.");
        }
        eligibility = checkParentalLeaveGrantEligibility(
          {
            status: employee.status,
            leaveType: employee.leaveType,
            leaveStartDate: employee.leaveStartDate,
          },
          new Date(parsedInput.childBirthDate),
          parsedInput.year,
          parsedInput.month
        );
        break;

      case "WORK_SHARING":
        eligibility = checkWorkSharingEligibility({
          birthDate: employee.birthDate,
          weeklyWorkHours: employee.weeklyWorkHours,
        });
        break;

      case "INFRA_SUPPORT":
        // 30세 미만 직원 수 조회
        const totalEmployeesUnder30 = await prisma.employee.count({
          where: {
            status: "ACTIVE",
            birthDate: {
              gte: new Date(parsedInput.year - 30, 0, 1),
            },
          },
        });
        eligibility = checkInfraSupportEligibility(
          parsedInput.year,
          totalEmployeesUnder30
        );
        break;

      // Phase 3-D: 출산육아 지원금 5가지
      case "MATERNITY_LEAVE_PAY":
        if (
          !parsedInput.childBirthDate ||
          !parsedInput.maternityLeaveStartDate ||
          !parsedInput.maternityLeaveEndDate
        ) {
          throw new ActionError("출산휴가 정보를 모두 입력해주세요.");
        }
        eligibility = checkMaternityLeavePayEligibility(
          new Date(parsedInput.childBirthDate),
          new Date(parsedInput.maternityLeaveStartDate),
          new Date(parsedInput.maternityLeaveEndDate),
          employee.baseSalary
        );
        break;

      case "SPOUSE_MATERNITY_PAY":
        if (!parsedInput.childBirthDate) {
          throw new ActionError("자녀 출생일을 입력해주세요.");
        }
        eligibility = checkSpouseMaternityPayEligibility(
          new Date(parsedInput.childBirthDate),
          employee.baseSalary
        );
        break;

      case "PARENTAL_LEAVE_PAY":
        if (
          !parsedInput.childBirthDate ||
          !parsedInput.parentalLeaveStartDate ||
          !parsedInput.parentalLeaveEndDate
        ) {
          throw new ActionError("육아휴직 정보를 모두 입력해주세요.");
        }
        eligibility = checkParentalLeavePayEligibility(
          new Date(parsedInput.childBirthDate),
          new Date(parsedInput.parentalLeaveStartDate),
          new Date(parsedInput.parentalLeaveEndDate),
          employee.baseSalary
        );
        break;

      case "SHORTENED_WORK_HOURS_PAY":
        if (!parsedInput.childBirthDate || !parsedInput.shortenedHoursPerWeek) {
          throw new ActionError("육아기 근로시간 단축 정보를 입력해주세요.");
        }
        eligibility = checkShortenedWorkHoursPayEligibility(
          new Date(parsedInput.childBirthDate),
          parsedInput.shortenedHoursPerWeek
        );
        break;

      case "PREGNANCY_REDUCED_HOURS":
        if (!parsedInput.shortenedHoursPerWeek) {
          throw new ActionError("주당 단축 시간을 입력해주세요.");
        }
        eligibility = checkPregnancyReducedHoursEligibility(
          parsedInput.shortenedHoursPerWeek
        );
        break;
    }

    if (!eligibility.eligible) {
      throw new ActionError(eligibility.reason || "자격 요건을 충족하지 않습니다.");
    }

    // 4. DB 저장
    const application = await prisma.subsidyApplication.create({
      data: {
        type: parsedInput.type,
        year: parsedInput.year,
        month: parsedInput.month,
        employeeId: parsedInput.employeeId,
        requestedAmount: eligibility.calculatedAmount,
        // 기존 5가지 필드
        flexibleWorkCount: parsedInput.flexibleWorkCount || null,
        replacementEmployeeId: parsedInput.replacementEmployeeId || null,
        replacementStartDate: parsedInput.replacementStartDate
          ? new Date(parsedInput.replacementStartDate)
          : null,
        replacementEndDate: parsedInput.replacementEndDate
          ? new Date(parsedInput.replacementEndDate)
          : null,
        childBirthDate: parsedInput.childBirthDate
          ? new Date(parsedInput.childBirthDate)
          : null,
        // Phase 3-D: 출산육아 지원금 필드
        maternityLeaveStartDate: parsedInput.maternityLeaveStartDate
          ? new Date(parsedInput.maternityLeaveStartDate)
          : null,
        maternityLeaveEndDate: parsedInput.maternityLeaveEndDate
          ? new Date(parsedInput.maternityLeaveEndDate)
          : null,
        parentalLeaveStartDate: parsedInput.parentalLeaveStartDate
          ? new Date(parsedInput.parentalLeaveStartDate)
          : null,
        parentalLeaveEndDate: parsedInput.parentalLeaveEndDate
          ? new Date(parsedInput.parentalLeaveEndDate)
          : null,
        shortenedHoursPerWeek: parsedInput.shortenedHoursPerWeek || null,
        // 공통
        note: parsedInput.note || null,
        submitterId: ctx.userId,
        status: "PENDING",
      },
    });

    revalidatePath("/subsidies");
    revalidatePath("/dashboard");
    return { application };
  });

// ── 지원금 신청 수정 스키마 (PENDING 상태만) ──
const updateSubsidySchema = z.object({
  id: z.string(),
  flexibleWorkCount: z.number().int().min(0).optional(),
  replacementStartDate: z.string().optional(),
  replacementEndDate: z.string().optional(),
  childBirthDate: z.string().optional(),
  note: z.string().max(500).optional(),
});

/**
 * 2. 지원금 신청 수정 (PENDING 상태만)
 * 권한: Admin 또는 신청자 본인
 */
export const updateSubsidyApplication = authActionClient
  .inputSchema(updateSubsidySchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.subsidyApplication.findUnique({
      where: { id: parsedInput.id },
    });

    if (!existing) {
      throw new ActionError("지원금 신청을 찾을 수 없습니다.");
    }

    if (existing.status !== "PENDING") {
      throw new ActionError("대기 상태의 신청만 수정할 수 있습니다.");
    }

    // 권한 확인: Admin 또는 신청자 본인
    if (ctx.userRole !== "admin" && existing.submitterId !== ctx.userId) {
      throw new ActionError("수정 권한이 없습니다.");
    }

    const application = await prisma.subsidyApplication.update({
      where: { id: parsedInput.id },
      data: {
        flexibleWorkCount: parsedInput.flexibleWorkCount,
        replacementStartDate: parsedInput.replacementStartDate
          ? new Date(parsedInput.replacementStartDate)
          : undefined,
        replacementEndDate: parsedInput.replacementEndDate
          ? new Date(parsedInput.replacementEndDate)
          : undefined,
        childBirthDate: parsedInput.childBirthDate
          ? new Date(parsedInput.childBirthDate)
          : undefined,
        note: parsedInput.note,
      },
    });

    revalidatePath("/subsidies");
    return { application };
  });

/**
 * 3. 지원금 신청 삭제 (PENDING 상태만)
 * 권한: Admin 또는 신청자 본인
 */
export const deleteSubsidyApplication = authActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.subsidyApplication.findUnique({
      where: { id: parsedInput.id },
    });

    if (!existing) {
      throw new ActionError("지원금 신청을 찾을 수 없습니다.");
    }

    if (existing.status !== "PENDING") {
      throw new ActionError("대기 상태의 신청만 삭제할 수 있습니다.");
    }

    // 권한 확인: Admin 또는 신청자 본인
    if (ctx.userRole !== "admin" && existing.submitterId !== ctx.userId) {
      throw new ActionError("삭제 권한이 없습니다.");
    }

    await prisma.subsidyApplication.delete({
      where: { id: parsedInput.id },
    });

    revalidatePath("/subsidies");
    return { success: true };
  });

// ── 지원금 승인/반려 스키마 ──
const approveSubsidySchema = z.object({
  id: z.string(),
  action: z.enum(["APPROVED", "REJECTED"]),
  approvedAmount: z.number().int().min(0).optional(), // 승인 시 조정된 금액
  rejectReason: z.string().optional(),
});

/**
 * 4. 지원금 승인/반려
 * 권한: Manager 이상 (Manager는 자기 부서 직원만)
 * ⚠️ RBAC 로직: expense-actions.ts의 approveExpense 패턴 그대로 복사
 */
export const approveSubsidy = managerActionClient
  .inputSchema(approveSubsidySchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.subsidyApplication.findUnique({
      where: { id: parsedInput.id },
      include: { employee: true },
    });

    if (!existing) {
      throw new ActionError("지원금 신청을 찾을 수 없습니다.");
    }

    if (existing.status !== "PENDING") {
      throw new ActionError("이미 처리된 신청입니다.");
    }

    // Manager인 경우 부서 검증 (expense-actions.ts 패턴 재사용)
    if (ctx.userRole === "manager") {
      // 현재 사용자의 직원 정보 조회
      const currentEmployee = await prisma.employee.findUnique({
        where: { userId: ctx.userId },
      });

      if (!currentEmployee) {
        throw new ActionError("직원 정보를 찾을 수 없습니다.");
      }

      // 같은 부서인지 확인
      if (existing.employee.departmentId !== currentEmployee.departmentId) {
        throw new ActionError("다른 부서 직원의 지원금은 승인할 수 없습니다.");
      }
    }

    const application = await prisma.subsidyApplication.update({
      where: { id: parsedInput.id },
      data: {
        status: parsedInput.action,
        approverId: ctx.userId,
        approvedAt:
          parsedInput.action === "APPROVED" ? new Date() : undefined,
        approvedAmount:
          parsedInput.action === "APPROVED"
            ? parsedInput.approvedAmount || existing.requestedAmount
            : null,
        rejectReason: parsedInput.rejectReason || null,
      },
    });

    revalidatePath("/subsidies");
    revalidatePath("/dashboard");
    return { application };
  });

/**
 * 5. 지급 완료 처리
 * 권한: Admin만
 */
export const markSubsidyAsPaid = adminActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.subsidyApplication.findUnique({
      where: { id: parsedInput.id },
    });

    if (!existing) {
      throw new ActionError("지원금 신청을 찾을 수 없습니다.");
    }

    if (existing.status !== "APPROVED") {
      throw new ActionError("승인된 신청만 지급 처리할 수 있습니다.");
    }

    const application = await prisma.subsidyApplication.update({
      where: { id: parsedInput.id },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidBy: ctx.userId,
      },
    });

    revalidatePath("/subsidies");
    revalidatePath("/dashboard");
    return { application };
  });
