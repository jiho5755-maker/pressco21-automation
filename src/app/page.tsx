"use client";

// 루트 페이지 → 클라이언트 사이드 리다이렉트
// 서버 사이드 redirect()를 사용하면 미들웨어와 충돌하여 500 에러 발생
// 클라이언트 사이드 리다이렉트로 우회
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);

  return null;
}
