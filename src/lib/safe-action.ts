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
