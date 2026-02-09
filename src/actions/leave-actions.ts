// 휴가 관리 Server Actions
"use server";

import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { authActionClient, ActionError } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import {
  validateMaternityLeave,
  validateSpouseMaternityLeave,
  getAnnualLeaveSummary,
  calculateWorkDays,
} from "@/lib/leave-calculator";

// ─────────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────────

const createLeaveSchema = z
  .object({
    employeeId: z.string(),
    type: z.enum([
      "ANNUAL",
      "MATERNITY",
      "PARENTAL",
      "SPOUSE_MATERNITY",
      "SICK",
      "PERSONAL",
      "COMPENSATORY",
    ]),
    startDate: z.string(), // ISO string
    endDate: z.string(),
    halfDayType: z.enum(["AM", "PM"]).optional(),
    reason: z.string().optional(),
    childBirthDate: z.string().optional(), // ISO string
    isMultiple: z.boolean().optional(), // 다태아 여부 (출산휴가)
  })
  .refine(
    (data) => {
      // 출산휴가/배우자출산휴가/육아휴직 시 자녀 출생일 필수
      if (
        ["MATERNITY", "SPOUSE_MATERNITY", "PARENTAL"].includes(data.type) &&
        !data.childBirthDate
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "출산휴가/배우자출산휴가/육아휴직 신청 시 자녀 출생일은 필수입니다.",
      path: ["childBirthDate"],
    }
  );

const approveLeaveSchema = z.object({
  id: z.string(),
});

const rejectLeaveSchema = z.object({
  id: z.string(),
  rejectedReason: z
    .string()
    .min(5, "반려 사유는 최소 5자 이상 입력해야 합니다."),
});

const deleteLeaveSchema = z.object({
  id: z.string(),
});

// ─────────────────────────────────────────────
// 휴가 신청
// ─────────────────────────────────────────────

export const createLeaveRequest = authActionClient
  .inputSchema(createLeaveSchema)
  .action(async ({ parsedInput, ctx }) => {
    const {
      employeeId,
      type,
      startDate,
      endDate,
      halfDayType,
      reason,
      childBirthDate,
      isMultiple = false,
    } = parsedInput;

    const start = new Date(startDate);
    const end = new Date(endDate);

    // 1. 날짜 유효성 검증
    if (start > end) {
      throw new ActionError("시작일은 종료일보다 이전이어야 합니다.");
    }

    // 2. 직원 조회
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: {
        leaveRecords: {
          where: {
            status: {
              in: ["PENDING", "APPROVED"],
            },
          },
        },
      },
    });

    if (!employee) {
      throw new ActionError("직원을 찾을 수 없습니다.");
    }

    // 3. 중복 휴가 검증
    const overlapping = employee.leaveRecords.find(
      (record) =>
        new Date(record.startDate) <= end && new Date(record.endDate) >= start
    );

    if (overlapping) {
      throw new ActionError(
        `이미 해당 기간에 휴가가 등록되어 있습니다 (${new Date(
          overlapping.startDate
        ).toLocaleDateString()} ~ ${new Date(
          overlapping.endDate
        ).toLocaleDateString()}).`
      );
    }

    // 4. 일수 계산
    let days: number;

    if (halfDayType) {
      // 반차
      days = 0.5;
    } else {
      // 주말 제외 근무일수
      days = calculateWorkDays(start, end);
    }

    // 5. 휴가 유형별 검증
    if (type === "ANNUAL") {
      // 연차 잔여일 검증
      const { remaining } = getAnnualLeaveSummary(
        employee.joinDate,
        employee.leaveRecords
      );

      if (days > remaining) {
        throw new ActionError(
          `연차 잔여일(${remaining}일)이 부족합니다 (신청: ${days}일).`
        );
      }
    } else if (type === "MATERNITY") {
      // 출산전후휴가 검증
      if (!childBirthDate) {
        throw new ActionError("출산휴가는 자녀 출생일을 입력해야 합니다.");
      }

      const validation = validateMaternityLeave(
        start,
        end,
        new Date(childBirthDate),
        isMultiple
      );

      if (!validation.isValid) {
        throw new ActionError(validation.error || "출산휴가 기간이 유효하지 않습니다.");
      }
    } else if (type === "SPOUSE_MATERNITY") {
      // 배우자 출산휴가 검증
      if (!childBirthDate) {
        throw new ActionError(
          "배우자 출산휴가는 자녀 출생일을 입력해야 합니다."
        );
      }

      const validation = validateSpouseMaternityLeave(
        start,
        new Date(childBirthDate)
      );

      if (!validation.isValid) {
        throw new ActionError(
          validation.error || "배우자 출산휴가 기간이 유효하지 않습니다."
        );
      }

      // 총 사용일수 20일 이하 검증
      const totalSpouseLeave = employee.leaveRecords
        .filter((r) => r.type === "SPOUSE_MATERNITY")
        .reduce((sum, r) => sum + r.days, 0);

      if (totalSpouseLeave + days > 20) {
        throw new ActionError(
          `배우자 출산휴가는 최대 20일입니다 (현재 사용: ${totalSpouseLeave}일, 신청: ${days}일).`
        );
      }
    } else if (type === "PARENTAL") {
      // 육아휴직 검증 (최대 18개월)
      if (!childBirthDate) {
        throw new ActionError("육아휴직은 자녀 출생일을 입력해야 합니다.");
      }

      const totalDays =
        Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) +
        1;
      const totalMonths = totalDays / 30; // 대략적 계산

      if (totalMonths > 18) {
        throw new ActionError("육아휴직은 최대 18개월입니다.");
      }
    }

    // 6. LeaveRecord 생성
    const leaveRecord = await prisma.leaveRecord.create({
      data: {
        employeeId,
        type,
        startDate: start,
        endDate: end,
        days,
        halfDayType,
        status: "PENDING",
        reason,
        childBirthDate: childBirthDate ? new Date(childBirthDate) : null,
      },
    });

    // 7. 경로 재검증
    revalidatePath("/leaves");
    revalidatePath("/employees");
    revalidatePath(`/employees/${employeeId}`);

    return { success: true, data: leaveRecord };
  });

