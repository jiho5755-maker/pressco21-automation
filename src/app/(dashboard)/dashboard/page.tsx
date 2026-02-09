// 대시보드 홈 — DB 통계 기반
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Briefcase,
  Clock,
  Receipt,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "사용자";

  // DB 통계 병렬 조회
  const [
    activeCount,
    onLeaveCount,
    flexWorkCount,
    pendingExpenseCount,
    totalEmployees,
  ] = await Promise.all([
    prisma.employee.count({ where: { status: "ACTIVE" } }),
    prisma.employee.count({ where: { status: "ON_LEAVE" } }),
    prisma.employee.count({
      where: {
        status: "ACTIVE",
        workType: { not: "OFFICE" },
      },
    }),
    prisma.expense.count({ where: { status: "PENDING" } }),
    prisma.employee.count(),
  ]);

  return (
    <>
      <PageHeader
        title={`안녕하세요, ${userName}님`}
        description="오늘의 현황을 확인하세요."
      />

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="재직 직원"
          value={`${activeCount}명`}
          description={`총 ${totalEmployees}명 중 재직`}
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="휴직자"
          value={`${onLeaveCount}명`}
          description="출산/육아/병가 등"
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="유연근무"
          value={`${flexWorkCount}명`}
          description="시차출퇴근/재택/하이브리드"
          icon={<Briefcase className="h-4 w-4" />}
        />
        <StatCard
          title="미처리 경비"
          value={`${pendingExpenseCount}건`}
          description="승인 대기 중"
          icon={<Receipt className="h-4 w-4" />}
        />
      </div>

      {/* 빠른 바로가기 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">빠른 시작</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">직원 관리</h3>
            <p className="text-sm text-muted-foreground mt-1">
              직원 정보 조회, 추가 및 유연근무 설정을 관리하세요.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">경비 신청</h3>
            <p className="text-sm text-muted-foreground mt-1">
              경비를 신청하고 승인/반려 현황을 확인하세요.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">설정</h3>
            <p className="text-sm text-muted-foreground mt-1">
              프로필 정보와 시스템 설정을 관리하세요.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
