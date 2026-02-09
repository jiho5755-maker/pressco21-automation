"use client";

// 직원 추가 Dialog — Zod + React Hook Form + Server Action
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useAction } from "next-safe-action/hooks";
import { Plus } from "lucide-react";
import { toast } from "sonner";
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
import { POSITIONS } from "@/lib/constants";
import { createEmployee } from "@/actions/employee-actions";
import type { Department } from "@prisma/client";

interface AddEmployeeDialogProps {
  departments: Department[];
}

// Zod 스키마 정의 (Server Action 스키마와 동일)
const formSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상 입력해주세요."),
  departmentId: z.string().min(1, "부서를 선택해주세요."),
  position: z.enum(POSITIONS, { message: "직급을 선택해주세요." }),
  joinDate: z.string().min(1, "입사일을 입력해주세요."),
  email: z
    .string()
    .email("올바른 이메일 형식이 아닙니다.")
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional().or(z.literal("")),
  childrenUnder20: z.number().int().min(0).max(20),
  contractType: z.enum(["REGULAR", "CONTRACT", "PARTTIME", "REPLACEMENT"]),
});

type FormValues = z.infer<typeof formSchema>;

export function AddEmployeeDialog({ departments }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      departmentId: "",
      position: undefined,
      joinDate: "",
      email: "",
      phone: "",
      address: "",
      childrenUnder20: 0,
      contractType: "REGULAR",
    },
  });

  const { execute, isPending } = useAction(createEmployee, {
    onSuccess: ({ data }) => {
      toast.success(`${data?.employee.name}님이 직원 목록에 추가되었습니다.`);
      setOpen(false);
      form.reset();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "직원 추가에 실패했습니다.");
    },
  });

  const onSubmit = (data: FormValues) => {
    execute(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          직원 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>직원 추가</DialogTitle>
          <DialogDescription>
            새 직원의 기본 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름 *</FormLabel>
                  <FormControl>
                    <Input placeholder="홍길동" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>부서 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="부서 선택" />
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
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>직급 *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="직급 선택" />
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
              control={form.control}
              name="joinDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>입사일 *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이메일</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@company.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>연락처</FormLabel>
                  <FormControl>
                    <Input placeholder="010-0000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>주소</FormLabel>
                  <FormControl>
                    <Input placeholder="서울특별시 강남구..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
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
                  <FormDescription>
                    자녀세액공제 계산에 사용됩니다.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contractType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>계약 형태</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="계약 형태 선택" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="REGULAR">정규직</SelectItem>
                      <SelectItem value="CONTRACT">계약직</SelectItem>
                      <SelectItem value="PARTTIME">시간제</SelectItem>
                      <SelectItem value="REPLACEMENT">대체인력</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                {isPending ? "추가 중..." : "추가하기"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
