// 대시보드 홈 — RBAC 기반 역할별 대시보드
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { DashboardAdmin } from "@/components/dashboard/dashboard-admin";
import { DashboardManager } from "@/components/dashboard/dashboard-manager";
import { DashboardViewer } from "@/components/dashboard/dashboard-viewer";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "사용자";
  const userId = session?.user?.id || "";
  const role = session?.user?.role || "viewer";

  // 현재 연/월 (기본값)
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  return (
    <>
      <PageHeader
        title={`안녕하세요, ${userName}님`}
        description="오늘의 현황을 확인하세요."
      />

      {/* RBAC 기반 대시보드 렌더링 */}
      {role === "admin" && (
        <DashboardAdmin userId={userId} year={year} month={month} />
      )}
      {role === "manager" && (
        <DashboardManager userId={userId} year={year} month={month} />
      )}
      {role === "viewer" && (
        <DashboardViewer userId={userId} year={year} month={month} />
      )}

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
