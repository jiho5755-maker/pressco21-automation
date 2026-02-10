"use client";

// 정부지원사업 필터 컴포넌트
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SUBSIDY_TYPES, SUBSIDY_STATUS } from "@/lib/constants";
import { X } from "lucide-react";

interface SubsidyFiltersProps {
  selectedType: string;
  selectedStatus: string;
  selectedYear: number;
  selectedMonth: number;
  onTypeChange: (type: string) => void;
  onStatusChange: (status: string) => void;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  onReset: () => void;
}

export function SubsidyFilters({
  selectedType,
  selectedStatus,
  selectedYear,
  selectedMonth,
  onTypeChange,
  onStatusChange,
  onYearChange,
  onMonthChange,
  onReset,
}: SubsidyFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* 유형 필터 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">지원금 유형</label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {Object.entries(SUBSIDY_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 상태 필터 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">상태</label>
        <Select value={selectedStatus} onValueChange={onStatusChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">전체</SelectItem>
            {Object.entries(SUBSIDY_STATUS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 연도 필터 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">연도</label>
        <Select
          value={selectedYear.toString()}
          onValueChange={(v) => onYearChange(Number(v))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}년
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 월 필터 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">월</label>
        <Select
          value={selectedMonth.toString()}
          onValueChange={(v) => onMonthChange(Number(v))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">전체</SelectItem>
            {months.map((month) => (
              <SelectItem key={month} value={month.toString()}>
                {month}월
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 필터 초기화 */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium opacity-0">Reset</label>
        <Button variant="outline" size="sm" onClick={onReset}>
          <X className="mr-2 h-4 w-4" />
          초기화
        </Button>
      </div>
    </div>
  );
}
