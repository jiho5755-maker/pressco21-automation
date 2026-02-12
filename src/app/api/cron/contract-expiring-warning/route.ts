/**
 * 계약 만료 임박 경고 Cron Job
 *
 * 스케줄: 매일 오전 9시 (KST)
 * 대상: 계약 만료 30일 이내 직원
 * 알림: CONTRACT_EXPIRING
 */

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createWebNotification } from "@/lib/notification-helper";
import { differenceInDays, isBefore, addDays } from "date-fns";

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
    const thirtyDaysLater = addDays(today, 30);

    // 계약 만료일이 30일 이내인 직원 조회
    const employees = await prisma.employee.findMany({
      where: {
        status: "ACTIVE",
        contractType: "FIXED_TERM", // 기간제 근로자만
        contractEndDate: {
          not: null,
          lte: thirtyDaysLater, // 30일 이내 만료
          gte: today, // 이미 만료된 계약 제외
        },
        userId: { not: null },
      },
    });

    let notifiedCount = 0;

    for (const employee of employees) {
      if (!employee.contractEndDate || !employee.userId) continue;

      const daysRemaining = differenceInDays(
        employee.contractEndDate,
        today
      );

      // 30일, 14일, 7일, 3일, 1일 남았을 때만 알림
      if ([30, 14, 7, 3, 1].includes(daysRemaining)) {
        await createWebNotification({
          recipientId: employee.userId,
          type: "CONTRACT_EXPIRING",
          title: "계약 만료 임박",
          message: `근로계약이 ${daysRemaining}일 후 만료됩니다. 인사팀에 문의하세요.`,
          relatedEntityType: "Employee",
          relatedEntityId: employee.id,
          actionUrl: `/employees/${employee.id}`,
        });

        notifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `계약 만료 경고 발송 완료 (${notifiedCount}명)`,
      notifiedCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("계약 만료 경고 Cron Job 실패:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
