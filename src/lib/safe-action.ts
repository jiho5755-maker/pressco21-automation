// Server Action 인프라 — next-safe-action v8
import {
  createSafeActionClient,
  DEFAULT_SERVER_ERROR_MESSAGE,
} from "next-safe-action";
import { auth } from "@/lib/auth";

export class ActionError extends Error {}

// 기본 클라이언트 — 에러 핸들링
export const actionClient = createSafeActionClient({
  handleServerError(e) {
    console.error("Action error:", e.message);
    if (e instanceof ActionError) return e.message;
    return DEFAULT_SERVER_ERROR_MESSAGE;
  },
});

// 인증 필수 클라이언트 — 세션 검증 + RBAC 컨텍스트
export const authActionClient = actionClient.use(async ({ next }) => {
  const session = await auth();
  if (!session?.user?.id) {
    throw new ActionError("로그인이 필요합니다.");
  }
  return next({
    ctx: {
      userId: session.user.id,
      userRole: session.user.role,
    },
  });
});

// Admin 전용 클라이언트 — admin 역할만 허용
export const adminActionClient = authActionClient.use(async ({ next, ctx }) => {
  if (ctx.userRole !== "admin") {
    throw new ActionError("관리자 권한이 필요합니다.");
  }
  return next({ ctx });
});

// Manager 이상 클라이언트 — admin/manager 역할 허용
export const managerActionClient = authActionClient.use(
  async ({ next, ctx }) => {
    if (ctx.userRole !== "admin" && ctx.userRole !== "manager") {
      throw new ActionError("관리자 또는 부서장 권한이 필요합니다.");
    }
    return next({ ctx });
  }
);

/**
 * Server Action 클라이언트 사용 가이드
 *
 * 1. authActionClient
 *    - 기본 인증 클라이언트 (로그인만 확인)
 *    - 모든 역할 (admin/manager/viewer) 허용
 *    - 사용 예: 본인 정보 조회, 경비 신청, 휴가 신청
 *
 * 2. adminActionClient
 *    - Admin 전용 클라이언트
 *    - admin 역할만 허용
 *    - 사용 예: 직원 추가/수정/삭제, 급여 관리, 시스템 설정
 *
 * 3. managerActionClient
 *    - Manager 이상 클라이언트
 *    - admin/manager 역할 허용
 *    - 사용 예: 근태 확정, 휴가 승인, 경비 승인
 *
 * 예시:
 *
 * ```typescript
 * // Admin만 직원 수정 가능
 * export const updateEmployee = adminActionClient
 *   .inputSchema(schema)
 *   .action(async ({ parsedInput, ctx }) => {
 *     // ctx.userId, ctx.userRole 사용 가능
 *     const result = await prisma.employee.update(...);
 *     revalidatePath("/employees");
 *     return { success: true, data: result };
 *   });
 *
 * // Manager가 자기 부서 근태 확정
 * export const confirmAttendance = managerActionClient
 *   .inputSchema(schema)
 *   .action(async ({ parsedInput, ctx }) => {
 *     // 부서 검증은 requireDataOwnership 사용
 *     await requireDataOwnership("attendance", id, ctx);
 *     const result = await prisma.attendanceRecord.update(...);
 *     return { success: true };
 *   });
 * ```
 */
