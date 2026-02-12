"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface WithholdingTaxFilterProps {
  year: number;
  onYearChange: (year: number) => void;
}

export function WithholdingTaxFilter({
  year,
  onYearChange,
}: WithholdingTaxFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="flex items-center gap-4">
      <Label htmlFor="year-filter">연도</Label>
      <Select
        value={year.toString()}
        onValueChange={(value) => onYearChange(parseInt(value))}
      >
        <SelectTrigger id="year-filter" className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}년
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
