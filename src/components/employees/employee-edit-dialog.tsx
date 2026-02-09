"use client";

// 직원 정보 수정 Dialog — 탭별 수정 (기본정보, 근무, 급여/보험)
import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { POSITIONS, WORK_TYPES, WEEKDAYS } from "@/lib/constants";
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

export function EmployeeEditDialog({
  employee,
  departments,
}: EmployeeEditDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("info");

  // 기본정보 상태
  const [name, setName] = useState(employee.name);
  const [departmentId, setDepartmentId] = useState(employee.departmentId);
  const [position, setPosition] = useState(employee.position);
  const [email, setEmail] = useState(employee.email || "");
  const [phone, setPhone] = useState(employee.phone || "");

  // 근무정보 상태
  const [workType, setWorkType] = useState(employee.workType);
  const [weeklyWorkHours, setWeeklyWorkHours] = useState(
    String(employee.weeklyWorkHours)
  );
  const [workStartTime, setWorkStartTime] = useState(employee.workStartTime);
  const [workEndTime, setWorkEndTime] = useState(employee.workEndTime);
  const [breakMinutes, setBreakMinutes] = useState(
    String(employee.breakMinutes)
  );
  const [flexStartTime, setFlexStartTime] = useState(
    employee.flexStartTime || ""
  );
  const [flexEndTime, setFlexEndTime] = useState(employee.flexEndTime || "");
  const [remoteWorkDays, setRemoteWorkDays] = useState<string[]>(
    employee.remoteWorkDays ? JSON.parse(employee.remoteWorkDays) : []
  );

  // 급여/보험 상태
  const [salaryType, setSalaryType] = useState(employee.salaryType);
  const [baseSalary, setBaseSalary] = useState(String(employee.baseSalary));
  const [bankName, setBankName] = useState(employee.bankName || "");
  const [bankAccount, setBankAccount] = useState(employee.bankAccount || "");
  const [nationalPension, setNationalPension] = useState(
    employee.nationalPension
  );
  const [healthInsurance, setHealthInsurance] = useState(
    employee.healthInsurance
  );
  const [employmentInsurance, setEmploymentInsurance] = useState(
    employee.employmentInsurance
  );
  const [industrialAccident, setIndustrialAccident] = useState(
    employee.industrialAccident
  );
  const [dependents, setDependents] = useState(String(employee.dependents));

  const handleSaveInfo = () => {
    startTransition(async () => {
      const result = await updateEmployee({
        id: employee.id,
        name,
        departmentId,
        position: position as (typeof POSITIONS)[number],
        email: email || "",
        phone: phone || undefined,
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      toast.success("기본정보가 수정되었습니다.");
      setOpen(false);
    });
  };

  const handleSaveWork = () => {
    startTransition(async () => {
      const result = await updateEmployeeWork({
        id: employee.id,
        workType: workType as keyof typeof WORK_TYPES,
        weeklyWorkHours: parseInt(weeklyWorkHours),
        workStartTime,
        workEndTime,
        breakMinutes: parseInt(breakMinutes),
        flexStartTime: flexStartTime || "",
        flexEndTime: flexEndTime || "",
        remoteWorkDays: remoteWorkDays as ("MON" | "TUE" | "WED" | "THU" | "FRI")[],
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      toast.success("근무정보가 수정되었습니다.");
      setOpen(false);
    });
  };

  const handleSaveSalary = () => {
    startTransition(async () => {
      const result = await updateEmployeeSalary({
        id: employee.id,
        salaryType: salaryType as "MONTHLY" | "HOURLY",
        baseSalary: parseInt(baseSalary),
        bankName: bankName || "",
        bankAccount: bankAccount || "",
        nationalPension,
        healthInsurance,
        employmentInsurance,
        industrialAccident,
        dependents: parseInt(dependents),
      });
      if (result?.serverError) {
        toast.error(result.serverError);
        return;
      }
      toast.success("급여/보험 정보가 수정되었습니다.");
      setOpen(false);
    });
  };

  const toggleRemoteDay = (day: string) => {
    setRemoteWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
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

          {/* 기본정보 탭 */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>부서</Label>
              <Select value={departmentId} onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label>직급</Label>
              <Select value={position} onValueChange={setPosition}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label>이메일</Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>연락처</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <DialogFooter>
              <Button onClick={handleSaveInfo} disabled={isPending}>
                {isPending ? "저장 중..." : "기본정보 저장"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* 근무 탭 */}
          <TabsContent value="work" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>근무유형</Label>
              <Select value={workType} onValueChange={setWorkType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(WORK_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>출근시간</Label>
                <Input
                  type="time"
                  value={workStartTime}
                  onChange={(e) => setWorkStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>퇴근시간</Label>
                <Input
                  type="time"
                  value={workEndTime}
                  onChange={(e) => setWorkEndTime(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>주간 근로시간</Label>
                <Input
                  type="number"
                  value={weeklyWorkHours}
                  onChange={(e) => setWeeklyWorkHours(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>휴게시간(분)</Label>
                <Input
                  type="number"
                  value={breakMinutes}
                  onChange={(e) => setBreakMinutes(e.target.value)}
                />
              </div>
            </div>
            {(workType === "FLEXIBLE_HOURS" || workType === "HYBRID") && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>시차 출근</Label>
                  <Input
                    type="time"
                    value={flexStartTime}
                    onChange={(e) => setFlexStartTime(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>시차 퇴근</Label>
                  <Input
                    type="time"
                    value={flexEndTime}
                    onChange={(e) => setFlexEndTime(e.target.value)}
                  />
                </div>
              </div>
            )}
            {(workType === "REMOTE" || workType === "HYBRID") && (
              <div className="space-y-2">
                <Label>재택근무 요일</Label>
                <div className="flex gap-2">
                  {Object.entries(WEEKDAYS).map(([key, label]) => (
                    <Button
                      key={key}
                      type="button"
                      variant={
                        remoteWorkDays.includes(key) ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => toggleRemoteDay(key)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={handleSaveWork} disabled={isPending}>
                {isPending ? "저장 중..." : "근무정보 저장"}
              </Button>
            </DialogFooter>
          </TabsContent>

          {/* 급여/보험 탭 */}
          <TabsContent value="salary" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>급여유형</Label>
              <Select value={salaryType} onValueChange={setSalaryType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MONTHLY">월급제</SelectItem>
                  <SelectItem value="HOURLY">시급제</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>기본급 (원)</Label>
              <Input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>은행</Label>
                <Input
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="국민은행"
                />
              </div>
              <div className="space-y-2">
                <Label>계좌번호</Label>
                <Input
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value)}
                  placeholder="123-456-789012"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>부양가족 수</Label>
              <Input
                type="number"
                min="0"
                value={dependents}
                onChange={(e) => setDependents(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>4대보험 가입</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    label: "국민연금",
                    checked: nationalPension,
                    onChange: setNationalPension,
                  },
                  {
                    label: "건강보험",
                    checked: healthInsurance,
                    onChange: setHealthInsurance,
                  },
                  {
                    label: "고용보험",
                    checked: employmentInsurance,
                    onChange: setEmploymentInsurance,
                  },
                  {
                    label: "산재보험",
                    checked: industrialAccident,
                    onChange: setIndustrialAccident,
                  },
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center gap-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={(e) => item.onChange(e.target.checked)}
                      className="rounded"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveSalary} disabled={isPending}>
                {isPending ? "저장 중..." : "급여/보험 저장"}
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
