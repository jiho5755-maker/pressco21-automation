"use client";

// 문서 생성 폼 Dialog (Phase 3-C)
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Plus, X, AlertCircle } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { createDocument } from "@/actions/document-actions";
import type { Employee, Department, User } from "@prisma/client";
import type { EmploymentContractContent } from "@/types/document";

interface DocumentFormDialogProps {
  employees: Array<Employee & { department: Department }>;
  users: User[]; // 결재자 목록 (Manager/Admin)
}

// ══ Zod 스키마 (discriminatedUnion) ══

const baseSchema = z.object({
  type: z.enum([
    "EMPLOYMENT_CONTRACT",
    "PAYSLIP",
    "RESIGNATION",
    "NOTICE",
    "OTHER",
  ]),
  title: z.string().min(1, "제목을 입력해주세요."),
  employeeId: z.string().min(1, "직원을 선택해주세요."),
  approvers: z
    .array(
      z.object({
        approverId: z.string().min(1),
        approvalOrder: z.number().int().positive(),
      })
    )
    .min(1, "최소 1명의 결재자를 지정해주세요.")
    .max(5, "최대 5명까지 지정 가능합니다."),
});

// 근로계약서 스키마 (필수 항목만)
const employmentContractSchema = baseSchema.extend({
  type: z.literal("EMPLOYMENT_CONTRACT"),
  isIndefinite: z.boolean().default(false),
  contractStartDate: z.string().min(1, "계약 시작일을 선택해주세요."),
  contractEndDate: z.string().optional(),
  workLocation: z.string().min(1, "근무 장소를 입력해주세요."),
  jobDescription: z.string().min(1, "업무 내용을 입력해주세요."),
  weeklyWorkHours: z.number().int().min(1).max(52),
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakMinutes: z.number().int().min(0),
  weeklyRestDay: z.string().min(1),
  salaryPaymentDate: z.number().int().min(1).max(31),
  annualLeavePolicy: z.string().min(1),
});

// 임금명세서 스키마
const payslipSchema = baseSchema.extend({
  type: z.literal("PAYSLIP"),
  year: z.number().int().min(2020).max(2099),
  month: z.number().int().min(1).max(12),
});

// 공지사항 스키마
const noticeSchema = baseSchema.extend({
  type: z.literal("NOTICE"),
  content: z.string().min(1, "내용을 입력해주세요."),
});

// 기타 문서 스키마
const otherSchema = baseSchema.extend({
  type: z.literal("OTHER"),
  content: z.string().min(1, "내용을 입력해주세요."),
});

const documentFormSchema = z.discriminatedUnion("type", [
  employmentContractSchema,
  payslipSchema,
  noticeSchema,
  otherSchema,
]);

type DocumentFormData = z.infer<typeof documentFormSchema>;

// union 타입의 모든 키를 optional로 만든 타입
type PartialDocumentFormData = Partial<
  z.infer<typeof employmentContractSchema> &
    z.infer<typeof payslipSchema> &
    z.infer<typeof noticeSchema> &
    z.infer<typeof otherSchema>
>;

