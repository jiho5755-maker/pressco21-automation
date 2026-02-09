// 휴가 관리 필터 컴포넌트
"use client";

import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";

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

interface LeaveFiltersProps {
  employees: Array<{
    id: string;
    employeeNo: string;
    name: string;
  }>;
  selectedEmployee: string;
  selectedType: string;
  selectedStatus: string;
  selectedMonth: Date;
  onEmployeeChange: (employeeId: string) => void;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onMonthChange: (month: Date) => void;
}

export function LeaveFilters({
  employees,
  selectedEmployee,
  selectedType,
  selectedStatus,
  selectedMonth,
  onEmployeeChange,
  onTypeChange,
  onStatusChange,
  onMonthChange,
}: LeaveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-end">
      {/* 직원 선택 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="employee" className="text-sm font-medium">
          직원
        </Label>
        <Select value={selectedEmployee} onValueChange={onEmployeeChange}>
          <SelectTrigger id="employee" className="w-[180px]">
            <SelectValue placeholder="전체 직원" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 직원</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name} ({emp.employeeNo})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 휴가 유형 선택 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="type" className="text-sm font-medium">
          유형
        </Label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger id="type" className="w-[180px]">
            <SelectValue placeholder="전체 유형" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 유형</SelectItem>
            <SelectItem value="ANNUAL">연차</SelectItem>
            <SelectItem value="MATERNITY">출산휴가</SelectItem>
            <SelectItem value="PARENTAL">육아휴직</SelectItem>
            <SelectItem value="SPOUSE_MATERNITY">배우자출산휴가</SelectItem>
            <SelectItem value="SICK">병가</SelectItem>
            <SelectItem value="PERSONAL">개인사유</SelectItem>
            <SelectItem value="COMPENSATORY">대체휴무</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 상태 선택 */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="status" className="text-sm font-medium">
          상태
        </Label>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger id="status" className="w-[150px]">
            <SelectValue placeholder="전체 상태" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            <SelectItem value="PENDING">대기</SelectItem>
            <SelectItem value="APPROVED">승인</SelectItem>
            <SelectItem value="REJECTED">반려</SelectItem>
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
                "w-[180px] justify-start text-left font-normal",
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