// ─────────────────────────────────────────────
// 휴가 승인
// ─────────────────────────────────────────────

export const approveLeaveRequest = authActionClient
  .inputSchema(approveLeaveSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    // 권한 확인 (admin/manager만)
    if (!["admin", "manager"].includes(ctx.userRole)) {
      throw new ActionError("휴가 승인 권한이 없습니다.");
    }

    // 1. 기존 기록 조회
    const existing = await prisma.leaveRecord.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existing) {
      throw new ActionError("휴가 기록을 찾을 수 없습니다.");
    }

    if (existing.status !== "PENDING") {
      throw new ActionError("대기 중인 신청만 승인할 수 있습니다.");
    }

    // 2. 법정 휴가는 자동 승인 (반려 불가)
    // 출산/배우자출산/육아는 사업주가 거부할 수 없음

    // 3. 트랜잭션 처리
    const result = await prisma.$transaction(async (tx) => {
      // LeaveRecord 승인
      const updated = await tx.leaveRecord.update({
        where: { id },
        data: {
          status: "APPROVED",
          approvedBy: ctx.userId,
          approvedAt: new Date(),
        },
      });

      // Employee 상태 갱신 (출산/육아휴직만)
      if (
        ["MATERNITY", "PARENTAL", "SPOUSE_MATERNITY"].includes(existing.type)
      ) {
        await tx.employee.update({
          where: { id: existing.employeeId },
          data: {
            status: "ON_LEAVE",
            leaveType: existing.type,
            leaveStartDate: existing.startDate,
            leaveEndDate: existing.endDate,
          },
        });
      }

      return updated;
    });

    // 4. 경로 재검증
    revalidatePath("/leaves");
    revalidatePath("/employees");
    revalidatePath(`/employees/${existing.employeeId}`);

    return { success: true, data: result };
  });

// ─────────────────────────────────────────────
// 휴가 반려
// ─────────────────────────────────────────────

export const rejectLeaveRequest = authActionClient
  .inputSchema(rejectLeaveSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, rejectedReason } = parsedInput;

    // 권한 확인
    if (!["admin", "manager"].includes(ctx.userRole)) {
      throw new ActionError("휴가 반려 권한이 없습니다.");
    }

    // 1. 기존 기록 조회
    const existing = await prisma.leaveRecord.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existing) {
      throw new ActionError("휴가 기록을 찾을 수 없습니다.");
    }

    if (existing.status !== "PENDING") {
      throw new ActionError("대기 중인 신청만 반려할 수 있습니다.");
    }

    // 2. 법정 휴가 반려 차단
    if (["MATERNITY", "PARENTAL", "SPOUSE_MATERNITY"].includes(existing.type)) {
      throw new ActionError(
        "출산휴가/육아휴직/배우자출산휴가는 법정 의무 휴가로 반려할 수 없습니다. 시기 변경이 필요한 경우 직원과 협의하세요."
      );
    }

    // 3. 반려 처리
    const updated = await prisma.leaveRecord.update({
      where: { id },
      data: {
        status: "REJECTED",
        approvedBy: ctx.userId,
        approvedAt: new Date(),
        rejectedReason,
      },
    });

    // 4. 경로 재검증
    revalidatePath("/leaves");
    revalidatePath("/employees");
    revalidatePath(`/employees/${existing.employeeId}`);

    return { success: true, data: updated };
  });

// ─────────────────────────────────────────────
// 휴가 삭제
// ─────────────────────────────────────────────

export const deleteLeaveRecord = authActionClient
  .inputSchema(deleteLeaveSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id } = parsedInput;

    // 권한 확인
    if (!["admin", "manager"].includes(ctx.userRole)) {
      throw new ActionError("휴가 삭제 권한이 없습니다.");
    }

    // 1. 기존 기록 조회
    const existing = await prisma.leaveRecord.findUnique({
      where: { id },
      include: { employee: true },
    });

    if (!existing) {
      throw new ActionError("휴가 기록을 찾을 수 없습니다.");
    }

    // 2. 승인된 휴가는 삭제 불가 (취소 기능 별도 구현 필요)
    if (existing.status === "APPROVED") {
      throw new ActionError(
        "승인된 휴가는 삭제할 수 없습니다. 취소 기능을 이용하세요."
      );
    }

    // 3. 삭제 처리
    await prisma.leaveRecord.delete({
      where: { id },
    });

    // 4. 경로 재검증
    revalidatePath("/leaves");
    revalidatePath("/employees");
    revalidatePath(`/employees/${existing.employeeId}`);

    return { success: true };
  });
