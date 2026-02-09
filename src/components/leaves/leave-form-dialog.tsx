// 휴가 신청 Dialog
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { format, addDays, differenceInCalendarDays } from "date-fns";
import { ko } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon,
  Info,
  AlertCircle,
  Baby,
} from "lucide-react";
import type { Employee, Department } from "@prisma/client";

import { createLeaveRequest } from "@/actions/leave-actions";
import { calculateWorkDays } from "@/lib/leave-calculator";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// RadioGroup은 사용하지 않음 (Select로 대체)
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { leaveTypeConfig } from "@/lib/ui-config";

type EmployeeWithDepartment = Employee & {
  department: Department;
};

const formSchema = z
  .object({
    employeeId: z.string().min(1, "직원을 선택해주세요"),
    type: z.enum([
      "ANNUAL",
      "MATERNITY",
      "PARENTAL",
      "SPOUSE_MATERNITY",
      "SICK",
      "PERSONAL",
      "COMPENSATORY",
    ]),
    isFullDay: z.boolean(),
    halfDayType: z.enum(["AM", "PM"]).optional(),
    startDate: z.date(),
    endDate: z.date(),
    reason: z.string().optional(),
    childBirthDate: z.date().optional(),
    isMultiple: z.boolean(), // 다태아 여부
  })
  .refine(
    (data) => {
      // 반차 선택 시 halfDayType 필수
      if (!data.isFullDay && !data.halfDayType) {
        return false;
      }
      return true;
    },
    {
      message: "반차 유형(오전/오후)을 선택해주세요.",
      path: ["halfDayType"],
    }
  )
  .refine(
    (data) => {
      // 출산/육아/배우자출산 시 자녀 출생일 필수
      if (
        ["MATERNITY", "PARENTAL", "SPOUSE_MATERNITY"].includes(data.type) &&
        !data.childBirthDate
      ) {
        return false;
      }
      return true;
    },
    {
      message: "자녀 출생일을 입력해주세요.",
      path: ["childBirthDate"],
    }
  )
  .refine(
    (data) => {
      // 반차 선택 시 시작일과 종료일이 같아야 함
      if (
        !data.isFullDay &&
        format(data.startDate, "yyyy-MM-dd") !==
          format(data.endDate, "yyyy-MM-dd")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "반차는 하루만 선택할 수 있습니다.",
      path: ["endDate"],
    }
  );

type FormValues = z.infer<typeof formSchema>;

interface LeaveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeWithDepartment[];
  currentUserId?: string; // 직원 모드일 때 자동 선택용
}

