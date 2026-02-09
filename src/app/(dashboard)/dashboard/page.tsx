// 대시보드 홈 — 환영 메시지 + 통계 카드
import { auth } from "@/lib/auth";
import { Activity, Package, ShoppingCart, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "사용자";

  return (
    <>
      <PageHeader
        title={`안녕하세요, ${userName}님`}
        description="오늘의 현황을 확인하세요."
      />

      {/* 통계 카드 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="총 주문"
          value="1,234"
          description="전월 대비 +12.5%"
          icon={<ShoppingCart className="h-4 w-4" />}
        />
        <StatCard
          title="총 상품"
          value="567"
          description="활성 상품 수"
          icon={<Package className="h-4 w-4" />}
        />
        <StatCard
          title="방문자"
          value="8,901"
          description="오늘 방문자 수"
          icon={<Users className="h-4 w-4" />}
        />
        <StatCard
          title="전환율"
          value="3.2%"
          description="전월 대비 +0.5%"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      {/* 빠른 바로가기 */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">빠른 시작</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">새 기능 추가하기</h3>
            <p className="text-sm text-muted-foreground mt-1">
              이 스타터킷을 기반으로 필요한 기능을 추가하세요.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">API 연동하기</h3>
            <p className="text-sm text-muted-foreground mt-1">
              외부 API와 연동하여 데이터를 자동으로 관리하세요.
            </p>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="font-medium">설정 관리</h3>
            <p className="text-sm text-muted-foreground mt-1">
              프로필 및 시스템 설정을 관리하세요.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
