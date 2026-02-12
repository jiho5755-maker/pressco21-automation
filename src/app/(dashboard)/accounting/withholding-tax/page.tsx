"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { WithholdingTaxSummaryTable } from "@/components/accounting/withholding-tax-summary-table";
import { WithholdingTaxFilter } from "@/components/accounting/withholding-tax-filter";
import { Card, CardContent } from "@/components/ui/card";
import { aggregateWithholdingTax } from "@/lib/withholding-tax-aggregator";
import type { MonthlyWithholdingSummary } from "@/lib/withholding-tax-aggregator";
import { useSession } from "next-auth/react";

export default function WithholdingTaxPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [summary, setSummary] = useState<MonthlyWithholdingSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // RBAC 검증
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  // 데이터 로딩
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/accounting/withholding-tax?year=${year}`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const records = await response.json();
        const aggregated = aggregateWithholdingTax(records);
        setSummary(aggregated);
      } catch (error) {
        console.error("Failed to load withholding tax data:", error);
        setSummary([]);
      } finally {
        setLoading(false);
      }
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      loadData();
    }
  }, [year, status, session]);

  if (status === "loading") {
    return <div>로딩 중...</div>;
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="원천징수 세액 관리"
        description="월별 원천징수 세액을 집계하고 Excel로 내보냅니다"
      />

      <WithholdingTaxFilter year={year} onYearChange={setYear} />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              로딩 중...
            </div>
          ) : summary.length > 0 ? (
            <WithholdingTaxSummaryTable summary={summary} year={year} />
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {year}년 급여 기록이 없습니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
