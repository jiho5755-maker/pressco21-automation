"use client";

// 직원 추가 Dialog — Server Action + DB 저장
import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function AddEmployeeDialog({ departments }: AddEmployeeDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [position, setPosition] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !departmentId || !position || !joinDate) {
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }

    startTransition(async () => {
      const result = await createEmployee({
        name: name.trim(),
        departmentId,
        position: position as (typeof POSITIONS)[number],
        joinDate,
        email: email || undefined,
        phone: phone || undefined,
      });

      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }

      toast.success(`${name}님이 직원 목록에 추가되었습니다.`);
      setOpen(false);
      resetForm();
    });
  };

  const resetForm = () => {
    setName("");
    setDepartmentId("");
    setPosition("");
    setJoinDate("");
    setEmail("");
    setPhone("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          직원 추가
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>직원 추가</DialogTitle>
          <DialogDescription>
            새 직원의 기본 정보를 입력하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emp-name">이름 *</Label>
            <Input
              id="emp-name"
              placeholder="홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-department">부서 *</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger id="emp-department">
                <SelectValue placeholder="부서 선택" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-position">직급 *</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger id="emp-position">
                <SelectValue placeholder="직급 선택" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map((pos) => (
                  <SelectItem key={pos} value={pos}>
                    {pos}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-join-date">입사일 *</Label>
            <Input
              id="emp-join-date"
              type="date"
              value={joinDate}
              onChange={(e) => setJoinDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-email">이메일</Label>
            <Input
              id="emp-email"
              type="email"
              placeholder="example@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="emp-phone">연락처</Label>
            <Input
              id="emp-phone"
              placeholder="010-0000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "추가 중..." : "추가하기"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
