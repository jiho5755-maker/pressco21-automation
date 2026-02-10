"use client";

// 정부지원사업 관리 클라이언트 래퍼
import { useState, useMemo } from "react";
import { SubsidyStatsCards } from "@/components/subsidies/subsidy-stats-cards";
import { SubsidyFilters } from "@/components/subsidies/subsidy-filters";
import { SubsidyTable } from "@/components/subsidies/subsidy-table";
import { SubsidyFormDialog } from "@/components/subsidies/subsidy-form-dialog";
import type { SubsidyApplication, Employee, Department } from "@prisma/client";

interface SubsidiesPageClientProps {
  applications: Array<
    SubsidyApplication & {
      employee: {
        id: string;
        employeeNo: string;
        name: string;
        departmentId: string;
        department: { name: string };
      };
      submitter: { id: string; name: string | null };
      approver: { id: string; name: string | null } | null;
      replacementEmployee: {
        id: string;
        employeeNo: string;
        name: string;
      } | null;
    }
  >;
  stats: {
    totalCount: number;
    approvedCount: number;
    paidCount: number;
    pendingCount: number;
    totalApprovedAmount: number;
  };
  employees: Array<Employee & { department: Department }>;
}

export function SubsidiesPageClient({
  applications,
  stats,
  employees,
}: SubsidiesPageClientProps) {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedType, setSelectedType] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = 전체

  // 필터링된 신청 목록
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (selectedType !== "ALL" && app.type !== selectedType) return false;
      if (selectedStatus !== "ALL" && app.status !== selectedStatus) return false;
      if (app.year !== selectedYear) return false;
      if (selectedMonth !== 0 && app.month !== selectedMonth) return false;
      return true;
    });
  }, [applications, selectedType, selectedStatus, selectedYear, selectedMonth]);

  // 필터링된 통계 재계산
  const filteredStats = useMemo(() => {
    return {
      totalCount: filteredApplications.length,
      approvedCount: filteredApplications.filter((a) => a.status === "APPROVED")
        .length,
      paidCount: filteredApplications.filter((a) => a.status === "PAID").length,
      pendingCount: filteredApplications.filter((a) => a.status === "PENDING")
        .length,
      totalApprovedAmount: filteredApplications
        .filter((a) => a.status === "APPROVED" || a.status === "PAID")
        .reduce((sum, a) => sum + (a.approvedAmount || 0), 0),
    };
  }, [filteredApplications]);

  const handleReset = () => {
    setSelectedType("ALL");
    setSelectedStatus("ALL");
    setSelectedYear(currentYear);
    setSelectedMonth(0);
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <SubsidyStatsCards stats={filteredStats} />

      {/* 필터 + 신청 버튼 */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <SubsidyFilters
          selectedType={selectedType}
          selectedStatus={selectedStatus}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onTypeChange={setSelectedType}
          onStatusChange={setSelectedStatus}
          onYearChange={setSelectedYear}
          onMonthChange={setSelectedMonth}
          onReset={handleReset}
        />
        <SubsidyFormDialog employees={employees} />
      </div>

      {/* 테이블 */}
      <SubsidyTable applications={filteredApplications} />
    </div>
  );
}
