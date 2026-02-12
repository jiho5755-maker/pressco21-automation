import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { NotificationsPageClient } from "@/components/notifications/notifications-page-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "알림 | 사내 자동화 도구",
  description: "웹 알림 목록 조회 및 관리",
};

async function NotificationsContent({
  unreadOnly,
  type,
}: {
  unreadOnly?: boolean;
  type?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="text-center text-muted-foreground py-12">
        로그인이 필요합니다.
      </div>
    );
  }

  const where = {
    recipientId: session.user.id,
    ...(unreadOnly && { isRead: false }),
    ...(type && { type }),
  };

  const [notifications, totalCount, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }], // 미읽음 우선, 최신순
      take: 50, // 최대 50개 표시
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({
      where: {
        recipientId: session.user.id,
        isRead: false,
      },
    }),
  ]);

  return (
    <NotificationsPageClient
      initialNotifications={notifications}
      totalCount={totalCount}
      unreadCount={unreadCount}
    />
  );
}

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ unreadOnly?: string; type?: string }>;
}) {
  const params = await searchParams;
  const unreadOnly = params.unreadOnly === "true";
  const type = params.type;

  return (
    <div className="container mx-auto max-w-4xl py-6 space-y-6">
      <PageHeader
        title="알림"
        description="시스템 알림을 확인하고 관리합니다."
      />

      <Suspense
        fallback={
          <div className="text-center text-muted-foreground py-12">
            로딩 중...
          </div>
        }
      >
        <NotificationsContent unreadOnly={unreadOnly} type={type} />
      </Suspense>
    </div>
  );
}
