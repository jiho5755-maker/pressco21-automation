"use server";

// 직원 CRUD Server Actions
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authActionClient, ActionError } from "@/lib/safe-action";
import { POSITIONS, FIXED_OT_LIMITS_2026, LABOR_STANDARDS_2026 } from "@/lib/constants";
import { validateMinimumWage } from "@/lib/validations/salary";

// ── 직원 추가 스키마 ──
const createEmployeeSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력해주세요."),
  departmentId: z.string().min(1, "부서를 선택해주세요."),
  position: z.enum(POSITIONS, { error: "직급을 선택해주세요." }),
  joinDate: z.string().min(1, "입사일을 입력해주세요."),
  email: z.email("올바른 이메일 형식이 아닙니다.").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional().or(z.literal("")),
  childrenUnder20: z.coerce.number().int().min(0).max(20).default(0),
  contractType: z
    .enum(["REGULAR", "CONTRACT", "PARTTIME", "REPLACEMENT"])
    .default("REGULAR"),
});

export const createEmployee = authActionClient
  .inputSchema(createEmployeeSchema)
  .action(async ({ parsedInput }) => {
    // 사번 자동생성: 마지막 사번 + 1
    const lastEmployee = await prisma.employee.findFirst({
      orderBy: { employeeNo: "desc" },
      select: { employeeNo: true },
    });
    const lastNo = lastEmployee
      ? parseInt(lastEmployee.employeeNo.replace("EMP", ""), 10)
      : 0;
    const employeeNo = `EMP${String(lastNo + 1).padStart(3, "0")}`;

    const employee = await prisma.employee.create({
      data: {
        employeeNo,
        name: parsedInput.name,
        departmentId: parsedInput.departmentId,
        position: parsedInput.position,
        joinDate: new Date(parsedInput.joinDate),
        email: parsedInput.email || null,
        phone: parsedInput.phone || null,
        address: parsedInput.address || null,
        childrenUnder20: parsedInput.childrenUnder20 || 0,
        contractType: parsedInput.contractType,
      },
    });

    revalidatePath("/employees");
    revalidatePath("/dashboard");
    return { employee };
  });

// ── 직원 수정 스키마 ──
const updateEmployeeSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "이름은 2자 이상 입력해주세요.").optional(),
  departmentId: z.string().optional(),
  position: z.enum(POSITIONS).optional(),
  email: z.email().optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional().or(z.literal("")),
  childrenUnder20: z.coerce.number().int().min(0).max(20).optional(),
  contractType: z
    .enum(["REGULAR", "CONTRACT", "PARTTIME", "REPLACEMENT"])
    .optional(),
  status: z.enum(["ACTIVE", "ON_LEAVE", "RESIGNED"]).optional(),
});

export const updateEmployee = authActionClient
  .inputSchema(updateEmployeeSchema)
  .action(async ({ parsedInput: { id, ...data } }) => {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) throw new ActionError("직원을 찾을 수 없습니다.");

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        email: data.email === "" ? null : data.email,
        address: data.address === "" ? null : data.address,
      },
    });

    revalidatePath("/employees");
    revalidatePath("/dashboard");
    return { employee };
  });

// ── 일괄 유연근무 설정 변경 ──
const bulkUpdateWorkTypeSchema = z.object({
  employeeIds: z.array(z.string()).min(1, "직원을 선택해주세요."),
  workType: z.enum(["OFFICE", "FLEXIBLE_HOURS", "REMOTE", "HYBRID"]),
  flexStartTime: z.string().optional(),
  flexEndTime: z.string().optional(),
  remoteWorkDays: z
    .array(z.enum(["MON", "TUE", "WED", "THU", "FRI"]))
    .optional(),
});

