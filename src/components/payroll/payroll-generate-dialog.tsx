// 급여 생성 Dialog
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generatePayrollRecord } from "@/actions/payroll-actions";

const formSchema = z.object({
  employeeId: z.string().min(1, "직원을 선택해주세요"),
  year: z.number().int().min(2020).max(2100),
  month: z.number().int().min(1).max(12),
});

type FormValues = z.infer<typeof formSchema>;

interface PayrollGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Array<{
    id: string;
    employeeNo: string;
    name: string;
    useFixedOT?: boolean;
  }>;
}

export function PayrollGenerateDialog({
  open,
  onOpenChange,
  employees,
}: PayrollGenerateDialogProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>("");

  const now = new Date();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: "",
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    },
  });

  const { execute, isPending } = useAction(generatePayrollRecord, {
    onSuccess: () => {
      toast.success("급여가 생성되었습니다.");
      form.reset();
      setSelectedEmployeeId("");
      onOpenChange(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "급여 생성 실패");
    },
  });

  const handleSubmit = (data: FormValues) => {
    execute(data);
  };

  // 선택된 직원이 고정OT를 사용하는지 확인
  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId);
  const showFixedOTWarning = selectedEmployee?.useFixedOT === true;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>급여 생성</DialogTitle>
          <DialogDescription>
            지정된 월의 근태 기록을 기반으로 급여를 자동 계산합니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            {/* 직원 선택 */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>직원</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      setSelectedEmployeeId(value);
                    }}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="직원 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employeeNo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 고정OT 경고 */}
            {showFixedOTWarning && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  이 직원은 포괄임금제를 사용하여 변동 수당이 0원으로
                  처리됩니다.
                </AlertDescription>
              </Alert>
            )}

            {/* 연도 선택 */}
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>연도</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 5 }, (_, i) => now.getFullYear() - i).map(
                        (year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}년
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 월 선택 */}
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>월</FormLabel>
                  <Select
                    value={field.value.toString()}
                    onValueChange={(value) => field.onChange(parseInt(value))}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                        <SelectItem key={month} value={month.toString()}>
                          {month}월
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 제출 버튼 */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "생성 중..." : "생성"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
