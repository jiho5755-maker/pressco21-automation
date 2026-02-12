// 설정 페이지 — 세션 기반 역할 표시
import { auth } from "@/lib/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const roleLabels: Record<string, string> = {
  admin: "관리자",
  manager: "매니저",
  viewer: "뷰어",
};

export default async function SettingsPage() {
  const session = await auth();
  const role = session?.user?.role || "viewer";

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        {/* 프로필 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>프로필 정보</CardTitle>
            <CardDescription>
              현재 로그인된 계정 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">이름</span>
              <span className="text-sm font-medium">
                {session?.user?.name || "알 수 없음"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">이메일</span>
              <span className="text-sm font-medium">
                {session?.user?.email || "알 수 없음"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">역할</span>
              <Badge variant="secondary">
                {roleLabels[role] || role}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* 시스템 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>시스템 정보</CardTitle>
            <CardDescription>
              시스템 버전 및 환경 정보입니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">버전</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">프레임워크</span>
              <span className="text-sm font-medium">Next.js 15</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">환경</span>
              <Badge variant="outline">
                {process.env.NODE_ENV === "production" ? "운영" : "개발"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
