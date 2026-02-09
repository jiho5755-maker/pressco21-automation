// Auth.js 설정 — Credentials 기반 사내 인증
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        // 환경변수에 설정된 관리자 계정과 비교
        const adminEmail = process.env.AUTH_ADMIN_EMAIL;
        const adminPassword = process.env.AUTH_ADMIN_PASSWORD;

        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          return {
            id: "1",
            name: "관리자",
            email: adminEmail,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
