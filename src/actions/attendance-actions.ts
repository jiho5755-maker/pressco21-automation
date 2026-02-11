"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import {
  authActionClient,
  managerActionClient,
  adminActionClient,
  ActionError,
} from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { requireDataOwnership } from "@/lib/rbac-helpers";
import {
  calculateWorkMinutes,
  calculateOvertime,
  calculateNightWork,
  validateWeeklyWorkHours,
} from "@/lib/attendance-calculator";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addHours,
} from "date-fns";

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

const createAttendanceSchema = z.object({
  employeeId: z.string().min(1, "직원을 선택해주세요"),
  date: z.coerce.date(),
  clockIn: z.string().regex(/^\d{2}:\d{2}$/, "출근 시간 형식이 올바르지 않습니다"),
  clockOut: z.string().regex(/^\d{2}:\d{2}$/, "퇴근 시간 형식이 올바르지 않습니다"),
  breakMinutes: z.number().min(0).default(60),
  workType: z
    .enum(["OFFICE", "REMOTE", "FLEXIBLE_HOURS", "HOLIDAY", "LEAVE"])
    .default("OFFICE"),
  note: z.string().optional(),
});

const updateAttendanceSchema = z.object({
  id: z.string(),
  employeeId: z.string().min(1),
  date: z.coerce.date(),
  clockIn: z.string().regex(/^\d{2}:\d{2}$/),
  clockOut: z.string().regex(/^\d{2}:\d{2}$/),
  breakMinutes: z.number().min(0).default(60),
  workType: z
    .enum(["OFFICE", "REMOTE", "FLEXIBLE_HOURS", "HOLIDAY", "LEAVE"])
    .default("OFFICE"),
  note: z.string().optional(),
});

const confirmAttendanceSchema = z.object({
  ids: z.array(z.string()).min(1, "확정할 기록을 선택해주세요"),
});

const deleteAttendanceSchema = z.object({
  id: z.string(),
});

// ─────────────────────────────────────────────
// Server Actions
// ─────────────────────────────────────────────

/**
 * 출퇴근 기록 생성
 * 권한: 본인 기록만 생성 가능
 */
export const createAttendanceRecord = authActionClient
  .inputSchema(createAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { employeeId, date, clockIn, clockOut, breakMinutes, workType, note } =
      parsedInput;

    // 권한 검증: 본인 기록만 생성 가능 (Admin은 제외)
    if (ctx.userRole !== "admin") {
      await requireDataOwnership("employee", employeeId, ctx);
    }

    // 1. 중복 체크 (동일 직원 + 동일 날짜)
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await prisma.attendanceRecord.findFirst({
      where: {
        employeeId,
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
    });

    if (existing) {
      throw new ActionError("해당 날짜의 근태 기록이 이미 존재합니다.");
    }

    // 2. 근무시간 계산
    const workMinutes = calculateWorkMinutes(clockIn, clockOut, breakMinutes);
    const overtime = calculateOvertime(workMinutes);
    const nightWork = calculateNightWork(clockIn, clockOut);

    // 3. 주52시간 검증
    const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // 월요일 시작
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    const weekRecords = await prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: weekStart, lte: weekEnd },
      },
      select: { workMinutes: true },
    });

    const validation = validateWeeklyWorkHours([
      ...weekRecords,
      { workMinutes },
    ]);

    if (!validation.isValid) {
      throw new ActionError(
        `주52시간을 초과합니다. (현재 주차 총합: ${validation.totalHours}시간)`
      );
    }

    // 4. DB 저장
    const record = await prisma.attendanceRecord.create({
      data: {
        employeeId,
        date,
        clockIn: new Date(`2000-01-01T${clockIn}:00`),
        clockOut: new Date(`2000-01-01T${clockOut}:00`),
        workType,
        workMinutes,
        overtime,
        nightWork,
        note,
        isConfirmed: false,
      },
    });

    revalidatePath("/attendance");

    return {
      success: true,
      data: record,
    };
  });

/**
 * 출퇴근 기록 수정
 * 권한: 본인 기록만 수정 가능 (미확정 기록만)
 */
