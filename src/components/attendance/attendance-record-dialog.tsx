"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { AlertTriangle, Calendar as CalendarIcon } from "lucide-react";
import type { Employee, Department, AttendanceRecord } from "@prisma/client";

import {
  createAttendanceRecord,
  updateAttendanceRecord,
} from "@/actions/attendance-actions";
import {
  calculateWorkMinutes,
  calculateOvertime,
  calculateNightWork,
  formatMinutesToHours,
} from "@/lib/attendance-calculator";

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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

type EmployeeWithDepartment = Employee & {
  department: Department;
};

const formSchema = z.object({
  employeeId: z.string().min(1, "직원을 선택해주세요"),
  date: z.date(),
  clockIn: z.string().regex(/^\d{2}:\d{2}$/, "출근 시간을 입력해주세요"),
  clockOut: z.string().regex(/^\d{2}:\d{2}$/, "퇴근 시간을 입력해주세요"),
  breakMinutes: z.number().min(0),
  workType: z.enum(["OFFICE", "REMOTE", "FLEXIBLE_HOURS", "HOLIDAY", "LEAVE"]),
  note: z.string().optional(),
});

type FormValues = {
  employeeId: string;
  date: Date;
  clockIn: string;
  clockOut: string;
  breakMinutes: number;
  workType: "OFFICE" | "REMOTE" | "FLEXIBLE_HOURS" | "HOLIDAY" | "LEAVE";
  note?: string;
};

interface AttendanceRecordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: EmployeeWithDepartment[];
  editingRecord?: (AttendanceRecord & { employee: EmployeeWithDepartment }) | null;
}

export function AttendanceRecordDialog({
  open,
  onOpenChange,
  employees,
  editingRecord,
}: AttendanceRecordDialogProps) {
  const isEdit = !!editingRecord;
  const [preview, setPreview] = useState<{
    workMinutes: number;
    overtime: number;
    nightWork: number;
  } | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeId: editingRecord?.employeeId || "",
      date: editingRecord?.date || new Date(),
      clockIn: editingRecord?.clockIn
        ? format(editingRecord.clockIn, "HH:mm")
        : "",
      clockOut: editingRecord?.clockOut
        ? format(editingRecord.clockOut, "HH:mm")
        : "",
      breakMinutes: 60,
      workType: (editingRecord?.workType as FormValues["workType"]) || "OFFICE",
      note: editingRecord?.note || "",
    },
  });

  // 편집 모드일 때 폼 초기화
  useEffect(() => {
    if (editingRecord && open) {
      form.reset({
        employeeId: editingRecord.employeeId,
        date: editingRecord.date,
        clockIn: editingRecord.clockIn
          ? format(editingRecord.clockIn, "HH:mm")
          : "",
        clockOut: editingRecord.clockOut
          ? format(editingRecord.clockOut, "HH:mm")
          : "",
        breakMinutes: 60,
        workType: editingRecord.workType as FormValues["workType"],
        note: editingRecord.note || "",
      });
    } else if (!open) {
      form.reset({
        employeeId: "",
        date: new Date(),
        clockIn: "",
        clockOut: "",
        breakMinutes: 60,
        workType: "OFFICE",
        note: "",
      });
      setPreview(null);
    }
  }, [editingRecord, open, form]);

  // 실시간 계산
  const clockIn = form.watch("clockIn");
  const clockOut = form.watch("clockOut");
  const breakMinutes = form.watch("breakMinutes");

  useEffect(() => {
    if (clockIn && clockOut && clockIn.match(/^\d{2}:\d{2}$/) && clockOut.match(/^\d{2}:\d{2}$/)) {
      const workMinutes = calculateWorkMinutes(clockIn, clockOut, breakMinutes);
      const overtime = calculateOvertime(workMinutes);
      const nightWork = calculateNightWork(clockIn, clockOut);

      setPreview({ workMinutes, overtime, nightWork });
    } else {
      setPreview(null);
    }
  }, [clockIn, clockOut, breakMinutes]);

  const createAction = useAction(createAttendanceRecord, {
    onSuccess: () => {
      toast.success("출퇴근 기록이 추가되었습니다.");
      onOpenChange(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "기록 추가에 실패했습니다.");
    },
  });

  const updateAction = useAction(updateAttendanceRecord, {
    onSuccess: () => {
      toast.success("출퇴근 기록이 수정되었습니다.");
      onOpenChange(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "기록 수정에 실패했습니다.");
    },
  });

  const onSubmit = (data: FormValues) => {
    if (isEdit && editingRecord) {
      updateAction.execute({ id: editingRecord.id, ...data });
    } else {
      createAction.execute(data);
    }
  };

  const isPending = createAction.isPending || updateAction.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "출퇴근 기록 수정" : "출퇴근 기록 추가"}
          </DialogTitle>
          <DialogDescription>
            직원의 출퇴근 시간을 입력하면 근무시간이 자동으로 계산됩니다.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* 직원 선택 */}
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>직원 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="직원 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} ({employee.department.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 근무일 */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>근무일 *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isPending}
                        >
                          {field.value ? (
                            format(field.value, "yyyy년 M월 d일 (EEE)", {
                              locale: ko,
                            })
                          ) : (
                            <span>날짜 선택</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 근무 형태 */}
            <FormField
              control={form.control}
              name="workType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>근무 형태</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isPending}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="OFFICE">정상 출근</SelectItem>
                      <SelectItem value="REMOTE">재택근무</SelectItem>
                      <SelectItem value="FLEXIBLE_HOURS">시차출퇴근</SelectItem>
                      <SelectItem value="HOLIDAY">휴일근로</SelectItem>
                      <SelectItem value="LEAVE">휴가</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 출근/퇴근 시간 */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clockIn"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>출근 시간 *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clockOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>퇴근 시간 *</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* 휴게시간 */}
            <FormField
              control={form.control}
              name="breakMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>휴게시간 (분)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 실시간 계산 미리보기 */}
            {preview && (
              <Alert>
                <AlertTitle>근무시간 미리보기</AlertTitle>
                <AlertDescription className="space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span>총 근무시간:</span>
                    <span className="font-semibold">
                      {formatMinutesToHours(preview.workMinutes)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>연장근로:</span>
                    <span className="font-semibold text-orange-600">
                      {formatMinutesToHours(preview.overtime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>야간근로:</span>
                    <span className="font-semibold text-purple-600">
                      {formatMinutesToHours(preview.nightWork)}
                    </span>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* 주52시간 경고 (추후 구현) */}
            {preview && preview.overtime > 720 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>연장근로 시간 주의</AlertTitle>
                <AlertDescription>
                  연장근로가 12시간을 초과했습니다. 주52시간을 확인해주세요.
                </AlertDescription>
              </Alert>
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
                      placeholder="특이사항이 있으면 입력해주세요"
                      {...field}
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
                {isPending ? "저장 중..." : isEdit ? "수정" : "추가"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
