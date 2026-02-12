// Auth.js v5 — Middleware용 경량 설정 (DB/bcrypt 제외)
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    // ✅ JWT 콜백: user.role → token.role 저장 (middleware에서도 실행)
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    // ✅ session 콜백: token.role → session.user.role 매핑 (middleware 필수)
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname;

      // 인증되지 않은 경우 false 반환 (로그인 페이지로 리다이렉트)
      if (!auth?.user) {
        return false;
      }

      // 루트 경로 접근 시 대시보드로 리다이렉트
      if (pathname === "/") {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      const role = auth.user.role;

      // /employees: admin/manager만 허용
      if (pathname.startsWith("/employees")) {
        if (role === "viewer") {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
      }

      // /payroll: admin만 허용
      if (pathname.startsWith("/payroll")) {
        if (role !== "admin") {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
      }

      // /accounting: admin만 허용 (Phase 4)
      if (pathname.startsWith("/accounting")) {
        if (role !== "admin") {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
      }

      // 그 외 모든 인증된 사용자 허용
      return true;
    },
  },
  providers: [], // middleware에서는 providers 불필요
} satisfies NextAuthConfig;
