"use client";

// 직원 정보 수정 Dialog — 탭별 Zod + RHF 폼
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useAction } from "next-safe-action/hooks";
import { Pencil, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { POSITIONS, WORK_TYPES, WEEKDAYS } from "@/lib/constants";
import { validateMinimumWage } from "@/lib/validations/salary";
import {
  updateEmployee,
  updateEmployeeSalary,
  updateEmployeeWork,
} from "@/actions/employee-actions";
import type { Department, Employee } from "@prisma/client";

interface EmployeeEditDialogProps {
  employee: Employee & { department: Department };
  departments: Department[];
}

// ── 기본정보 탭 스키마 ──
const infoSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력해주세요."),
  departmentId: z.string(),
  position: z.enum(POSITIONS),
  email: z
    .string()
    .email("올바른 이메일 형식이 아닙니다.")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional().or(z.literal("")),
  childrenUnder20: z.number().int().min(0).max(20),
});

// ── 근무 탭 스키마 ──
const workSchema = z.object({
  workType: z.enum(["OFFICE", "FLEXIBLE_HOURS", "REMOTE", "HYBRID"]),
  weeklyWorkHours: z.number().min(1).max(52),
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm 형식으로 입력해주세요."),
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/, "HH:mm 형식으로 입력해주세요."),
  breakMinutes: z.number().min(0),
  flexStartTime: z.string().optional().or(z.literal("")),
  flexEndTime: z.string().optional().or(z.literal("")),
  remoteWorkDays: z.array(z.enum(["MON", "TUE", "WED", "THU", "FRI"])).optional(),
});

// ── 급여/보험 탭 스키마 ──
const salarySchema = z
  .object({
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
    dependents: z.number().min(0),
    childrenUnder20: z.number().int().min(0).max(20),
  })
  .superRefine((data, ctx) => {
    // 최저임금 검증 (모든 수당 포함)
    const validation = validateMinimumWage(
      data.baseSalary,
      data.mealAllowance,
      data.transportAllowance,
      data.positionAllowance,
      data.salaryType
    );
    if (!validation.isValid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: validation.message || "최저임금 미달",
        path: ["baseSalary"],
      });
    }

    // 비과세 한도 경고
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
  });

type InfoFormValues = z.infer<typeof infoSchema>;
type WorkFormValues = z.infer<typeof workSchema>;
type SalaryFormValues = z.infer<typeof salarySchema>;

