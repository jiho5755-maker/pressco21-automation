"use server";

// 경비 CRUD Server Actions
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { authActionClient, ActionError } from "@/lib/safe-action";
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

export const approveExpense = authActionClient
  .inputSchema(approveExpenseSchema)
  .action(async ({ parsedInput, ctx }) => {
    const existing = await prisma.expense.findUnique({
      where: { id: parsedInput.id },
    });
    if (!existing) throw new ActionError("경비를 찾을 수 없습니다.");
    if (existing.status !== "PENDING") {
      throw new ActionError("이미 처리된 경비입니다.");
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

    revalidatePath("/expenses");
    revalidatePath("/dashboard");
    return { expense };
  });
