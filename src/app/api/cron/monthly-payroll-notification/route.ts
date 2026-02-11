/**
 * Vercel Cron: 월간 급여명세서 이메일 자동 발송
 *
 * Phase 3-D: 알림 시스템
 * - 매월 25일 오전 9시 자동 실행
 * - 전월 급여명세서 발송 (예: 2월 25일 → 2월분 급여명세서)
 * - CRON_SECRET 인증 필수
 *
 * **Vercel Cron 설정** (vercel.json):
 * ```json
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/monthly-payroll-notification",
 *       "schedule": "0 9 25 * *"
 *     }
 *   ]
 * }
 * ```
 *
 * **환경변수** (.env.local, Vercel 환경변수):
 * - `CRON_SECRET`: Cron 인증 토큰 (랜덤 문자열)
 * - `RESEND_API_KEY`: Resend API 키
 * - `RESEND_FROM_EMAIL`: 발신 이메일 주소
 *
 * **로컬 테스트** (curl):
 * ```bash
 * curl http://localhost:3000/api/cron/monthly-payroll-notification \
 *   -H "Authorization: Bearer <CRON_SECRET>"
 * ```
 */

import { NextRequest, NextResponse } from "next/server";
import { sendBatchPayrollStatements } from "@/actions/notification-actions";

/**
 * Cron Job: 급여명세서 배치 발송
 *
 * @param request - Next.js Request 객체
 * @returns JSON 응답 (성공 여부, 발송 건수, 오류)
 */
export async function GET(request: NextRequest) {
  try {
    // 1. 인증 확인 (CRON_SECRET)
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Cron] CRON_SECRET 환경변수가 설정되지 않았습니다.");
      return NextResponse.json(
        { success: false, error: "CRON_SECRET이 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error("[Cron] 인증 실패", { authHeader });
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. 현재 연월 (급여일 25일 기준, 해당 월 급여명세서 발송)
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // JavaScript month는 0-based

    console.log("[Cron] 급여명세서 배치 발송 시작", {
      year,
      month,
      timestamp: now.toISOString(),
    });

    // 3. 배치 발송
    const result = await sendBatchPayrollStatements(year, month);

    // 4. 결과 반환
    if (result.success) {
      console.log("[Cron] 급여명세서 배치 발송 완료", {
        year,
        month,
        totalSent: result.totalSent,
      });

      return NextResponse.json({
        success: true,
        message: `${year}년 ${month}월 급여명세서 ${result.totalSent}건 발송 완료`,
        data: {
          year,
          month,
          totalSent: result.totalSent,
          totalFailed: result.totalFailed,
        },
      });
    } else {
      console.error("[Cron] 급여명세서 배치 발송 실패", {
        year,
        month,
        totalFailed: result.totalFailed,
        errors: result.errors,
      });

      return NextResponse.json(
        {
          success: false,
          message: `급여명세서 발송 중 오류 발생 (실패: ${result.totalFailed}건)`,
          data: {
            year,
            month,
            totalSent: result.totalSent,
            totalFailed: result.totalFailed,
            errors: result.errors,
          },
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Cron] 급여명세서 배치 발송 오류", { error });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
