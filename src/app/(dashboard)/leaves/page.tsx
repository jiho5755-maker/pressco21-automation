// 휴가 관리 페이지
import { Suspense } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { prisma } from "@/lib/prisma";
import { LeavesPageClient } from "./client";

export default async function LeavesPage() {
  // 1. 휴가 기록 조회 (전체 기간, 최근 6개월)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const leaveRecords = await prisma.leaveRecord.findMany({
    where: {
      requestedAt: {
        gte: sixMonthsAgo, // 최근 6개월
      },
    },
    include: {
      employee: {
        select: {
          id: true,
          employeeNo: true,
          name: true,
        },
      },
      approver: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      requestedAt: "desc",
    },
  });

  // 2. 통계 계산
  const stats = {
    totalCount: leaveRecords.length,
    approvedCount: leaveRecords.filter((r) => r.status === "APPROVED").length,
    pendingCount: leaveRecords.filter((r) => r.status === "PENDING").length,
    rejectedCount: leaveRecords.filter((r) => r.status === "REJECTED").length,
  };

  // 3. 직원 목록 조회 (재직자만, department 포함)
  const employees = await prisma.employee.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      department: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <>
      <PageHeader
        title="휴가 관리"
        description="휴가 신청 및 승인 현황을 관리합니다."
      />

      <Suspense fallback={<div>로딩 중...</div>}>
        <LeavesPageClient
          leaveRecords={leaveRecords}
          stats={stats}
          employees={employees}
        />
      </Suspense>
    </>
  );
}
