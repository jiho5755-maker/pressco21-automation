"use server";

// 경비 CRUD Server Actions
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  authActionClient,
  managerActionClient,
  ActionError,
} from "@/lib/safe-action";
import { EXPENSE_CATEGORIES } from "@/lib/constants";

// ── 경비 신청 스키마 ──
const createExpenseSchema = z.object({
  title: z
    .string()
    .min(2, "항목명은 2자 이상 입력해주세요.")
    .max(50, "항목명은 50자 이하로 입력해주세요."),
  amount: z
    .number({ error: "금액을 입력해주세요." })
    .positive("금액은 0보다 커야 합니다.")
    .max(10_000_000, "금액은 1천만원 이하로 입력해주세요."),
  category: z.enum(EXPENSE_CATEGORIES, {
    error: "카테고리를 선택해주세요.",
  }),
  date: z.string().min(1, "날짜를 선택해주세요."),
  description: z
    .string()
    .max(500, "상세 내역은 500자 이하로 입력해주세요.")
    .optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const createExpense = authActionClient
  .inputSchema(createExpenseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const expense = await prisma.expense.create({
      data: {
        title: parsedInput.title,
        amount: parsedInput.amount,
        category: parsedInput.category,
        date: new Date(parsedInput.date),
        description: parsedInput.description || null,
        submitterId: ctx.userId,
        status: "PENDING",
      },
    });

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { expense };
  });

// ── 경비 승인/반려 스키마 ──
const approveExpenseSchema = z.object({
  id: z.string(),
  action: z.enum(["APPROVED", "REJECTED"]),
  rejectReason: z.string().optional(),
});

/**
 * 경비 승인/반려
 * 권한: Admin/Manager (Manager는 자기 부서 직원 경비만)
 */
export const approveExpense = managerActionClient
  .inputSchema(approveExpenseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.expense.findUnique({
      where: { id: parsedInput.id },
      include: { employee: true },
    });
    if (!existing) throw new ActionError("경비를 찾을 수 없습니다.");
    if (existing.status !== "PENDING") {
      throw new ActionError("이미 처리된 경비입니다.");
    }

    // Manager인 경우 부서 검증
    if (ctx.userRole === "manager") {
      // 직원이 연결되지 않은 경비는 Admin만 승인 가능
      if (!existing.employeeId) {
        throw new ActionError("직원이 연결되지 않은 경비는 관리자만 승인할 수 있습니다.");
      }

      // 현재 사용자의 직원 정보 조회
      const currentEmployee = await prisma.employee.findUnique({
        where: { userId: ctx.userId },
      });

      if (!currentEmployee) {
        throw new ActionError("직원 정보를 찾을 수 없습니다.");
      }

      // 같은 부서인지 확인
      if (existing.employee?.departmentId !== currentEmployee.departmentId) {
        throw new ActionError("다른 부서 직원의 경비는 승인할 수 없습니다.");
      }
    }

    const expense = await prisma.expense.update({
      where: { id: parsedInput.id },
      data: {
        status: parsedInput.action,
        approverId: ctx.userId,
        approvedAt:
          parsedInput.action === "APPROVED" ? new Date() : undefined,
        rejectReason: parsedInput.rejectReason || null,
      },
    });

    // 알림 생성 (비동기, 오류 무시)
    if (parsedInput.action === "APPROVED") {
      import("@/lib/notification-helper")
        .then(({ notifyExpenseApproved }) => notifyExpenseApproved(expense.id))
        .catch((error) => {
          console.error("[approveExpense] 승인 알림 생성 실패", {
            expenseId: expense.id,
            error,
          });
        });
    } else if (parsedInput.action === "REJECTED") {
      import("@/lib/notification-helper")
        .then(({ notifyExpenseRejected }) =>
          notifyExpenseRejected(expense.id, parsedInput.rejectReason || "")
        )
        .catch((error) => {
          console.error("[approveExpense] 반려 알림 생성 실패", {
            expenseId: expense.id,
            error,
          });
        });
    }

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { expense };
  });
