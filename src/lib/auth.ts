// Auth.js v5 — Prisma DB 인증 + RBAC
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" }, // Credentials + PrismaAdapter = JWT 필수
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      // 인증되지 않은 경우 false 반환 (로그인 페이지로 리다이렉트)
      if (!auth?.user) {
        return false;
      }

      const pathname = request.nextUrl.pathname;
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

      // 그 외 모든 인증된 사용자 허용
      return true;
    },
  },
});