export function LeaveFormDialog({
  open,
  onOpenChange,
  employees,
  currentUserId,
}: LeaveFormDialogProps) {
  const [calculatedDays, setCalculatedDays] = useState<number>(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: currentUserId || "",
      type: "ANNUAL",
      isFullDay: true,
      halfDayType: undefined,
      startDate: new Date(),
      endDate: new Date(),
      reason: "",
      childBirthDate: undefined,
      isMultiple: false,
    },
  });

  const { execute, isPending } = useAction(createLeaveRequest, {
    onSuccess: () => {
      toast.success("휴가 신청이 완료되었습니다.");
      onOpenChange(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "휴가 신청 실패");
    },
  });

  // 날짜 변경 시 일수 자동 계산
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "startDate" || name === "endDate" || name === "isFullDay") {
        const { startDate, endDate, isFullDay } = value;
        if (startDate && endDate) {
          if (isFullDay) {
            const days = calculateWorkDays(startDate, endDate);
            setCalculatedDays(days);
          } else {
            setCalculatedDays(0.5);
          }
        }
      }

      // 반차 선택 시 종료일 자동 동기화
      if (name === "startDate" && !value.isFullDay) {
        form.setValue("endDate", value.startDate as Date);
      }

      // 전일 선택 시 halfDayType 초기화
      if (name === "isFullDay" && value.isFullDay) {
        form.setValue("halfDayType", undefined);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Dialog 닫힐 때 폼 초기화
  useEffect(() => {
    if (!open) {
      form.reset({
        employeeId: currentUserId || "",
        type: "ANNUAL",
        isFullDay: true,
        halfDayType: undefined,
        startDate: new Date(),
        endDate: new Date(),
        reason: "",
        childBirthDate: undefined,
        isMultiple: false,
      });
      setCalculatedDays(0);
    }
  }, [open, form, currentUserId]);

  const handleSubmit = (values: FormValues) => {
    execute({
      employeeId: values.employeeId,
      type: values.type,
      startDate: format(values.startDate, "yyyy-MM-dd"),
      endDate: format(values.endDate, "yyyy-MM-dd"),
      halfDayType: values.isFullDay ? undefined : values.halfDayType,
      reason: values.reason,
      childBirthDate: values.childBirthDate
        ? format(values.childBirthDate, "yyyy-MM-dd")
        : undefined,
      isMultiple: values.isMultiple,
    });
  };

  const selectedType = form.watch("type");
  const isFullDay = form.watch("isFullDay");
  const requiresChildBirthDate = ["MATERNITY", "PARENTAL", "SPOUSE_MATERNITY"].includes(
    selectedType
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>휴가 신청</DialogTitle>
          <DialogDescription>
            휴가 정보를 입력하고 신청하세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* 직원 선택 */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    직원 <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!currentUserId || isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="직원 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees
                        .filter((emp) => emp.status === "ACTIVE")
                        .map((emp) => (
                          <SelectItem key={emp.id} value={emp.id}>
                            {emp.name} ({emp.employeeNo}) - {emp.department.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 휴가 유형 */}
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    휴가 유형 <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="유형 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ANNUAL">연차</SelectItem>
                      <SelectItem value="MATERNITY">출산휴가</SelectItem>
                      <SelectItem value="PARENTAL">육아휴직</SelectItem>
                      <SelectItem value="SPOUSE_MATERNITY">
                        배우자출산휴가
                      </SelectItem>
                      <SelectItem value="SICK">병가</SelectItem>
                      <SelectItem value="PERSONAL">개인사유</SelectItem>
                      <SelectItem value="COMPENSATORY">대체휴무</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 전일/반차 선택 (연차만) */}
            {selectedType === "ANNUAL" && (
              <FormField
                control={form.control}
                name="isFullDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>구분</FormLabel>
                    <Select
                      onValueChange={(value: string) =>
                        field.onChange(value === "true")
                      }
                      value={field.value ? "true" : "false"}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="구분 선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="true">전일</SelectItem>
                        <SelectItem value="false">반차</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 반차 유형 (오전/오후) */}
            {selectedType === "ANNUAL" && !isFullDay && (
              <FormField
                control={form.control}
                name="halfDayType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      반차 유형 <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isPending}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="AM">오전 반차</SelectItem>
                        <SelectItem value="PM">오후 반차</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* 시작일 */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    시작일 <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isPending}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "yyyy년 M월 d일 (EEE)", {
                                locale: ko,
                              })
                            : "날짜 선택"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 종료일 */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>
                    종료일 <span className="text-destructive">*</span>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={!isFullDay || isPending}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value
                            ? format(field.value, "yyyy년 M월 d일 (EEE)", {
                                locale: ko,
                              })
                            : "날짜 선택"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < form.watch("startDate") ||
                          date < new Date(new Date().setHours(0, 0, 0, 0))
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                  {!isFullDay && (
                    <p className="text-xs text-muted-foreground">
                      <Info className="inline h-3 w-3 mr-1" />
                      반차 선택 시 종료일은 시작일과 동일합니다.
                    </p>
                  )}
                </FormItem>
              )}
            />

            {/* 일수 미리보기 */}
            {calculatedDays > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  총 <strong>{calculatedDays}일</strong> 휴가 신청
                </AlertDescription>
              </Alert>
            )}

            {/* 자녀 출생일 (출산/육아/배우자출산) */}
            {requiresChildBirthDate && (
              <>
                <FormField
                  control={form.control}
                  name="childBirthDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>
                        자녀 출생일 <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                              disabled={isPending}
                            >
                              <Baby className="mr-2 h-4 w-4" />
                              {field.value
                                ? format(field.value, "yyyy년 M월 d일", {
                                    locale: ko,
                                  })
                                : "출생일 선택"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 다태아 여부 (출산휴가만) */}
                {selectedType === "MATERNITY" && (
                  <FormField
                    control={form.control}
                    name="isMultiple"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isPending}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>다태아 출산</FormLabel>
                          <p className="text-xs text-muted-foreground">
                            다태아 출산 시 120일 휴가가 부여됩니다.
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                )}

                {/* 출산휴가 안내 */}
                {selectedType === "MATERNITY" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>
                          출산휴가는{" "}
                          {form.watch("isMultiple") ? "120일" : "90일"}입니다.
                        </li>
                        <li>출산 후 45일 이상 사용해야 합니다.</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* 배우자출산휴가 안내 */}
                {selectedType === "SPOUSE_MATERNITY" && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      배우자출산휴가는 자녀 출생일로부터 120일 이내 20일 사용
                      가능합니다.
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}

            {/* 사유 */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>사유</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="휴가 사유를 입력하세요 (선택사항)"
                      rows={3}
                      disabled={isPending}
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
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                신청하기
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
