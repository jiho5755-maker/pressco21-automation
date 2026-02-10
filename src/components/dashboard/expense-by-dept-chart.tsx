"use client";

import { ChartCard } from "@/components/dashboard/chart-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/salary-calculator";

interface ExpenseByDeptData {
  department: string;
  amount: number;
}

interface ExpenseByDeptChartProps {
  data: ExpenseByDeptData[];
}

export function ExpenseByDeptChart({ data }: ExpenseByDeptChartProps) {
  return (
    <ChartCard title="부서별 경비" description="당월 승인된 경비 기준">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="department" />
          <YAxis tickFormatter={(value) => `${(value / 10000).toFixed(0)}만`} />
          <Tooltip
            formatter={(value) => formatCurrency(value as number)}
            labelStyle={{ color: "black" }}
          />
          <Bar dataKey="amount" fill="hsl(var(--primary))" name="경비" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
