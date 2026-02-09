# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

소기업(5~10인) 경영 자동화 시스템. 유통/도소매 업종 대상, 근로기준법 전면 적용 사업장.
현재 Phase 0(인프라) 완료, Phase 1(근태/급여) 진행 예정.

## 개발 명령어

```bash
npm run dev          # 개발 서버 (Turbopack)
npm run build        # 프로덕션 빌드 (Turbopack)
npm run lint         # ESLint 9
npx prisma migrate dev   # DB 마이그레이션 적용
npx prisma db seed       # 시드 데이터 삽입 (npx tsx prisma/seed.ts)
npx prisma studio        # DB GUI
```

## 기술 스택

- **Next.js 15** (App Router) + **React 19** + TypeScript (strict)
- **Tailwind CSS v4** (`@theme` 문법, oklch 색상) + **shadcn/ui** (new-york style)
- **Auth.js v5 beta** (Credentials + PrismaAdapter + JWT, RBAC: admin/manager/viewer)
- **Prisma 6** + SQLite (`prisma-client-js` generator) — Prisma 7은 ESM/seed 호환 문제로 사용하지 않음
- **next-safe-action v8** — `inputSchema()` 메서드 사용 (`schema()`는 deprecated)
- **Zod 4** (`import { z } from "zod/v4"`), **RHF 7**, **date-fns 4**

## 아키텍처

### 라우팅

```
src/app/
├── (auth)/login/       # 미인증 경로
├── (dashboard)/        # 인증 필수 (사이드바 레이아웃)
│   ├── dashboard/      # 통계 대시보드
│   ├── employees/      # 직원 관리
│   ├── expenses/       # 경비 관리
│   └── settings/       # 설정
└── layout.tsx          # Root (Geist 폰트, Toaster)
```

`middleware.ts`가 Auth.js v5 미들웨어로 인증 보호 처리. `/api`, `/_next`, `/login` 제외.

### 데이터 흐름

1. **페이지 (Server Component)** → `prisma` 직접 조회 (import from `@/lib/prisma`)
2. **변경 작업** → Server Action 호출 (`src/actions/`) → `revalidatePath`
3. **인증 컨텍스트** → `auth()` (서버), `useSession()` (클라이언트)

### Server Actions 패턴

```typescript
// src/actions/에서 항상 이 패턴 사용
"use server";
import { z } from "zod/v4";
import { authActionClient, ActionError } from "@/lib/safe-action";

const schema = z.object({ ... });

export const myAction = authActionClient
  .inputSchema(schema)        // ← v8 방식 (schema() 아님)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.userId, ctx.userRole 사용 가능
    // 완료 후 revalidatePath() 호출
  });
```

### 사이드바 네비게이션

`src/components/layout/nav-items.ts`에서 `NavGroup[]` 배열로 메뉴 그룹 정의 (메인/인사관리/재무/시스템). `NavGroup`, `NavItem` 타입은 `src/types/index.ts`.

### 비즈니스 상수

- `src/lib/constants.ts`: 2026년 기준 노무 상수 (최저임금, 4대보험 요율, 정부지원금, 출산/육아 기준)
- `src/lib/ui-config.ts`: 상태별 Badge 스타일 매핑 (employeeStatusConfig, expenseStatusBadgeConfig 등)

## 핵심 규칙

- **Server Component 기본**, 클라이언트 필요 시에만 `"use client"` 명시
- **Prisma 타입**: `import type { Employee, Department } from "@prisma/client"`
- **Zod v4 임포트**: `import { z } from "zod/v4"` (v3 경로 사용 금지)
- **zodResolver**: `@hookform/resolvers/zod` (v5.2.2, Zod v3/v4 자동감지)
- **Toaster**: `import { Toaster } from "sonner"` (useTheme 미사용)
- **SQLite 제약**: enum 미지원 → String + 앱레벨 Zod 검증
- **cn() 유틸**: `import { cn } from "@/lib/utils"` (clsx + tailwind-merge)
- **한국어**: 커밋 메시지, 코드 주석, UI 텍스트 모두 한국어. 변수/함수명만 영어

## DB 스키마 (7개 모델)

User (Auth.js+RBAC) → Employee (직원) → Department (부서)
Employee → WorkSchedule (근무스케줄), LeaveHistory (휴직이력)
Employee → Expense (경비) → ExpenseApproval (결재)
Employee는 replacedById로 대체인력 자기참조 관계 보유.

## 환경변수

```
DATABASE_URL="file:./dev.db"
AUTH_SECRET=<random>
AUTH_ADMIN_EMAIL=admin@company.com
AUTH_ADMIN_PASSWORD=<password>
NEXT_PUBLIC_APP_NAME=사내 자동화 도구
```
