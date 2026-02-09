"use server";

// 직원 CRUD Server Actions
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authActionClient, ActionError } from "@/lib/safe-action";
import { POSITIONS } from "@/lib/constants";

// ── 직원 추가 스키마 ──
const createEmployeeSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력해주세요."),
  departmentId: z.string().min(1, "부서를 선택해주세요."),
  position: z.enum(POSITIONS, { error: "직급을 선택해주세요." }),
  joinDate: z.string().min(1, "입사일을 입력해주세요."),
  email: z.email("올바른 이메일 형식이 아닙니다.").optional().or(z.literal("")),
  phone: z.string().optional(),
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