export function EmployeeEditDialog({
  employee,
  departments,
}: EmployeeEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("info");

  // ── 기본정보 폼 ──
  const infoForm = useForm<InfoFormValues>({
    resolver: zodResolver(infoSchema),
    defaultValues: {
      name: employee.name,
      departmentId: employee.departmentId,
      position: employee.position as (typeof POSITIONS)[number],
      email: employee.email || "",
      phone: employee.phone || "",
      address: employee.address || "",
      childrenUnder20: employee.childrenUnder20,
    },
  });

  const { execute: executeInfo, isPending: isPendingInfo } = useAction(
    updateEmployee,
    {
      onSuccess: () => {
        toast.success("기본정보가 수정되었습니다.");
        setOpen(false);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "수정에 실패했습니다.");
      },
    }
  );

  const onSubmitInfo = (data: InfoFormValues) => {
    executeInfo({ id: employee.id, ...data });
  };

  // ── 근무 폼 ──
  const workForm = useForm<WorkFormValues>({
    resolver: zodResolver(workSchema),
    defaultValues: {
      workType: employee.workType as "OFFICE" | "FLEXIBLE_HOURS" | "REMOTE" | "HYBRID",
      weeklyWorkHours: employee.weeklyWorkHours,
      workStartTime: employee.workStartTime,
      workEndTime: employee.workEndTime,
      breakMinutes: employee.breakMinutes,
      flexStartTime: employee.flexStartTime || "",
      flexEndTime: employee.flexEndTime || "",
      remoteWorkDays: employee.remoteWorkDays
        ? JSON.parse(employee.remoteWorkDays)
        : [],
    },
  });

  const { execute: executeWork, isPending: isPendingWork } = useAction(
    updateEmployeeWork,
    {
      onSuccess: () => {
        toast.success("근무정보가 수정되었습니다.");
        setOpen(false);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "수정에 실패했습니다.");
      },
    }
  );

  const onSubmitWork = (data: WorkFormValues) => {
    executeWork({ id: employee.id, ...data });
  };

  // ── 급여/보험 폼 ──
  const salaryForm = useForm<SalaryFormValues>({
    resolver: zodResolver(salarySchema),
    defaultValues: {
      salaryType: employee.salaryType as "MONTHLY" | "HOURLY",
      baseSalary: employee.baseSalary,
      mealAllowance: employee.mealAllowance || 0,
      transportAllowance: employee.transportAllowance || 0,
      positionAllowance: employee.positionAllowance || 0,
      taxFreeMeal: employee.taxFreeMeal ?? true,
      taxFreeTransport: employee.taxFreeTransport ?? true,
      bankName: employee.bankName || "",
      bankAccount: employee.bankAccount || "",
      nationalPension: employee.nationalPension,
      healthInsurance: employee.healthInsurance,
      employmentInsurance: employee.employmentInsurance,
      industrialAccident: employee.industrialAccident,
      dependents: employee.dependents,
      childrenUnder20: employee.childrenUnder20,
    },
  });

  const { execute: executeSalary, isPending: isPendingSalary } = useAction(
    updateEmployeeSalary,
    {
      onSuccess: () => {
        toast.success("급여/보험 정보가 수정되었습니다.");
        setOpen(false);
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "수정에 실패했습니다.");
      },
    }
  );

  const onSubmitSalary = (data: SalaryFormValues) => {
    executeSalary({ id: employee.id, ...data });
  };

  // ── 최저임금 경고 실시간 표시 ──
  const salaryTypeWatch = salaryForm.watch("salaryType");
  const baseSalaryWatch = salaryForm.watch("baseSalary");
  const mealAllowanceWatch = salaryForm.watch("mealAllowance");
  const transportAllowanceWatch = salaryForm.watch("transportAllowance");
  const positionAllowanceWatch = salaryForm.watch("positionAllowance");
  const minimumWageWarning = validateMinimumWage(
    baseSalaryWatch || 0,
    mealAllowanceWatch || 0,
    transportAllowanceWatch || 0,
    positionAllowanceWatch || 0,
    salaryTypeWatch
  );

  // ── 총 급여 계산 ──
  const totalGross =
    (baseSalaryWatch || 0) +
    (mealAllowanceWatch || 0) +
    (transportAllowanceWatch || 0) +
    (positionAllowanceWatch || 0);

  // ── 근무유형에 따른 조건부 필드 표시 ──
  const workTypeWatch = workForm.watch("workType");

  // ── 재택근무 요일 토글 ──
  const remoteWorkDaysValue = workForm.watch("remoteWorkDays") || [];
  const toggleRemoteDay = (day: string) => {
    type WeekDay = "MON" | "TUE" | "WED" | "THU" | "FRI";
    const current = remoteWorkDaysValue;
    const updated = current.includes(day as WeekDay)
      ? current.filter((d) => d !== day)
      : [...current, day as WeekDay];
    workForm.setValue("remoteWorkDays", updated);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="mr-1 h-4 w-4" />
          수정
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>직원 정보 수정</DialogTitle>
          <DialogDescription>
            {employee.name} ({employee.employeeNo})
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">기본정보</TabsTrigger>
            <TabsTrigger value="work">근무</TabsTrigger>
            <TabsTrigger value="salary">급여/보험</TabsTrigger>
          </TabsList>

          {/* ── 기본정보 탭 ── */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <Form {...infoForm}>
              <form
                onSubmit={infoForm.handleSubmit(onSubmitInfo)}
                className="space-y-4"
              >
                <FormField
                  control={infoForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={infoForm.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>부서</FormLabel>
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
                          {departments.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={infoForm.control}
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>직급</FormLabel>
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
                          {POSITIONS.map((pos) => (
                            <SelectItem key={pos} value={pos}>
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={infoForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>이메일</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={infoForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연락처</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={infoForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주소</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={infoForm.control}
                  name="childrenUnder20"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>20세 이하 자녀 수</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button type="submit" disabled={isPendingInfo}>
                    {isPendingInfo ? "저장 중..." : "기본정보 저장"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* ── 근무 탭 ── */}
          <TabsContent value="work" className="space-y-4 mt-4">
            <Form {...workForm}>
              <form
                onSubmit={workForm.handleSubmit(onSubmitWork)}
                className="space-y-4"
              >
                <FormField
                  control={workForm.control}
                  name="workType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>근무유형</FormLabel>
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
                          {Object.entries(WORK_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={workForm.control}
                    name="workStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>출근시간</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workForm.control}
                    name="workEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>퇴근시간</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={workForm.control}
                    name="weeklyWorkHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>주간 근로시간</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 40)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={workForm.control}
                    name="breakMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>휴게시간(분)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value) || 60)
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {(workTypeWatch === "FLEXIBLE_HOURS" ||
                  workTypeWatch === "HYBRID") && (
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={workForm.control}
                      name="flexStartTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>시차 출근</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={workForm.control}
                      name="flexEndTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>시차 퇴근</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {(workTypeWatch === "REMOTE" || workTypeWatch === "HYBRID") && (
                  <FormItem>
                    <FormLabel>재택근무 요일</FormLabel>
                    <div className="flex gap-2">
                      {Object.entries(WEEKDAYS).map(([key, label]) => {
                        type WeekDay = "MON" | "TUE" | "WED" | "THU" | "FRI";
                        return (
                          <Button
                            key={key}
                            type="button"
                            variant={
                              remoteWorkDaysValue.includes(key as WeekDay)
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => toggleRemoteDay(key)}
                          >
                            {label}
                          </Button>
                        );
                      })}
                    </div>
                  </FormItem>
                )}

                <DialogFooter>
                  <Button type="submit" disabled={isPendingWork}>
                    {isPendingWork ? "저장 중..." : "근무정보 저장"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>

          {/* ── 급여/보험 탭 ── */}
          <TabsContent value="salary" className="space-y-4 mt-4">
            <Form {...salaryForm}>
              <form
                onSubmit={salaryForm.handleSubmit(onSubmitSalary)}
                className="space-y-4"
              >
                {!minimumWageWarning.isValid && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {minimumWageWarning.message}
                    </AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={salaryForm.control}
                  name="salaryType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>급여유형</FormLabel>
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
                          <SelectItem value="MONTHLY">월급제</SelectItem>
                          <SelectItem value="HOURLY">시급제</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={salaryForm.control}
                  name="baseSalary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>기본급 (원) *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        세금/보험료 계산 기준이 되는 기본급여
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={salaryForm.control}
                  name="mealAllowance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>식대 (원)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <div className="flex items-center gap-2 mt-2">
                        <FormField
                          control={salaryForm.control}
                          name="taxFreeMeal"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label className="text-sm cursor-pointer">
                                비과세 (20만원까지)
                              </label>
                            </div>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={salaryForm.control}
                  name="transportAllowance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>교통비 (원)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <div className="flex items-center gap-2 mt-2">
                        <FormField
                          control={salaryForm.control}
                          name="taxFreeTransport"
                          render={({ field }) => (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                              <label className="text-sm cursor-pointer">
                                비과세 (20만원까지)
                              </label>
                            </div>
                          )}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={salaryForm.control}
                  name="positionAllowance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>직책수당 (원)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        과세 대상 (직책에 따른 추가 수당)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 총 급여 미리보기 */}
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">총 급여</span>
                    <span className="text-2xl font-bold">
                      {totalGross.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={salaryForm.control}
                    name="bankName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>은행</FormLabel>
                        <FormControl>
                          <Input placeholder="국민은행" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={salaryForm.control}
                    name="bankAccount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>계좌번호</FormLabel>
                        <FormControl>
                          <Input placeholder="123-456-789012" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={salaryForm.control}
                  name="dependents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>부양가족 수</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={salaryForm.control}
                  name="childrenUnder20"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>20세 이하 자녀 수</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="20"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>4대보험 가입</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <FormField
                      control={salaryForm.control}
                      name="nationalPension"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label className="text-sm cursor-pointer">
                            국민연금
                          </label>
                        </div>
                      )}
                    />
                    <FormField
                      control={salaryForm.control}
                      name="healthInsurance"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label className="text-sm cursor-pointer">
                            건강보험
                          </label>
                        </div>
                      )}
                    />
                    <FormField
                      control={salaryForm.control}
                      name="employmentInsurance"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label className="text-sm cursor-pointer">
                            고용보험
                          </label>
                        </div>
                      )}
                    />
                    <FormField
                      control={salaryForm.control}
                      name="industrialAccident"
                      render={({ field }) => (
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                          <label className="text-sm cursor-pointer">
                            산재보험
                          </label>
                        </div>
                      )}
                    />
                  </div>
                </FormItem>

                <DialogFooter>
                  <Button type="submit" disabled={isPendingSalary}>
                    {isPendingSalary ? "저장 중..." : "급여/보험 저장"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