export function DocumentFormDialog({
  employees,
  users,
}: DocumentFormDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(documentFormSchema),
    defaultValues: {
      type: "EMPLOYMENT_CONTRACT",
      title: "",
      employeeId: "",
      approvers: [{ approverId: "", approvalOrder: 1 }],
      // EMPLOYMENT_CONTRACT 필수 필드 추가
      isIndefinite: false,
      contractStartDate: "",
      contractEndDate: "",
      workLocation: "",
      jobDescription: "",
      weeklyWorkHours: 40,
      workStartTime: "09:00",
      workEndTime: "18:00",
      breakMinutes: 60,
      weeklyRestDay: "",
      salaryPaymentDate: 25,
      annualLeavePolicy: "",
    } as PartialDocumentFormData,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "approvers",
  });

  const { execute, isPending } = useAction(createDocument, {
    onSuccess: () => {
      toast.success("문서가 생성되었습니다.");
      setOpen(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "생성 중 오류가 발생했습니다.");
    },
  });

  const onSubmit = (data: unknown) => {
    // zodResolver에서 검증된 데이터이므로 DocumentFormData로 캐스팅 안전
    const validatedData = data as DocumentFormData;
    // content JSON 생성
    let content: string;

    if (validatedData.type === "EMPLOYMENT_CONTRACT") {
      const selectedEmployee = employees.find(
        (e) => e.id === validatedData.employeeId
      );
      if (!selectedEmployee) {
        toast.error("직원 정보를 찾을 수 없습니다.");
        return;
      }

      const contractContent: EmploymentContractContent = {
        contractStartDate: validatedData.contractStartDate,
        contractEndDate: validatedData.contractEndDate,
        isIndefinite: validatedData.isIndefinite,
        contractType: selectedEmployee.contractType as
          | "REGULAR"
          | "CONTRACT"
          | "PARTTIME"
          | "REPLACEMENT",
        workLocation: validatedData.workLocation,
        jobDescription: validatedData.jobDescription,
        workingHours: {
          weeklyWorkHours: validatedData.weeklyWorkHours,
          workStartTime: validatedData.workStartTime,
          workEndTime: validatedData.workEndTime,
          breakMinutes: validatedData.breakMinutes,
        },
        weeklyRestDay: validatedData.weeklyRestDay,
        salary: {
          baseSalary: selectedEmployee.baseSalary,
          mealAllowance: selectedEmployee.mealAllowance,
          transportAllowance: selectedEmployee.transportAllowance,
          positionAllowance: selectedEmployee.positionAllowance,
          taxFreeMeal: selectedEmployee.taxFreeMeal,
          taxFreeTransport: selectedEmployee.taxFreeTransport,
        },
        salaryPayment: {
          paymentDate: validatedData.salaryPaymentDate,
          paymentMethod: "BANK_TRANSFER",
          bankName: selectedEmployee.bankName || undefined,
          bankAccount: selectedEmployee.bankAccount || undefined,
        },
        annualLeavePolicy: validatedData.annualLeavePolicy,
        socialInsurance: {
          nationalPension: selectedEmployee.nationalPension,
          healthInsurance: selectedEmployee.healthInsurance,
          employmentInsurance: selectedEmployee.employmentInsurance,
          industrialAccident: selectedEmployee.industrialAccident,
        },
        generatedAt: new Date().toISOString(),
      };
      content = JSON.stringify(contractContent);
    } else if (validatedData.type === "PAYSLIP") {
      content = JSON.stringify({
        year: validatedData.year,
        month: validatedData.month,
      });
    } else {
      content = JSON.stringify({
        content: validatedData.content || "",
      });
    }

    execute({
      title: validatedData.title,
      type: validatedData.type,
      employeeId: validatedData.employeeId,
      content,
      approvers: validatedData.approvers,
    });
  };

  const selectedType = form.watch("type");
  const selectedEmployeeId = form.watch("employeeId");
  const isIndefinite = form.watch("isIndefinite");

  // Employee 데이터 자동 불러오기
  const loadEmployeeData = () => {
    const employee = employees.find((e) => e.id === selectedEmployeeId);
    if (!employee) return;

    if (selectedType === "EMPLOYMENT_CONTRACT") {
      form.setValue("weeklyWorkHours", employee.weeklyWorkHours);
      form.setValue("workStartTime", employee.workStartTime);
      form.setValue("workEndTime", employee.workEndTime);
      form.setValue("breakMinutes", employee.breakMinutes);
      form.setValue("salaryPaymentDate", 25); // 기본값
      toast.success("직원 정보를 불러왔습니다.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          문서 생성
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>문서 생성</DialogTitle>
          <DialogDescription>
            문서 유형을 선택하고 필수 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* 1. 기본 정보 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">1. 기본 정보</h3>

              {/* 문서 유형 */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>문서 유형</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EMPLOYMENT_CONTRACT">근로계약서</SelectItem>
                        <SelectItem value="PAYSLIP">임금명세서</SelectItem>
                        <SelectItem value="NOTICE">공지사항</SelectItem>
                        <SelectItem value="OTHER">기타</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 제목 */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>문서 제목</FormLabel>
                    <FormControl>
                      <Input placeholder="예: 2026년 근로계약서" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* 대상 직원 */}
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>대상 직원</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="직원을 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {employees.map((emp) => (
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

              {/* 자동 불러오기 버튼 */}
              {selectedType === "EMPLOYMENT_CONTRACT" && selectedEmployeeId && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>직원 정보 자동 입력</AlertTitle>
                  <AlertDescription>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={loadEmployeeData}
                      className="mt-2"
                    >
                      근무 조건 정보 불러오기
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <Separator />

            {/* 2. 유형별 필드 (조건부) */}
            {selectedType === "EMPLOYMENT_CONTRACT" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. 근로계약 조건</h3>

                {/* 계약 유형 */}
                <FormField
                  control={form.control}
                  name="isIndefinite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>계약 유형</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => field.onChange(value === "true")}
                          value={field.value ? "true" : "false"}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="indefinite" />
                            <label htmlFor="indefinite">무기계약 (정규직)</label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="fixed-term" />
                            <label htmlFor="fixed-term">기간제 (계약직)</label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 계약 기간 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contractStartDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>계약 시작일</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {!isIndefinite && (
                    <FormField
                      control={form.control}
                      name="contractEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>계약 종료일</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>

                {/* 근무 장소 */}
                <FormField
                  control={form.control}
                  name="workLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>근무 장소</FormLabel>
                      <FormControl>
                        <Input placeholder="서울특별시 강남구..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 업무 내용 */}
                <FormField
                  control={form.control}
                  name="jobDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>업무 내용</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="소프트웨어 개발, 코드 리뷰..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 소정근로시간 */}
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="weeklyWorkHours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>주간 근로시간</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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
                    control={form.control}
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
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 주휴일 */}
                <FormField
                  control={form.control}
                  name="weeklyRestDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주휴일</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="주휴일 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="토요일">토요일</SelectItem>
                          <SelectItem value="일요일">일요일</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 급여 지급일 */}
                <FormField
                  control={form.control}
                  name="salaryPaymentDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>급여 지급일 (매월 n일)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* 연차 정책 */}
                <FormField
                  control={form.control}
                  name="annualLeavePolicy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>연차 정책</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="근로기준법 제60조에 따라..."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        근로기준법 제60조: 1년 근속 시 15일, 이후 2년마다 1일 추가
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedType === "PAYSLIP" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. 급여 기간</h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>연도</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
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
                        <FormLabel>월</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={12}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {(selectedType === "NOTICE" || selectedType === "OTHER") && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">2. 내용</h3>

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>내용</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="문서 내용을 입력하세요..."
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <Separator />

            {/* 3. 결재라인 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">3. 결재라인</h3>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  최소 1명, 최대 5명까지 순차 결재자를 지정할 수 있습니다.
                </AlertDescription>
              </Alert>

              {fields.map((field, index) => (
                <div key={field.id} className="flex items-start gap-4">
                  <Badge variant="outline" className="mt-2 text-lg">
                    {index + 1}차
                  </Badge>

                  <FormField
                    control={form.control}
                    name={`approvers.${index}.approverId`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="결재자를 선택하세요" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {users
                              .filter((u) => u.role !== "viewer")
                              .map((user) => (
                                <SelectItem key={user.id} value={user.id}>
                                  {user.name} ({user.role === "admin" ? "관리자" : "부서장"})
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {fields.length < 5 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    append({ approverId: "", approvalOrder: fields.length + 1 })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  결재자 추가 ({fields.length}/5)
                </Button>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                취소
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "생성 중..." : "문서 생성"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
