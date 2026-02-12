import { SettingsNav } from "@/components/settings/settings-nav";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title="설정"
        description="프로필 정보와 알림 설정을 관리합니다."
      />

      <div className="flex flex-col md:flex-row gap-6">
        {/* 왼쪽: 설정 네비게이션 */}
        <aside className="w-full md:w-64 shrink-0">
          <SettingsNav />
        </aside>

        {/* 오른쪽: 콘텐츠 영역 */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
