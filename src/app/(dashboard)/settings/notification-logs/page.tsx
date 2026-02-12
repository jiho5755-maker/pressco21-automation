/**
 * 알림 로그 관리 페이지 (Admin 전용)
 *
 * Phase 3-D Sub-Task 2-4: 알림 로깅 + 관리 UI
 * - 발송 이력 조회 (필터링 + 페이지네이션)
 * - 성공/실패 상태 표시
 * - 이메일 ID로 Resend 추적
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationLogsClient } from "./client";

export default async function NotificationLogsPage() {
  // 1. 인증 확인
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  // 2. 권한 확인 (Admin 전용)
  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="알림 발송 이력"
        description="이메일 발송 기록을 조회하고 관리합니다."
      />

      <Suspense fallback={<div>로딩 중...</div>}>
        <NotificationLogsClient />
      </Suspense>
    </div>
  );
}
