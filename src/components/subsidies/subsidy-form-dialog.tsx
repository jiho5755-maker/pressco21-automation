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

// Phase 3-D: 출산육아 지원금 5가지
const maternityLeavePaySchema = baseSchema.extend({
  type: z.literal("MATERNITY_LEAVE_PAY"),
  childBirthDate: z.string().min(1, "자녀 출생일을 선택해주세요."),
  maternityLeaveStartDate: z.string().min(1, "휴가 시작일을 선택해주세요."),
  maternityLeaveEndDate: z.string().min(1, "휴가 종료일을 선택해주세요."),
});

const spouseMaternityPaySchema = baseSchema.extend({
  type: z.literal("SPOUSE_MATERNITY_PAY"),
  childBirthDate: z.string().min(1, "자녀 출생일을 선택해주세요."),
});

const parentalLeavePaySchema = baseSchema.extend({
  type: z.literal("PARENTAL_LEAVE_PAY"),
  childBirthDate: z.string().min(1, "자녀 출생일을 선택해주세요."),
  parentalLeaveStartDate: z.string().min(1, "육아휴직 시작일을 선택해주세요."),
  parentalLeaveEndDate: z.string().min(1, "육아휴직 종료일을 선택해주세요."),
});

const shortenedWorkHoursPaySchema = baseSchema.extend({
  type: z.literal("SHORTENED_WORK_HOURS_PAY"),
  childBirthDate: z.string().min(1, "자녀 출생일을 선택해주세요."),
  shortenedHoursPerWeek: z
    .number()
    .int()
    .min(5, "주당 최소 5시간 단축")
    .max(15, "주당 최대 15시간 단축"),
});

const pregnancyReducedHoursSchema = baseSchema.extend({
  type: z.literal("PREGNANCY_REDUCED_HOURS"),
  shortenedHoursPerWeek: z
    .number()
    .int()
    .min(1, "주당 최소 1시간 단축")
    .max(10, "주당 최대 10시간 단축"),
});

const subsidyFormSchema = z.discriminatedUnion("type", [
  // 기존 5가지
  flexibleWorkSchema,
  replacementWorkerSchema,
  parentalLeaveGrantSchema,
  workSharingSchema,
  infraSupportSchema,
  // 신규 5가지 (Phase 3-D)
  maternityLeavePaySchema,
  spouseMaternityPaySchema,
  parentalLeavePaySchema,
  shortenedWorkHoursPaySchema,
  pregnancyReducedHoursSchema,
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
                      {/* 기존 5개 (Phase 2) */}
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

                      {/* 신규 5개 (Phase 3-D) */}
                      <SelectItem value="MATERNITY_LEAVE_PAY">
                        출산전후휴가 급여
                      </SelectItem>
                      <SelectItem value="SPOUSE_MATERNITY_PAY">
                        배우자 출산휴가 급여
                      </SelectItem>
                      <SelectItem value="PARENTAL_LEAVE_PAY">
                        육아휴직 급여
                      </SelectItem>
                      <SelectItem value="SHORTENED_WORK_HOURS_PAY">
                        육아기 근로시간 단축 급여
                      </SelectItem>
                      <SelectItem value="PREGNANCY_REDUCED_HOURS">
                        임신기 근로시간 단축 급여
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
                      {employees
                        .filter((emp) => {
                          // 대체인력 지원금: 휴직자만 (MATERNITY/PARENTAL)
                          if (selectedType === "REPLACEMENT_WORKER") {
                            return (
                              emp.status === "ON_LEAVE" &&
                              (emp.leaveType === "MATERNITY" ||
                                emp.leaveType === "PARENTAL")
                            );
                          }
                          // 다른 지원금: ACTIVE 직원만
                          return emp.status === "ACTIVE";
                        })
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.employeeNo}) -{" "}
                            {emp.department.name}
                            {emp.status === "ON_LEAVE" && (
                              <span className="text-muted-foreground ml-1">
                                (휴직 중)
                              </span>
                            )}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {selectedType === "REPLACEMENT_WORKER" && (
                    <FormDescription className="text-amber-600">
                      출산휴가 또는 육아휴직 중인 직원만 표시됩니다.
                    </FormDescription>
                  )}
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

            {/* Phase 3-D: 출산육아 지원금 조건부 필드 */}
            {selectedType === "MATERNITY_LEAVE_PAY" && (
              <>
                <FormField
                  control={form.control}
                  name="childBirthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자녀 출생일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maternityLeaveStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>출산휴가 시작일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maternityLeaveEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>출산휴가 종료일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        출산전후휴가는 90일이며, 출산 후 최소 45일 휴가 필요
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {selectedType === "SPOUSE_MATERNITY_PAY" && (
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
                      배우자 출산휴가는 20일 (통상임금의 100%, 일 상한 10만원)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedType === "PARENTAL_LEAVE_PAY" && (
              <>
                <FormField
                  control={form.control}
                  name="childBirthDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>자녀 출생일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentalLeaveStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>육아휴직 시작일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="parentalLeaveEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>육아휴직 종료일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        최대 12개월, 급여의 80% (상한 160만원/월, 하한 70만원/월)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {selectedType === "SHORTENED_WORK_HOURS_PAY" && (
              <>
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
                        자녀가 만 8세 이하여야 합니다.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortenedHoursPerWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주당 단축 시간</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={5}
                          max={15}
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        5~15시간 단축 가능 (5시간: 40만원, 10시간: 50만원,
                        15시간: 60만원/월)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {selectedType === "PREGNANCY_REDUCED_HOURS" && (
              <FormField
                control={form.control}
                name="shortenedHoursPerWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>주당 단축 시간</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={10}
                        {...field}
                        onChange={(e) =>
                          field.onChange(Number(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      1~10시간 단축 가능 (월 80만원 고정)
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
