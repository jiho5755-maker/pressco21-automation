"use server";

import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { authActionClient, ActionError } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/lib/notification-defaults";
import { createWebNotification } from "@/lib/notification-helper";

// ===== Zod 스키마 =====

const notificationTypes = [
  "APPROVAL_REQUEST",
  "DOCUMENT_APPROVED",
  "DOCUMENT_REJECTED",
  "PAYSLIP_READY",
  "SUBSIDY_APPROVED",
  "LEAVE_APPROVED",
  "LEAVE_REJECTED",
  "EXPENSE_APPROVED",
  "EXPENSE_REJECTED",
  "ATTENDANCE_CONFIRMED",
  "ANNUAL_LEAVE_LOW",
  "CONTRACT_EXPIRING",
  "PROBATION_ENDING",
  "SYSTEM",
] as const;

const notificationTypePreferenceSchema = z.object({
  type: z.enum(notificationTypes),
  emailEnabled: z.boolean(),
  webEnabled: z.boolean(),
});

const updatePreferenceSchema = z.object({
  emailEnabled: z.boolean(), // 전체 이메일 활성화
  webEnabled: z.boolean(), // 전체 웹 활성화
  typePreferences: z.array(notificationTypePreferenceSchema),
});

const testNotificationSchema = z.object({
  type: z.enum(notificationTypes),
});

// ===== Server Actions =====

/**
 * 알림 설정 조회 또는 초기화
 * - 설정이 없으면 기본값으로 자동 생성
 * - 첫 접속 시 호출 (페이지 로드 시 클라이언트에서 useEffect로 호출)
 */
export const getOrInitializePreference = authActionClient.action(
  async ({ ctx }) => {
    const userId = ctx.userId;

    let preference = await prisma.notificationPreference.findUnique({
      where: { userId },
      include: { typePreferences: true },
    });

    // 설정이 없으면 기본값으로 생성
    if (!preference) {
      const created = await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: DEFAULT_NOTIFICATION_PREFERENCES.emailEnabled,
          webEnabled: DEFAULT_NOTIFICATION_PREFERENCES.webEnabled,
          typePreferences: {
            create: DEFAULT_NOTIFICATION_PREFERENCES.typePreferences.map((pref) => ({
              type: pref.type,
              emailEnabled: pref.emailEnabled,
              webEnabled: pref.webEnabled,
            })),
          },
        },
        include: { typePreferences: true },
      });
      preference = created;
    }

    return { preference };
  }
);

/**
 * 알림 설정 업데이트
 * - 전체 채널 토글 + 14개 유형별 설정 한 번에 저장
 */
export const updateNotificationPreference = authActionClient
  .inputSchema(updatePreferenceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx.userId;

    // 기존 설정 조회
    const existing = await prisma.notificationPreference.findUnique({
      where: { userId },
      include: { typePreferences: true },
    });

    if (existing) {
      // 기존 설정이 있으면 업데이트
      await prisma.notificationPreference.update({
        where: { userId },
        data: {
          emailEnabled: parsedInput.emailEnabled,
          webEnabled: parsedInput.webEnabled,
        },
      });

      // typePreferences 전체 삭제 후 재생성 (Upsert 전략)
      await prisma.notificationTypePreference.deleteMany({
        where: { preferenceId: existing.id },
      });

      await prisma.notificationTypePreference.createMany({
        data: parsedInput.typePreferences.map((pref) => ({
          preferenceId: existing.id,
          type: pref.type,
          emailEnabled: pref.emailEnabled,
          webEnabled: pref.webEnabled,
        })),
      });
    } else {
      // 설정이 없으면 생성
      await prisma.notificationPreference.create({
        data: {
          userId,
          emailEnabled: parsedInput.emailEnabled,
          webEnabled: parsedInput.webEnabled,
          typePreferences: {
            create: parsedInput.typePreferences,
          },
        },
      });
    }

    revalidatePath("/settings/notifications");

    return { success: true, message: "알림 설정이 저장되었습니다." };
  });

/**
 * 테스트 알림 발송
 * - 선택한 유형의 테스트 알림을 즉시 발송
 * - 이메일/웹 설정 확인 후 발송
 */
export const sendTestNotification = authActionClient
  .inputSchema(testNotificationSchema)
  .action(async ({ parsedInput, ctx }) => {
    const userId = ctx.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, name: true },
    });

    if (!user) {
      throw new ActionError("사용자를 찾을 수 없습니다.");
    }

    // 테스트 알림 생성
    await createWebNotification({
      recipientId: userId,
      type: parsedInput.type,
      title: `[테스트] ${getNotificationTitle(parsedInput.type)}`,
      message: "알림 설정 테스트 메시지입니다. 정상적으로 수신되었습니다.",
      actionUrl: "/notifications",
    });

    return { success: true, message: "테스트 알림이 발송되었습니다." };
  });

// ===== 헬퍼 함수 =====

function getNotificationTitle(type: string): string {
  const titles: Record<string, string> = {
    APPROVAL_REQUEST: "결재 요청",
    DOCUMENT_APPROVED: "문서 승인",
    DOCUMENT_REJECTED: "문서 반려",
    PAYSLIP_READY: "급여명세서 발급",
    SUBSIDY_APPROVED: "지원금 승인",
    LEAVE_APPROVED: "휴가 승인",
    LEAVE_REJECTED: "휴가 반려",
    EXPENSE_APPROVED: "경비 승인",
    EXPENSE_REJECTED: "경비 반려",
    ATTENDANCE_CONFIRMED: "근태 확정",
    ANNUAL_LEAVE_LOW: "연차 부족",
    CONTRACT_EXPIRING: "계약 만료 임박",
    PROBATION_ENDING: "수습 종료 임박",
    SYSTEM: "시스템 알림",
  };
  return titles[type] || "알림";
}
