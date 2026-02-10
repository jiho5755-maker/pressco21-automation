"use client";

// 정부지원사업 신청 폼 Dialog (유형별 조건부 필드)
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from "@/components/ui/textarea";
import { createSubsidyApplication } from "@/actions/subsidy-actions";
import type { Employee, Department } from "@prisma/client";

interface SubsidyFormDialogProps {
  employees: Array<Employee & { department: Department }>;
}

// Zod 스키마 (유형별 조건부 필드)
const baseSchema = z.object({
  type: z.enum([
    "FLEXIBLE_WORK",
    "REPLACEMENT_WORKER",
    "PARENTAL_LEAVE_GRANT",
    "WORK_SHARING",
    "INFRA_SUPPORT",
  ]),
  year: z.number().int().min(2020).max(2099),
  month: z.number().int().min(1).max(12),
  employeeId: z.string().min(1, "직원을 선택해주세요."),
  note: z.string().max(500).optional(),
});

const flexibleWorkSchema = baseSchema.extend({
  type: z.literal("FLEXIBLE_WORK"),
  flexibleWorkCount: z
    .number()
    .int()
    .min(4, "월 4회 이상 유연근무를 사용해야 합니다."),
});

const replacementWorkerSchema = baseSchema.extend({
  type: z.literal("REPLACEMENT_WORKER"),
  replacementEmployeeId: z.string().min(1, "대체인력을 선택해주세요."),
  replacementStartDate: z.string().min(1, "시작일을 선택해주세요."),
  replacementEndDate: z.string().optional(),
});

const parentalLeaveGrantSchema = baseSchema.extend({
  type: z.literal("PARENTAL_LEAVE_GRANT"),
  childBirthDate: z.string().min(1, "자녀 출생일을 선택해주세요."),
});

const workSharingSchema = baseSchema.extend({
  type: z.literal("WORK_SHARING"),
});

const infraSupportSchema = baseSchema.extend({
  type: z.literal("INFRA_SUPPORT"),
});

const subsidyFormSchema = z.discriminatedUnion("type", [
  flexibleWorkSchema,
  replacementWorkerSchema,
  parentalLeaveGrantSchema,
  workSharingSchema,
  infraSupportSchema,
]);

type SubsidyFormData = z.infer<typeof subsidyFormSchema>;

export function SubsidyFormDialog({ employees }: SubsidyFormDialogProps) {
  const [open, setOpen] = useState(false);
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const form = useForm<SubsidyFormData>({
    resolver: zodResolver(subsidyFormSchema),
    defaultValues: {
      type: "FLEXIBLE_WORK",
      year: currentYear,
      month: currentMonth,
      employeeId: "",
      note: "",
    },
  });

  const { execute, isPending } = useAction(createSubsidyApplication, {
    onSuccess: () => {
      toast.success("지원금 신청이 완료되었습니다.");
      setOpen(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "신청 중 오류가 발생했습니다.");
    },
  });

  const onSubmit = (data: SubsidyFormData) => {
    execute(data);
  };

  const selectedType = form.watch("type");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          지원금 신청
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>정부지원사업 신청</DialogTitle>
          <DialogDescription>
            지원금 유형을 선택하고 필수 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 지원금 유형 */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>지원금 유형</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="FLEXIBLE_WORK">
                        유연근무 장려금
                      </SelectItem>
                      <SelectItem value="REPLACEMENT_WORKER">
                        출산육아기 대체인력 지원금
                      </SelectItem>
                      <SelectItem value="PARENTAL_LEAVE_GRANT">
                        육아휴직 부여 지원금
                      </SelectItem>
                      <SelectItem value="WORK_SHARING">
                        업무분담 지원금
                      </SelectItem>
                      <SelectItem value="INFRA_SUPPORT">
                        유연근무 인프라 구축비
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 귀속 연월 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>귀속 연도</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="month"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>귀속 월</FormLabel>
                    <Select
                      onValueChange={(v) => field.onChange(Number(v))}
                      defaultValue={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(
                          (month) => (
                            <SelectItem key={month} value={month.toString()}>
                              {month}월
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 대상 직원 */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>대상 직원</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="직원을 선택하세요" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((emp) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.employeeNo}) -{" "}
                          {emp.department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 유형별 조건부 필드 */}
            {selectedType === "FLEXIBLE_WORK" && (
              <FormField
                control={form.control}
                name="flexibleWorkCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>월 유연근무 사용 횟수</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      해당 월에 유연근무를 사용한 일수 (최소 4회)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "REPLACEMENT_WORKER" && (
              <>
                <FormField
                  control={form.control}
                  name="replacementEmployeeId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>대체인력</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="대체인력을 선택하세요" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees
                            .filter((emp) => emp.contractType === "REPLACEMENT")
                            .map((emp) => (
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
                <FormField
                  control={form.control}
                  name="replacementStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>대체인력 근무 시작일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="replacementEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>대체인력 근무 종료일 (선택)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {selectedType === "PARENTAL_LEAVE_GRANT" && (
              <FormField
                control={form.control}
                name="childBirthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>자녀 출생일</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormDescription>
                      출생일 기준 18개월 이내 신청 가능
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 메모 */}
            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>메모 (선택)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="추가 정보를 입력하세요..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "신청 중..." : "신청하기"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
