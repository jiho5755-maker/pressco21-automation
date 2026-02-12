/**
 * 연차 부족 경고 Cron Job
 *
 * 스케줄: 매월 1일 오전 9시 (KST)
 * 대상: 잔여 연차 3일 이하 재직자
 * 알림: ANNUAL_LEAVE_LOW
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWebNotification } from "@/lib/notification-helper";
import { getAnnualLeaveSummary } from "@/lib/leave-calculator";

export async function GET(request: Request) {
  // Vercel Cron Secret 검증 (프로덕션 환경)
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production") {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    // 재직 중인 직원 조회
    const employees = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
        userId: { not: null }, // userId가 있어야 알림 발송 가능
      },
      include: {
        leaveRecords: {
          where: {
            status: { in: ["APPROVED", "PENDING"] },
          },
        },
      },
    });

    let notifiedCount = 0;

    for (const employee of employees) {
      // 연차 요약 계산
      const summary = getAnnualLeaveSummary(
        employee.joinDate,
        employee.leaveRecords
      );

      // 잔여 연차 3일 이하인 경우 알림
      if (summary.remaining <= 3 && employee.userId) {
        await createWebNotification({
          recipientId: employee.userId,
          type: "ANNUAL_LEAVE_LOW",
          title: "연차 부족 알림",
          message: `잔여 연차가 ${summary.remaining}일 남았습니다. 연차를 계획적으로 사용하세요.`,
          relatedEntityType: "Employee",
          relatedEntityId: employee.id,
          actionUrl: "/leaves",
        });

        notifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `연차 부족 경고 발송 완료 (${notifiedCount}명)`,
      notifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("연차 부족 경고 Cron Job 실패:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
