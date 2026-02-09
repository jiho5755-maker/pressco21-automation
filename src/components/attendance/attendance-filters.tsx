"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import type { Employee, Department } from "@prisma/client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type EmployeeWithDepartment = Employee & {
  department: Department;
};

interface AttendanceFiltersProps {
  departments: Department[];
  employees: EmployeeWithDepartment[];
  selectedDepartment: string;
  selectedEmployee: string;
  selectedMonth: Date;
  onDepartmentChange: (departmentId: string) => void;
  onEmployeeChange: (employeeId: string) => void;
  onMonthChange: (month: Date) => void;
}

export function AttendanceFilters({
  departments,
  employees,
  selectedDepartment,
  selectedEmployee,
  selectedMonth,
  onDepartmentChange,
  onEmployeeChange,
  onMonthChange,
}: AttendanceFiltersProps) {
  // 부서별 직원 필터링
  const filteredEmployees = selectedDepartment
    ? employees.filter((emp) => emp.departmentId === selectedDepartment)
    : employees;

  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* 부서 선택 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="department" className="text-sm font-medium">
          부서
        </Label>
        <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
          <SelectTrigger id="department" className="w-[180px]">
            <SelectValue placeholder="전체 부서" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">전체 부서</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept.id} value={dept.id}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 직원 선택 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="employee" className="text-sm font-medium">
          직원
        </Label>
        <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
          <SelectTrigger id="employee" className="w-[200px]">
            <SelectValue placeholder="전체 직원" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">전체 직원</SelectItem>
            {filteredEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name} ({emp.department.name})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 월 선택 */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">월</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !selectedMonth && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedMonth
                ? format(selectedMonth, "yyyy년 M월", { locale: ko })
                : "월 선택"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedMonth}
              onSelect={(date) => date && onMonthChange(date)}
              initialFocus
              disabled={(date) => date > new Date()}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
