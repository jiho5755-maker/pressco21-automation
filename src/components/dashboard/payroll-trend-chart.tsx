"use client";

import { ChartCard } from "@/components/dashboard/chart-card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/salary-calculator";

interface PayrollTrendData {
  month: string;
  totalGross: number;
  netSalary: number;
}

interface PayrollTrendChartProps {
  data: PayrollTrendData[];
}

export function PayrollTrendChart({ data }: PayrollTrendChartProps) {
  return (
    <ChartCard title="월별 급여 추이" description="최근 6개월 총급여 및 실수령액">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
          <Tooltip
            formatter={(value) => formatCurrency(value as number)}
            labelStyle={{ color: "black" }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="totalGross"
            stroke="hsl(var(--primary))"
            name="총급여"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="netSalary"
            stroke="hsl(var(--chart-2))"
            name="실수령액"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