export const updateAttendanceRecord = authActionClient
  .inputSchema(updateAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, employeeId, date, clockIn, clockOut, breakMinutes, workType, note } =
      parsedInput;

    // 1. 기존 기록 조회
    const existing = await prisma.attendanceRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ActionError("해당 기록을 찾을 수 없습니다.");
    }

    // 권한 검증: 본인 기록만 수정 가능 (Admin은 제외)
    if (ctx.userRole !== "admin") {
      await requireDataOwnership("attendance", id, ctx);
    }

    // 2. 확정된 기록 수정 방지
    if (existing.isConfirmed) {
      throw new ActionError(
        "확정된 기록은 수정할 수 없습니다. 관리자에게 문의하세요."
      );
    }

    // 3. 근무시간 재계산
    const workMinutes = calculateWorkMinutes(clockIn, clockOut, breakMinutes);
    const overtime = calculateOvertime(workMinutes);
    const nightWork = calculateNightWork(clockIn, clockOut);

    // 4. 주52시간 검증 (수정하는 기록 제외)
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

    const weekRecords = await prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: { gte: weekStart, lte: weekEnd },
        id: { not: id }, // 수정하는 기록 제외
      },
      select: { workMinutes: true },
    });

    const validation = validateWeeklyWorkHours([
      ...weekRecords,
      { workMinutes },
    ]);

    if (!validation.isValid) {
      throw new ActionError(
        `주52시간을 초과합니다. (현재 주차 총합: ${validation.totalHours}시간)`
      );
    }

    // 5. DB 업데이트
    const record = await prisma.attendanceRecord.update({
      where: { id },
      data: {
        employeeId,
        date,
        clockIn: new Date(`2000-01-01T${clockIn}:00`),
        clockOut: new Date(`2000-01-01T${clockOut}:00`),
        workType,
        workMinutes,
        overtime,
        nightWork,
        note,
      },
    });

    revalidatePath("/attendance");

    return {
      success: true,
      data: record,
    };
  });

/**
 * 출퇴근 기록 삭제
 * 권한: 본인 기록만 삭제 가능 (미확정 기록만)
 */
export const deleteAttendanceRecord = authActionClient
  .inputSchema(deleteAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    // 1. 기존 기록 조회
    const existing = await prisma.attendanceRecord.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ActionError("해당 기록을 찾을 수 없습니다.");
    }

    // 권한 검증: 본인 기록만 삭제 가능 (Admin은 제외)
    if (ctx.userRole !== "admin") {
      await requireDataOwnership("attendance", id, ctx);
    }

    // 2. 확정된 기록 삭제 방지
    if (existing.isConfirmed) {
      throw new ActionError(
        "확정된 기록은 삭제할 수 없습니다. 관리자에게 문의하세요."
      );
    }

    // 3. DB 삭제
    await prisma.attendanceRecord.delete({
      where: { id },
    });

    revalidatePath("/attendance");

    return {
      success: true,
    };
  });

/**
 * 근태 기록 확정 (일괄)
 * 권한: Admin/Manager (Manager는 자기 부서만)
 */
export const confirmAttendanceRecords = managerActionClient
  .inputSchema(confirmAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { ids } = parsedInput;

    // Manager인 경우 부서 검증
    if (ctx.userRole === "manager") {
      // 현재 사용자의 직원 정보 조회
      const currentEmployee = await prisma.employee.findUnique({
        where: { userId: ctx.userId },
      });

      if (!currentEmployee) {
        throw new ActionError("직원 정보를 찾을 수 없습니다.");
      }

      // 확정하려는 기록들의 직원 조회
      const records = await prisma.attendanceRecord.findMany({
        where: { id: { in: ids } },
        include: { employee: true },
      });

      // 모두 자기 부서 직원인지 확인
      const invalidRecords = records.filter(
        (r) => r.employee.departmentId !== currentEmployee.departmentId
      );

      if (invalidRecords.length > 0) {
        throw new ActionError(
          "다른 부서 직원의 근태 기록은 확정할 수 없습니다."
        );
      }
    }

    // 일괄 확정
    const result = await prisma.attendanceRecord.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        isConfirmed: true,
      },
    });

    revalidatePath("/attendance");

    return {
      success: true,
      count: result.count,
    };
  });

/**
 * 근태 기록 확정 해제
 * 권한: Admin/Manager (Manager는 자기 부서만)
 */
export const unconfirmAttendanceRecord = managerActionClient
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    // Manager인 경우 부서 검증
    if (ctx.userRole === "manager") {
      await requireDataOwnership("attendance", id, ctx);
    }

    await prisma.attendanceRecord.update({
      where: { id },
      data: { isConfirmed: false },
    });

    revalidatePath("/attendance");

    return { success: true };
  });

// ─────────────────────────────────────────────
// Phase 3-D: 근태 로그 자동 생성 (정부지원금 증빙용)
// ─────────────────────────────────────────────

/**
 * 근태 로그 일괄 생성 (Admin 전용)
 * 목적: 정부지원금 신청 시 필요한 한 달치 근태 기록 자동 생성
 *
 * 조건:
 * - Admin 권한 필수
 * - 주말 제외 (월~금 근무)
 * - 근무 패턴: 표준/유연/단축 (임신기/육아기)
 */