export const bulkUpdateWorkType = authActionClient
  .inputSchema(bulkUpdateWorkTypeSchema)
  .action(async ({ parsedInput }) => {
    const {
      employeeIds,
      workType,
      flexStartTime,
      flexEndTime,
      remoteWorkDays,
    } = parsedInput;

    // 선택된 직원들의 유연근무 설정 일괄 변경
    for (const employeeId of employeeIds) {
      await prisma.employee.update({
        where: { id: employeeId },
        data: {
          workType,
          flexStartTime: flexStartTime || null,
          flexEndTime: flexEndTime || null,
          remoteWorkDays: remoteWorkDays
            ? JSON.stringify(remoteWorkDays)
            : null,
        },
      });
    }

    revalidatePath("/employees");
    return { updatedCount: employeeIds.length };
  });

// ── 급여/보험 정보 수정 ──
const updateEmployeeSalarySchema = z
  .object({
    id: z.string(),
    salaryType: z.enum(["MONTHLY", "HOURLY"]),

    // 급여 구성
    baseSalary: z.number().min(0, "기본급은 0 이상이어야 합니다."),
    mealAllowance: z.number().min(0).default(0),
    transportAllowance: z.number().min(0).default(0),
    positionAllowance: z.number().min(0).default(0),

    // 비과세 여부
    taxFreeMeal: z.boolean().default(true),
    taxFreeTransport: z.boolean().default(true),

    // 은행 정보
    bankName: z.string().optional().or(z.literal("")),
    bankAccount: z.string().optional().or(z.literal("")),

    // 4대보험
    nationalPension: z.boolean(),
    healthInsurance: z.boolean(),
    employmentInsurance: z.boolean(),
    industrialAccident: z.boolean(),
    dependents: z.number().min(0).default(1),
    childrenUnder20: z.coerce.number().int().min(0).max(20).default(0),

    // 고정OT (포괄임금제)
    useFixedOT: z.boolean().default(false),
    fixedOTHours: z.number().min(0).max(52).default(0),
    fixedOTAmount: z.number().min(0).default(0),
    fixedNightWorkHours: z.number().min(0).default(0),
    fixedNightWorkAmount: z.number().min(0).default(0),
    fixedHolidayWorkHours: z.number().min(0).default(0),
    fixedHolidayWorkAmount: z.number().min(0).default(0),
    fixedOTAgreementConfirmed: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    // 최저임금 검증 (모든 수당 포함, 비과세 초과분 반영)
    const validation = validateMinimumWage(
      data.baseSalary,
      data.mealAllowance,
      data.transportAllowance,
      data.positionAllowance,
      data.taxFreeMeal,
      data.taxFreeTransport,
      data.salaryType
    );

    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.message || "최저임금 미달",
        path: ["baseSalary"],
      });
    }

    // 비과세 한도 경고 (식대 20만원, 교통비 20만원 초과 시)
    if (data.taxFreeMeal && data.mealAllowance > 200000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "식대 비과세 한도(20만원)를 초과했습니다. 초과분은 과세됩니다.",
        path: ["mealAllowance"],
      });
    }

    if (data.taxFreeTransport && data.transportAllowance > 200000) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "교통비 비과세 한도(20만원)를 초과했습니다. 초과분은 과세됩니다.",
        path: ["transportAllowance"],
      });
    }

    // 고정OT 검증
    if (data.useFixedOT) {
      // 서면 합의 확인 필수
      if (!data.fixedOTAgreementConfirmed) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "포괄임금제 적용 시 서면 합의 확인이 필수입니다.",
          path: ["fixedOTAgreementConfirmed"],
        });
      }

      // 필수값 검증
      if (!data.fixedOTHours || data.fixedOTHours <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "포괄임금제 사용 시 고정 연장근로 시간을 입력해주세요.",
          path: ["fixedOTHours"],
        });
      }

      if (!data.fixedOTAmount || data.fixedOTAmount <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "포괄임금제 사용 시 고정 연장근로 수당을 입력해주세요.",
          path: ["fixedOTAmount"],
        });
      }

      // 월 52시간 한도 검증
      if (data.fixedOTHours && data.fixedOTHours > FIXED_OT_LIMITS_2026.maxMonthlyOTHours) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `월 ${FIXED_OT_LIMITS_2026.maxMonthlyOTHours}시간을 초과할 수 없습니다.`,
          path: ["fixedOTHours"],
        });
      }

      // 법정 최소 금액 검증 (통상시급 × 1.5 × 시간)
      if (data.fixedOTHours && data.fixedOTAmount) {
        const hourlyRate = Math.round(
          data.baseSalary / LABOR_STANDARDS_2026.minimumWage.standardMonthlyHours
        );
        const minimumAmount = Math.ceil(hourlyRate * 1.5 * data.fixedOTHours);

        if (data.fixedOTAmount < minimumAmount) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `법정 최소 금액(${minimumAmount.toLocaleString()}원)보다 낮습니다. (통상시급 ${hourlyRate.toLocaleString()}원 × 1.5 × ${data.fixedOTHours}시간)`,
            path: ["fixedOTAmount"],
          });
        }
      }

      // 중복 가산 경고 (연장 야간근로는 2.0배이므로 한 곳에만 입력)
      if (
        data.fixedOTHours &&
        data.fixedOTHours > 0 &&
        data.fixedNightWorkHours &&
        data.fixedNightWorkHours > 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "연장 야간근로는 2.0배 가산(연장 1.5 + 야간 0.5)입니다. 연장근로 시간에만 입력하고 야간근로는 0으로 설정하세요.",
          path: ["fixedNightWorkHours"],
        });
      }
    }
  });

