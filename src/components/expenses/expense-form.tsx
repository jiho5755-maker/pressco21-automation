"use client";

// 경비 신청 폼 — Zod v4 + React Hook Form + Server Action
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EXPENSE_CATEGORIES } from "@/lib/constants";
import { createExpense } from "@/actions/expense-actions";

const expenseFormSchema = z.object({
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

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

export function ExpenseForm() {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: "",
      amount: undefined,
      category: undefined,
      date: "",
      description: "",
    },
  });

  const onSubmit = (data: ExpenseFormValues) => {
    startTransition(async () => {
      const result = await createExpense(data);

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      toast.success(
        `"${data.title}" 경비 ${data.amount.toLocaleString()}원이 신청되었습니다.`
      );
      form.reset();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>새 경비 신청</CardTitle>
        <CardDescription>경비 내역을 입력하고 제출하세요.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 항목명 */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>항목명</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 출장 택시비" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 금액 */}
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>금액 (원)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 카테고리 */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>카테고리</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPENSE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 날짜 */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>날짜</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 상세 내역 */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>상세 내역 (선택)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="경비 사용에 대한 상세 내용을 입력하세요."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "신청 중..." : "경비 신청하기"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
