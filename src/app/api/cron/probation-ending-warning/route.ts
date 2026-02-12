/**
 * 수습 종료 임박 경고 Cron Job
 *
 * 스케줄: 매일 오전 9시 (KST)
 * 대상: 수습 종료 14일 이내 직원
 * 알림: PROBATION_ENDING
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWebNotification } from "@/lib/notification-helper";
import { differenceInDays, addDays } from "date-fns";

export async function GET(request: Request) {
  // Vercel Cron Secret 검증 (프로덕션 환경)
  const authHeader = request.headers.get("authorization");
  if (process.env.NODE_ENV === "production") {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const today = new Date();
    const fourteenDaysLater = addDays(today, 14);

    // 수습 종료일이 14일 이내인 직원 조회
    const employees = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
        probationEnd: {
          not: null,
          lte: fourteenDaysLater, // 14일 이내 종료
          gte: today, // 이미 종료된 수습 제외
        },
        userId: { not: null },
      },
    });

    let notifiedCount = 0;

    for (const employee of employees) {
      if (!employee.probationEnd || !employee.userId) continue;

      const daysRemaining = differenceInDays(
        employee.probationEnd,
        today
      );

      // 14일, 7일, 3일, 1일 남았을 때만 알림
      if ([14, 7, 3, 1].includes(daysRemaining)) {
        await createWebNotification({
          recipientId: employee.userId,
          type: "PROBATION_ENDING",
          title: "수습 종료 임박",
          message: `수습 기간이 ${daysRemaining}일 후 종료됩니다. 평가 준비를 해주세요.`,
          relatedEntityType: "Employee",
          relatedEntityId: employee.id,
          actionUrl: `/employees/${employee.id}`,
        });

        notifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `수습 종료 경고 발송 완료 (${notifiedCount}명)`,
      notifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("수습 종료 경고 Cron Job 실패:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
