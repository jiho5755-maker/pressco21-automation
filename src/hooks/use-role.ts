// useRole 훅 — 클라이언트 컴포넌트 역할 확인
"use client";

import { useSession } from "next-auth/react";

/**
 * 현재 사용자의 역할 정보 반환
 * @returns 역할 확인 플래그 객체
 */
export function useRole() {
  const { data: session, status } = useSession();

  const role = session?.user?.role;

  return {
    /** 현재 역할 */
    role,
    /** 로딩 중 여부 */
    isLoading: status === "loading",
    /** 인증 여부 */
    isAuthenticated: status === "authenticated",
    /** Admin 여부 */
    isAdmin: role === "admin",
    /** Manager 여부 */
    isManager: role === "manager",
    /** Viewer 여부 */
    isViewer: role === "viewer",
    /** Admin 또는 Manager 여부 */
    isAdminOrManager: role === "admin" || role === "manager",
  };
}

/**
 * 사용 예시:
 *
 * ```typescript
 * "use client";
 *
 * import { useRole } from "@/hooks/use-role";
 *
 * export function MyComponent() {
 *   const { isAdmin, isAdminOrManager, isLoading } = useRole();
 *
 *   if (isLoading) {
 *     return <div>로딩 중...</div>;
 *   }
 *
 *   return (
 *     <div>
 *       {isAdmin && <Button>관리자 전용 버튼</Button>}
 *       {isAdminOrManager && <Button>승인</Button>}
 *     </div>
 *   );
 * }
 * ```
 */