const bulkGenerateAttendanceSchema = z.object({
  employeeId: z.string().min(1, "직원을 선택해주세요"),
  year: z.number().int().min(2020).max(2030),
  month: z.number().int().min(1).max(12),
  workPattern: z.enum(["STANDARD", "FLEXIBLE", "SHORTENED"]), // 근무 패턴
  shortenedHoursPerWeek: z.number().int().min(0).max(15).optional(), // 단축 시간 (임신기/육아기)
});

export const bulkGenerateAttendance = adminActionClient
  .inputSchema(bulkGenerateAttendanceSchema)
  .action(async ({ parsedInput }) => {
    const { employeeId, year, month, workPattern, shortenedHoursPerWeek } =
      parsedInput;

    // 1. 직원 정보 조회 (근무 스케줄 포함)
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        workSchedules: {
          where: {
            effectiveFrom: { lte: endOfMonth(new Date(year, month - 1)) },
            OR: [
              { effectiveTo: null },
              { effectiveTo: { gte: startOfMonth(new Date(year, month - 1)) } },
            ],
          },
          orderBy: { effectiveFrom: "desc" },
          take: 1,
        },
      },
    });

    if (!employee) {
      throw new ActionError("직원을 찾을 수 없습니다.");
    }

    // 2. 월별 근무일 계산 (주말 제외)
    const monthStart = startOfMonth(new Date(year, month - 1));
    const monthEnd = endOfMonth(new Date(year, month - 1));
    const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const workDays = allDays.filter((day) => {
      const dayOfWeek = getDay(day); // 0=일, 1=월, ..., 6=토
      return dayOfWeek !== 0 && dayOfWeek !== 6; // 주말 제외
    });

    // 3. 근무 패턴별 시간 계산
    let dailyWorkHours = 8; // 기본 8시간
    if (workPattern === "SHORTENED" && shortenedHoursPerWeek) {
      // 임신기/육아기 단축근로: 주당 단축 시간을 일일로 환산
      const weeklyShortened = shortenedHoursPerWeek / 5; // 주 5일 근무 기준
      dailyWorkHours = 8 - weeklyShortened;
    }

    // 4. 근태 기록 생성
    const records = [];
    for (const day of workDays) {
      const clockInDate = new Date(day);
      clockInDate.setHours(9, 0, 0, 0); // 오전 9시 출근

      const clockOutDate = addHours(clockInDate, dailyWorkHours + 1); // 근무시간 + 점심시간 1시간

      // 시간 문자열로 변환 (HH:mm 형식)
      const clockInStr = clockInDate.toTimeString().slice(0, 5);
      const clockOutStr = clockOutDate.toTimeString().slice(0, 5);

      // 근무시간 계산
      const workMinutes = calculateWorkMinutes(clockInStr, clockOutStr, 60);

      const overtime = calculateOvertime(
        workMinutes,
        dailyWorkHours * 60 // 분 단위로 변환
      );

      const nightWork = calculateNightWork(clockInStr, clockOutStr);

      const record = {
        employeeId,
        date: day,
        clockIn: clockInDate,
        clockOut: clockOutDate,
        workType:
          (workPattern === "FLEXIBLE" ? "FLEXIBLE_HOURS" : "OFFICE") as
            | "OFFICE"
            | "REMOTE"
            | "FLEXIBLE_HOURS"
            | "HOLIDAY"
            | "LEAVE",
        workMinutes,
        overtime,
        nightWork,
        isConfirmed: false, // 관리자가 수동 확정 필요
        note: `자동 생성 (${workPattern === "STANDARD" ? "표준근무" : workPattern === "FLEXIBLE" ? "유연근무" : "단축근무"})`,
      };

      records.push(record);
    }

    // 5. DB 저장 (일괄 생성)
    // 중복 방지: 기존 기록 조회 후 필터링
    const existingRecords = await prisma.attendanceRecord.findMany({
      where: {
        employeeId,
        date: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      select: { date: true },
    });

    const existingDates = new Set(
      existingRecords.map((r) => r.date.toISOString().split("T")[0])
    );

    const newRecords = records.filter(
      (r) => !existingDates.has(r.date.toISOString().split("T")[0])
    );

    if (newRecords.length === 0) {
      return {
        success: false,
        count: 0,
        message: "이미 모든 근태 기록이 존재합니다.",
      };
    }

    await prisma.attendanceRecord.createMany({
      data: newRecords,
    });

    revalidatePath("/attendance");
    return {
      success: true,
      count: newRecords.length,
      message: `${year}년 ${month}월 근태 기록 ${newRecords.length}건 생성 완료 (확정 필요)`,
    };
  });
