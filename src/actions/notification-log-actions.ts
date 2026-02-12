/**
 * 알림 로그 관리 Server Actions
 *
 * Phase 3-D Sub-Task 2-4: 알림 로깅 + 관리 UI
 * - 알림 로그 조회 (필터링 + 페이지네이션)
 * - 실패한 알림 재발송
 */

"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ActionError } from "@/lib/safe-action";
import type { NotificationLog, User, Prisma } from "@prisma/client";

// ============================================================================
// 타입 정의
// ============================================================================

export type NotificationLogWithRecipient = NotificationLog & {
  recipient: Pick<User, "id" | "email" | "role"> & {
    employee: {
      name: string;
    } | null;
  };
};

export type GetNotificationLogsParams = {
  // 필터
  type?: string;
  success?: boolean;
  recipientId?: string;
  startDate?: string; // ISO 날짜
  endDate?: string; // ISO 날짜

  // 페이지네이션
  page?: number;
  limit?: number;
};

export type GetNotificationLogsResult = {
  logs: NotificationLogWithRecipient[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

// ============================================================================
// Server Actions
// ============================================================================

/**
 * 알림 로그 조회 (Admin 전용)
 *
 * 필터링 + 페이지네이션 지원
 *
 * @param params - 조회 파라미터 (필터, 페이지네이션)
 * @returns 알림 로그 목록 + 페이지네이션 정보
 */
export async function getNotificationLogs(
  params: GetNotificationLogsParams = {}
): Promise<GetNotificationLogsResult> {
  try {
    // 1. 인증 확인
    const session = await auth();
    if (!session?.user) {
      throw new ActionError("인증이 필요합니다.");
    }

    // 2. 권한 확인 (Admin 전용)
    if (session.user.role !== "admin") {
      throw new ActionError("관리자만 알림 로그를 조회할 수 있습니다.");
    }

    // 3. 필터 조건 구성
    const where: Prisma.NotificationLogWhereInput = {};

    if (params.type) {
      where.type = params.type;
    }

    if (params.success !== undefined) {
      where.success = params.success;
    }

    if (params.recipientId) {
      where.recipientId = params.recipientId;
    }

    if (params.startDate || params.endDate) {
      where.sentAt = {};
      if (params.startDate) {
        where.sentAt.gte = new Date(params.startDate);
      }
      if (params.endDate) {
        where.sentAt.lte = new Date(params.endDate);
      }
    }

    // 4. 페이지네이션
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    // 5. 총 개수 조회
    const total = await prisma.notificationLog.count({ where });

    // 6. 로그 조회 (수신자 정보 포함)
    const logs = await prisma.notificationLog.findMany({
      where,
      include: {
        recipient: {
          select: {
            id: true,
            email: true,
            role: true,
            employee: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        sentAt: "desc",
      },
      skip,
      take: limit,
    });

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("[getNotificationLogs 오류]", { error });

    if (error instanceof ActionError) {
      throw error;
    }

    throw new ActionError("알림 로그 조회 중 오류가 발생했습니다.");
  }
}

/**
 * 알림 유형 목록 조회 (Admin 전용)
 *
 * 통계용: 어떤 알림 유형이 있는지 조회
 *
 * @returns 알림 유형 배열 (중복 제거)
 */
export async function getNotificationTypes(): Promise<string[]> {
  try {
    // 1. 인증 확인
    const session = await auth();
    if (!session?.user) {
      throw new ActionError("인증이 필요합니다.");
    }

    // 2. 권한 확인 (Admin 전용)
    if (session.user.role !== "admin") {
      throw new ActionError("관리자만 알림 유형을 조회할 수 있습니다.");
    }

    // 3. 유형 목록 조회 (중복 제거)
    const types = await prisma.notificationLog.findMany({
      select: {
        type: true,
      },
      distinct: ["type"],
      orderBy: {
        type: "asc",
      },
    });

    return types.map((t) => t.type);
  } catch (error) {
    console.error("[getNotificationTypes 오류]", { error });

    if (error instanceof ActionError) {
      throw error;
    }

    throw new ActionError("알림 유형 조회 중 오류가 발생했습니다.");
  }
}
