"use client";

import { ChartCard } from "@/components/dashboard/chart-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface AttendanceData {
  week: string;
  onTime: number;
  late: number;
  absent: number;
}

interface AttendanceChartProps {
  data: AttendanceData[];
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <ChartCard title="주별 근태 현황" description="정상출근, 지각, 결근 비율">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip labelStyle={{ color: "black" }} />
          <Legend />
          <Bar dataKey="onTime" fill="hsl(var(--chart-1))" name="정상출근" />
          <Bar dataKey="late" fill="hsl(var(--chart-3))" name="지각" />
          <Bar dataKey="absent" fill="hsl(var(--chart-5))" name="결근" />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
