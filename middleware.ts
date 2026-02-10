// 미인증 사용자를 /login으로 리다이렉트하는 미들웨어
export { auth as middleware } from "@/lib/auth";

export const config = {
  // 인증 체크가 필요한 모든 경로 포함
  matcher: [
    "/",
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
};
