import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { NotificationSettingsForm } from "@/components/settings/notification-settings-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "알림 설정 | 사내 자동화 도구",
  description: "이메일 및 웹 알림 수신 방식을 설정합니다.",
};

export default async function NotificationSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // 사용자의 알림 설정 조회 (없으면 null → 기본값 사용)
  const preference = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
    include: { typePreferences: true },
  });

  return (
    <div className="space-y-6">
      <NotificationSettingsForm initialPreference={preference} />
    </div>
  );
}