export const updateEmployeeSalary = authActionClient
  .inputSchema(updateEmployeeSalarySchema)
  .action(async ({ parsedInput: { id, ...data } }) => {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) throw new ActionError("직원을 찾을 수 없습니다.");

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...data,
        bankName: data.bankName === "" ? null : data.bankName,
        bankAccount: data.bankAccount === "" ? null : data.bankAccount,
        // 고정OT: useFixedOT가 false면 모두 0으로 초기화
        useFixedOT: data.useFixedOT,
        fixedOTHours: data.useFixedOT ? data.fixedOTHours : 0,
        fixedOTAmount: data.useFixedOT ? data.fixedOTAmount : 0,
        fixedNightWorkHours: data.useFixedOT ? data.fixedNightWorkHours : 0,
        fixedNightWorkAmount: data.useFixedOT ? data.fixedNightWorkAmount : 0,
        fixedHolidayWorkHours: data.useFixedOT ? data.fixedHolidayWorkHours : 0,
        fixedHolidayWorkAmount: data.useFixedOT ? data.fixedHolidayWorkAmount : 0,
      },
    });

    revalidatePath(`/employees/${id}`);
    revalidatePath("/employees");
    return { employee };
  });

// ── 근무 정보 수정 ──
const updateEmployeeWorkSchema = z.object({
  id: z.string(),
  workType: z.enum(["OFFICE", "FLEXIBLE_HOURS", "REMOTE", "HYBRID"]),
  weeklyWorkHours: z.number().min(1).max(52),
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm 형식으로 입력해주세요."),
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm 형식으로 입력해주세요."),
  breakMinutes: z.number().min(0),
  flexStartTime: z.string().optional().or(z.literal("")),
  flexEndTime: z.string().optional().or(z.literal("")),
  remoteWorkDays: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI"])).optional(),
});

export const updateEmployeeWork = authActionClient
  .inputSchema(updateEmployeeWorkSchema)
  .action(async ({ parsedInput: { id, ...data } }) => {
    const existing = await prisma.employee.findUnique({ where: { id } });
    if (!existing) throw new ActionError("직원을 찾을 수 없습니다.");

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        workType: data.workType,
        weeklyWorkHours: data.weeklyWorkHours,
        workStartTime: data.workStartTime,
        workEndTime: data.workEndTime,
        breakMinutes: data.breakMinutes,
        flexStartTime: data.flexStartTime || null,
        flexEndTime: data.flexEndTime || null,
        remoteWorkDays: data.remoteWorkDays
          ? JSON.stringify(data.remoteWorkDays)
          : null,
      },
    });

    revalidatePath(`/employees/${id}`);
    revalidatePath("/employees");
    return { employee };
  });
