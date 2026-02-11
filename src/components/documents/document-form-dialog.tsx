"use client";

// 문서 생성 폼 Dialog (Phase 3-C)
// 3가지 근로계약서 양식 지원: 재택근무 / 포괄임금제 / 촉탁직
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Plus, X, AlertCircle, Building2, Home, Briefcase } from "lucide-react";
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
import { SALARY_PAYMENT_OPTIONS } from "@/lib/constants";
import type { Employee, Department, User } from "@prisma/client";
import type {
  EmploymentContractContent,
  ContractVariant,
} from "@/types/document";

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

// 근로계약서 스키마 (회사 양식 기반 확장)
const employmentContractSchema = baseSchema.extend({
  type: z.literal("EMPLOYMENT_CONTRACT"),
  // 계약서 양식 유형
  contractVariant: z.enum(["REMOTE", "FIXED_OT", "REEMPLOYED"]),
  // 계약 기간
  isIndefinite: z.boolean().default(false),
  contractStartDate: z.string().min(1, "계약 시작일을 선택해주세요."),
  contractEndDate: z.string().optional(),
  probationPeriod: z.number().int().min(0).default(3),
  // 근무 조건
  workLocation: z.string().min(1, "근무 장소를 입력해주세요."),
  jobDescription: z.string().min(1, "업무 내용을 입력해주세요."),
  weeklyWorkHours: z.number().int().min(1).max(52),
  workStartTime: z.string().regex(/^\d{2}:\d{2}$/),
  workEndTime: z.string().regex(/^\d{2}:\d{2}$/),
  breakStartTime: z.string().regex(/^\d{2}:\d{2}$/).default("12:30"),
  breakEndTime: z.string().regex(/^\d{2}:\d{2}$/).default("13:30"),
  breakMinutes: z.number().int().min(0),
  weeklyRestDay: z.string().min(1),
  // 급여
  salaryPaymentDate: z.string().default("말일"),
  annualLeavePolicy: z.string().min(1),
  // 재택근무 (REMOTE)
  remoteDays: z.string().optional(),
  article58Applied: z.boolean().default(true),
  remoteWorkGuidelinesConfirmed: z.boolean().default(false),
  // 포괄임금제 (FIXED_OT / REEMPLOYED)
  fixedOTHours: z.number().int().min(0).max(52).optional(),
  fixedOTAmount: z.number().min(0).optional(),
  overtimeThreshold: z.number().default(30),
  fixedOTAgreement: z.boolean().default(false),
  // 시차출퇴근제
  useFlexible: z.boolean().default(false),
  flexStartTime: z.string().default("07:00"),
  flexEndTime: z.string().default("11:00"),
  coreStartTime: z.string().default("11:00"),
  coreEndTime: z.string().default("16:00"),
  // 촉탁직 (REEMPLOYED)
  retirementAge: z.number().default(65),
  contractYears: z.number().default(3),
  // 직원 추가 정보 (DB에 없는 경우 입력)
  employeeAddress: z.string().optional(),
  employeeBirthDate: z.string().optional(),
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

// 회사 기본 정보
const COMPANY_INFO = {
  companyName: "프레스코21",
  businessNumber: "215-05-52221",
  businessType: "상품도매업",
  companyAddress:
    "서울시 송파구 송이동 15길 33(가락동) 가락2차 쌍용상가 201호",
  representativeName: "이진선",
};

// 계약 해지 사유 기본값
const DEFAULT_TERMINATION_REASONS = [
  "경영상의 이유에 의한 해고 등 관련법에 의한 사유가 발생한 경우",
  "근로자에게 노동관계법 또는 취업규칙에서 정하는 징계해고 사유가 발생한 경우",
  "계약기간 만료 시",
  "근로자가 사직원을 제출한 경우",
  "기타, 갑·을 쌍방의 합의에 의한 경우",
];

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
      // 근로계약서 기본값
      contractVariant: "REMOTE" as ContractVariant,
      isIndefinite: false,
      contractStartDate: "",
      contractEndDate: "",
      probationPeriod: 3,
      workLocation: "",
      jobDescription: "",
      weeklyWorkHours: 40,
      workStartTime: "09:00",
      workEndTime: "18:00",
      breakStartTime: "12:30",
      breakEndTime: "13:30",
      breakMinutes: 60,
      weeklyRestDay: "일요일",
      salaryPaymentDate: "말일",
      annualLeavePolicy: "근로기준법에 정하는 바에 따라 부여한다.",
      // 재택근무
      remoteDays: "월, 화, 수, 금요일",
      article58Applied: true,
      remoteWorkGuidelinesConfirmed: false,
      // 포괄임금제
      fixedOTHours: 20,
      fixedOTAmount: 0,
      overtimeThreshold: 30,
      fixedOTAgreement: false,
      // 시차출퇴근제
      useFlexible: false,
      flexStartTime: "07:00",
      flexEndTime: "11:00",
      coreStartTime: "11:00",
      coreEndTime: "16:00",
      // 촉탁직
      retirementAge: 65,
      contractYears: 3,
      // 직원 추가 정보
      employeeAddress: "",
      employeeBirthDate: "",
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
    const validatedData = data as DocumentFormData;
    let content: string;

    if (validatedData.type === "EMPLOYMENT_CONTRACT") {
      const selectedEmployee = employees.find(
        (e) => e.id === validatedData.employeeId
      );
      if (!selectedEmployee) {
        toast.error("직원 정보를 찾을 수 없습니다.");
        return;
      }

      const variant = validatedData.contractVariant as ContractVariant;
      const isFixedOT = variant === "FIXED_OT" || variant === "REEMPLOYED";

      // 월 지급액 계산
      const baseSalary = selectedEmployee.baseSalary;
      const mealAllowance = selectedEmployee.mealAllowance;
      const transportAllowance = selectedEmployee.transportAllowance;
      const positionAllowance = selectedEmployee.positionAllowance;
      const fixedOTAmount = isFixedOT
        ? validatedData.fixedOTAmount || 0
        : 0;
      const monthlyTotalGross =
        baseSalary +
        mealAllowance +
        transportAllowance +
        positionAllowance +
        fixedOTAmount;

      const contractContent: EmploymentContractContent = {
        ...COMPANY_INFO,
        contractVariant: variant,
        contractType:
          variant === "REEMPLOYED"
            ? "REEMPLOYED"
            : (selectedEmployee.contractType as
                | "REGULAR"
                | "CONTRACT"
                | "PARTTIME"
                | "REPLACEMENT"),
        isIndefinite: validatedData.isIndefinite,
        contractStartDate: validatedData.contractStartDate,
        contractEndDate: validatedData.contractEndDate,
        probationPeriod: validatedData.probationPeriod ?? 3,
        workingHours: {
          weeklyWorkHours: validatedData.weeklyWorkHours,
          workStartTime: validatedData.workStartTime,
          workEndTime: validatedData.workEndTime,
          breakStartTime: validatedData.breakStartTime || "12:30",
          breakEndTime: validatedData.breakEndTime || "13:30",
          breakMinutes: validatedData.breakMinutes,
          workDays: "주 5일 (월요일~금요일)",
        },
        workLocation: validatedData.workLocation,
        jobDescription: validatedData.jobDescription,
        salary: {
          baseSalary,
          mealAllowance,
          transportAllowance,
          positionAllowance,
          fixedOTAmount: isFixedOT ? fixedOTAmount : undefined,
          taxFreeMeal: selectedEmployee.taxFreeMeal,
          taxFreeTransport: selectedEmployee.taxFreeTransport,
          monthlyTotalGross,
          monthlyStandardHours: 209,
        },
        salaryPayment: {
          paymentDate: validatedData.salaryPaymentDate || "말일",
          paymentMethod: "BANK_TRANSFER",
          bankName: selectedEmployee.bankName || undefined,
          bankAccount: selectedEmployee.bankAccount || undefined,
          calculationPeriodStart: 1,
          calculationPeriodEnd: "말일",
        },
        weeklyRestDay: validatedData.weeklyRestDay || "일요일",
        saturdayOffType: "토요일은 무급 휴무일로 한다.",
        annualLeavePolicy: validatedData.annualLeavePolicy,
        resignationNotice: 30,
        terminationReasons: DEFAULT_TERMINATION_REASONS,
        confidentiality: {
          duringEmployment: true,
          afterEmployment: true,
          civilCriminalLiability: true,
          nonCompetePeriod: 1,
          nonCompeteScope:
            "동종업계나 타회사에 전직 또는 창업",
        },
        specialClauses: {},
        generatedAt: new Date().toISOString(),
      };

      // 재택근무 필드
      if (variant === "REMOTE") {
        contractContent.remoteWork = {
          isRemote: true,
          remoteDays: validatedData.remoteDays || "월, 화, 수, 금요일",
          article58Applied: validatedData.article58Applied ?? true,
          remoteWorkGuidelinesConfirmed:
            validatedData.remoteWorkGuidelinesConfirmed ?? false,
        };
        contractContent.specialClauses.remoteWorkerGuidelines =
          validatedData.remoteWorkGuidelinesConfirmed;
      }

      // 포괄임금제 필드
      if (isFixedOT) {
        contractContent.fixedOT = {
          useFixedOT: true,
          monthlyFixedOTHours: validatedData.fixedOTHours || 20,
          monthlyFixedOTAmount: fixedOTAmount,
          overtimeThreshold: validatedData.overtimeThreshold || 30,
          writtenAgreement: validatedData.fixedOTAgreement ?? false,
        };
        contractContent.specialClauses.performanceBonus = {
          hasClause: true,
          isDiscretionary: true,
          excludedFromAverageWage: true,
        };
      }

      // 시차출퇴근제 필드
      if (isFixedOT && validatedData.useFlexible) {
        contractContent.flexibleSchedule = {
          useFlexible: true,
          flexStartTime: validatedData.flexStartTime || "07:00",
          flexEndTime: validatedData.flexEndTime || "11:00",
          coreStartTime: validatedData.coreStartTime || "11:00",
          coreEndTime: validatedData.coreEndTime || "16:00",
        };
      }

      // 촉탁직 필드
      if (variant === "REEMPLOYED") {
        contractContent.reemployed = {
          isReemployed: true,
          retirementAge: validatedData.retirementAge || 65,
          contractYears: validatedData.contractYears || 3,
          freshStartForSeverance: true,
          freshStartForAnnualLeave: true,
        };
      }

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
  const contractVariant = form.watch("contractVariant") as
    | ContractVariant
    | undefined;
  const useFlexible = form.watch("useFlexible");

  const isFixedOTVariant =
    contractVariant === "FIXED_OT" || contractVariant === "REEMPLOYED";

  // Employee 데이터 자동 불러오기
  const loadEmployeeData = () => {
    const employee = employees.find((e) => e.id === selectedEmployeeId);
    if (!employee) return;

    if (selectedType === "EMPLOYMENT_CONTRACT") {
      form.setValue("weeklyWorkHours", employee.weeklyWorkHours);
      form.setValue("workStartTime", employee.workStartTime);
      form.setValue("workEndTime", employee.workEndTime);
      form.setValue("breakMinutes", employee.breakMinutes);
      form.setValue("contractStartDate", employee.joinDate.toISOString().slice(0, 10));
      form.setValue("employeeAddress", employee.address || "");

      // 포괄임금제 직원인 경우 자동 입력
      if (employee.useFixedOT) {
        form.setValue("fixedOTHours", employee.fixedOTHours || 0);
        form.setValue("fixedOTAmount", employee.fixedOTAmount || 0);
      }

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
                        <SelectItem value="EMPLOYMENT_CONTRACT">
                          근로계약서
                        </SelectItem>
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
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
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

              {/* 자동 불러오기 버튼 */}
              {selectedType === "EMPLOYMENT_CONTRACT" &&
                selectedEmployeeId && (
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

            {/* 2. 근로계약서 유형별 필드 */}
            {selectedType === "EMPLOYMENT_CONTRACT" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  2. 근로계약서 양식 선택
                </h3>

                {/* 계약서 양식 유형 */}
                <FormField
                  control={form.control}
                  name="contractVariant"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>계약서 양식</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value as string}
                          className="grid grid-cols-3 gap-4"
                        >
                          <label
                            htmlFor="variant-remote"
                            className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                              field.value === "REMOTE"
                                ? "border-primary bg-primary/5"
                                : "border-muted"
                            }`}
                          >
                            <RadioGroupItem
                              value="REMOTE"
                              id="variant-remote"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <Home className="h-4 w-4" />
                                <span className="font-medium">재택근무</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                9개 조항, 근로기준법 58조
                              </p>
                            </div>
                          </label>

                          <label
                            htmlFor="variant-fixed-ot"
                            className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                              field.value === "FIXED_OT"
                                ? "border-primary bg-primary/5"
                                : "border-muted"
                            }`}
                          >
                            <RadioGroupItem
                              value="FIXED_OT"
                              id="variant-fixed-ot"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                <span className="font-medium">포괄임금제</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                10개 조항, 고정OT 포함
                              </p>
                            </div>
                          </label>

                          <label
                            htmlFor="variant-reemployed"
                            className={`flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors ${
                              field.value === "REEMPLOYED"
                                ? "border-primary bg-primary/5"
                                : "border-muted"
                            }`}
                          >
                            <RadioGroupItem
                              value="REEMPLOYED"
                              id="variant-reemployed"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                <span className="font-medium">촉탁직</span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                10개 조항, 정년 재고용
                              </p>
                            </div>
                          </label>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />
                <h3 className="text-lg font-semibold">
                  3. 계약 조건
                </h3>

                {/* 계약 유형 */}
                <FormField
                  control={form.control}
                  name="isIndefinite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>계약 유형</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) =>
                            field.onChange(value === "true")
                          }
                          value={field.value ? "true" : "false"}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id="indefinite" />
                            <label htmlFor="indefinite">
                              무기계약 (정규직)
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id="fixed-term" />
                            <label htmlFor="fixed-term">
                              기간제 (계약직)
                            </label>
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

                {/* 수습 기간 */}
                <FormField
                  control={form.control}
                  name="probationPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>수습 기간 (개월)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={6}
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

                {/* 직원 추가 정보 */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>직원 주소 (선택)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="DB에 주소가 없으면 입력"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          비어있으면 DB 정보 사용
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="employeeBirthDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>생년월일 (선택)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormDescription>
                          비어있으면 DB 정보 사용
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 근무 장소 */}
                <FormField
                  control={form.control}
                  name="workLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>근무 장소</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            contractVariant === "REMOTE"
                              ? "본사사무실 및 재택주소"
                              : "본사 사무실"
                          }
                          {...field}
                        />
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
                          placeholder="예: 브랜드 디자인 및 유튜브 등 영상 콘텐츠 기획·제작 업무 전반"
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

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="breakStartTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>휴게 시작</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="breakEndTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>휴게 종료</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* 주휴일 */}
                <FormField
                  control={form.control}
                  name="weeklyRestDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>주휴일</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="주휴일 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="일요일">일요일</SelectItem>
                          <SelectItem value="토요일">토요일</SelectItem>
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
                      <FormLabel>임금 지급일</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="지급일 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SALARY_PAYMENT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        기본: 매월 말일 (휴일인 경우 전일 지급)
                      </FormDescription>
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
                          placeholder="근로기준법에 정하는 바에 따라 부여한다."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        근로기준법 제60조: 1년 근속 시 15일, 이후 2년마다 1일
                        추가
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ══ 재택근무 조건부 필드 ══ */}
                {contractVariant === "REMOTE" && (
                  <>
                    <Separator />
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      재택근무 조건
                    </h3>

                    <FormField
                      control={form.control}
                      name="remoteDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>재택근무 요일</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="예: 월, 화, 수, 금요일"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            재택근로 요일은 변경 가능하다는 조항이 포함됩니다
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="article58Applied"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-amber-50">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              근로기준법 제58조 (근로시간 특례) 적용
                            </FormLabel>
                            <FormDescription>
                              재택근로자의 근로시간 산정이 어려운 경우
                              소정근로시간을 근로한 것으로 봅니다
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="remoteWorkGuidelinesConfirmed"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              재택근로자 근무수칙 확인
                            </FormLabel>
                            <FormDescription>
                              체크 시 제9조에 근무수칙 확인 조항이 추가됩니다
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {/* ══ 포괄임금제 조건부 필드 ══ */}
                {isFixedOTVariant && (
                  <>
                    <Separator />
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      포괄임금제 조건
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fixedOTHours"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              고정 연장근로시간 (월)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={0}
                                max={52}
                                {...field}
                                onChange={(e) =>
                                  field.onChange(Number(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormDescription>
                              예: 20시간 또는 30시간
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fixedOTAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              고정연장근로수당 (원)
                            </FormLabel>
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
                              예: 315,780원 또는 495,210원
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="overtimeThreshold"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            초과 시 별도 정산 기준 (시간)
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            이 시간 초과 시 법정 수당을 별도로 정산합니다
                            (기본: 30시간)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="fixedOTAgreement"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-red-50">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-red-700">
                              포괄산정방식 서면 합의 확인 (필수)
                            </FormLabel>
                            <FormDescription>
                              근로자가 포괄임금 산정 방식에 서면으로 동의함을
                              확인합니다
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* 시차출퇴근제 */}
                    <Separator />
                    <FormField
                      control={form.control}
                      name="useFlexible"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value as boolean}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>시차출퇴근제 적용</FormLabel>
                            <FormDescription>
                              출근 가능 시간대 + 코어타임 방식
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    {useFlexible && (
                      <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20">
                        <FormField
                          control={form.control}
                          name="flexStartTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>출근 가능 시작</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="flexEndTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>출근 가능 종료</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="coreStartTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>코어타임 시작</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="coreEndTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>코어타임 종료</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </>
                )}

                {/* ══ 촉탁직 조건부 필드 ══ */}
                {contractVariant === "REEMPLOYED" && (
                  <>
                    <Separator />
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      촉탁직 재고용 조건
                    </h3>

                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>촉탁직 재고용 계약</AlertTitle>
                      <AlertDescription>
                        정년 퇴직 후 재고용 계약입니다. 퇴직급여 및 연차유급휴가
                        산정기간이 본 계약부터 새로 시작됩니다.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="retirementAge"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>정년 연령 (세)</FormLabel>
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
                        name="contractYears"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>계약 기간 (년)</FormLabel>
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
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 임금명세서 필드 */}
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
                        <FormLabel>월</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            max={12}
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
                </div>
              </div>
            )}

            {/* 공지/기타 필드 */}
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

            {/* 결재라인 */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                {selectedType === "EMPLOYMENT_CONTRACT"
                  ? "4. 결재라인"
                  : "3. 결재라인"}
              </h3>

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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                                  {user.name} (
                                  {user.role === "admin"
                                    ? "관리자"
                                    : "부서장"}
                                  )
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
                    append({
                      approverId: "",
                      approvalOrder: fields.length + 1,
                    })
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
