# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

소기업(5~10인) 경영 자동화 시스템. 유통/도소매 업종 대상, 근로기준법 전면 적용 사업장.

### 회사 프로필
- **업종**: 유통/도소매
- **규모**: 5인 이상 10인 미만
- **법적용**: 근로기준법 전면 적용 (연차, 가산수당, 주52시간 등)
- **연차 기산**: 입사일 기준
- **회계/세무**: 세무사 위탁
- **특이사항**: 출산휴가 중인 직원 있음 → 대체인력 관리 필요

### 개발 현황 및 로드맵

**✅ Phase 0 완료 (인프라 구축)**
- Prisma + SQLite DB 기반 인증 (Auth.js v5, bcrypt, RBAC)
- 대시보드 (DB 통계카드: 재직자/휴직자/유연근무/미처리경비)
- 직원 관리 (CRUD, 검색, 유연근무 Badge, 대체인력 관계)
- 경비 신청 (Zod+RHF 폼, Server Action, DB 저장)
- 설정 페이지 (세션 기반 역할 표시)
- Server Actions 패턴 확립 (safe-action.ts)
- 노무/보험 상수 정의 (constants.ts, ui-config.ts)
- 시드 데이터 (관리자1+부서6+직원11+경비5+근무스케줄25)

**🚧 Phase 1 진행 중 (근태/급여)**
1. ~~직원 관리 고도화~~ ✅ (상세 페이지 4탭 + 수정 Dialog + 연차/급여 계산 유틸)
2. ~~급여 구조 재설계~~ ✅ (수당 분리, 비과세 처리, 최저임금 검증)
3. 근태 관리 (/attendance) — 플레이스홀더 생성 완료
4. 휴가 관리 (/leaves) — 플레이스홀더 생성 완료
5. 급여 관리 (/payroll) — 플레이스홀더 생성 완료
6. 대시보드 리뉴얼

**📋 Phase 2 계획 (정부지원사업 관리)**

**📋 Phase 3 계획 (행정/문서/전자결재)**

**📋 Phase 4 계획 (회계/재무 기초)**

## 개발 명령어

```bash
# 개발 서버
npm run dev          # 개발 서버 (http://localhost:3000, Turbopack)

# 빌드 및 배포
npm run build        # 프로덕션 빌드 (Turbopack)
npm start            # 프로덕션 서버 실행

# 코드 품질
npm run lint         # ESLint 9
# 테스트: 미설정 (테스트 프레임워크 없음)

# 데이터베이스
npx prisma migrate dev           # DB 마이그레이션 생성 및 적용
npx prisma migrate deploy        # 프로덕션 마이그레이션 적용
npx prisma db seed               # 시드 데이터 삽입 (npx tsx prisma/seed.ts)
npx prisma studio                # DB GUI (http://localhost:5555)
npx prisma db push               # 스키마를 DB에 직접 동기화 (개발 전용)
npx prisma generate              # Prisma Client 재생성
```

## 기술 스택

- **Next.js 15** (App Router) + **React 19** + TypeScript (strict)
- **Tailwind CSS v4** (`@theme` 문법, oklch 색상) + **shadcn/ui** (new-york style)
- **Auth.js v5 beta** (Credentials + PrismaAdapter + JWT, RBAC: admin/manager/viewer)
- **Prisma 6** + SQLite (`prisma-client-js` generator) — Prisma 7은 ESM/seed 호환 문제로 사용하지 않음
- **next-safe-action v8** — `inputSchema()` 메서드 사용 (`schema()`는 deprecated)
- **Zod 4** (`import { z } from "zod/v4"`), **RHF 7**, **date-fns 4**

## 아키텍처

### 디렉토리 구조

```
프로젝트 루트/
├── prisma/
│   ├── schema.prisma           # DB 스키마 (10개 모델)
│   ├── seed.ts                 # 시드 데이터 (관리자+부서+직원+경비+근무스케줄)
│   └── migrations/             # 마이그레이션 파일
├── src/
│   ├── app/                    # Next.js 15 App Router
│   │   ├── (auth)/login/       # 미인증 경로
│   │   ├── (dashboard)/        # 인증 필수 (사이드바 레이아웃)
│   │   │   ├── dashboard/      # 통계 대시보드
│   │   │   ├── employees/      # 직원 관리 (목록, 상세, [id]/page.tsx)
│   │   │   ├── expenses/       # 경비 관리
│   │   │   ├── attendance/     # 근태 관리 (Phase 1)
│   │   │   ├── leaves/         # 휴가 관리 (Phase 1)
│   │   │   ├── payroll/        # 급여 관리 (Phase 1)
│   │   │   └── settings/       # 설정
│   │   └── layout.tsx          # Root (Geist 폰트, Toaster)
│   ├── actions/                # Server Actions
│   │   ├── employee-actions.ts # 직원 CRUD + 수정 (updateEmployee, updateEmployeeSalary, updateEmployeeWork, bulkUpdateWorkType)
│   │   └── expense-actions.ts  # 경비 CRUD
│   ├── components/
│   │   ├── layout/             # 레이아웃 컴포넌트 (Sidebar, nav-items.ts)
│   │   ├── ui/                 # shadcn/ui 컴포넌트 (21개)
│   │   ├── shared/             # 공유 컴포넌트 (PageHeader, StatCard 등)
│   │   ├── employees/          # 직원 컴포넌트 (8개: 테이블, 상세헤더, 4탭, 추가/수정 Dialog)
│   │   └── expenses/           # 경비 컴포넌트 (폼, 내역 테이블)
│   ├── lib/
│   │   ├── auth.ts             # Auth.js v5 설정
│   │   ├── prisma.ts           # Prisma Client 싱글톤
│   │   ├── safe-action.ts      # next-safe-action 클라이언트
│   │   ├── constants.ts        # 노무/보험/지원금 상수
│   │   ├── ui-config.ts        # Badge 스타일 설정 (employee/expense/contract/workType/leaveType)
│   │   ├── utils.ts            # cn() 유틸
│   │   ├── leave-calculator.ts # 연차 계산 (calculateTotalAnnualLeave, getAnnualLeaveSummary)
│   │   ├── salary-calculator.ts # 급여/4대보험 계산 (calculateMonthlyInsurance, formatCurrency)
│   │   └── validations/
│   │       └── salary.ts       # 최저임금 검증 (validateMinimumWage)
│   └── types/
│       └── index.ts            # NavGroup, NavItem 등 공통 타입
├── middleware.ts               # Auth.js v5 미들웨어 (인증 보호)
└── .env.local                  # 환경변수 (git 제외)
```

### 라우팅 및 인증

`middleware.ts`가 Auth.js v5 미들웨어로 인증 보호 처리:
- **보호 대상**: 모든 경로 (루트 `/`도 `/dashboard`로 리다이렉트)
- **제외 경로**: `/api`, `/_next`, `/login`, 정적 파일 (favicon.ico 등)

### 데이터 흐름

1. **페이지 (Server Component)** → `prisma` 직접 조회 (import from `@/lib/prisma`)
2. **변경 작업** → Server Action 호출 (`src/actions/`) → `revalidatePath`
3. **인증 컨텍스트** → `auth()` (서버), `useSession()` (클라이언트)

### Server Actions 패턴

```typescript
// src/actions/에서 항상 이 패턴 사용
"use server";
import { z } from "zod/v4";
import { revalidatePath } from "next/cache";
import { authActionClient, ActionError } from "@/lib/safe-action";

const schema = z.object({ ... });

export const myAction = authActionClient
  .inputSchema(schema)        // ← v8 방식 (schema() 아님)
  .action(async ({ parsedInput, ctx }) => {
    // ctx.userId, ctx.userRole 사용 가능

    // DB 작업
    const result = await prisma.model.create({ data: parsedInput });

    // 완료 후 경로 재검증 (필수)
    revalidatePath("/target-page");

    return { success: true, data: result };
  });
```

**호출 방법 (클라이언트)**:
```typescript
"use client";
import { useAction } from "next-safe-action/hooks";
import { myAction } from "@/actions/my-actions";

export function MyForm() {
  const { execute, isPending } = useAction(myAction, {
    onSuccess: ({ data }) => {
      toast.success("성공!");
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "실패");
    },
  });

  const handleSubmit = (formData: FormData) => {
    execute({ field: formData.get("field") });
  };
  // ...
}
```

### 직원 상세 페이지 아키텍처

`/employees/[id]`는 탭 기반 상세 페이지로, 여러 파일이 협력하는 핵심 패턴:

```
employees/[id]/page.tsx (Server Component, DB 조회)
  └→ employee-detail-header.tsx (상태 Badge, 수정 Dialog 트리거)
  └→ Tabs: 기본정보 / 근무정보 / 급여·보험 / 휴가
       ├→ employee-info-tab.tsx
       ├→ employee-work-tab.tsx
       ├→ employee-salary-tab.tsx (salary-calculator.ts 활용)
       └→ employee-leave-tab.tsx (leave-calculator.ts 활용)
  └→ employee-edit-dialog.tsx ("use client", RHF+Zod, 3개 Server Action 호출)
```

수정 Dialog는 탭별로 다른 Server Action을 호출: `updateEmployee` (기본정보), `updateEmployeeSalary` (급여), `updateEmployeeWork` (근무).

### 사이드바 네비게이션

`src/components/layout/nav-items.ts`에서 `NavGroup[]` 배열로 메뉴 그룹 정의 (메인/인사관리/재무/시스템). `NavGroup`, `NavItem` 타입은 `src/types/index.ts`.

### 비즈니스 상수 및 유틸리티

- `src/lib/constants.ts`: 2026년 기준 노무 상수
  - `LABOR_STANDARDS_2026`: 최저임금, 연장수당율, 주52시간
  - `INSURANCE_RATES_2026`: 4대보험 요율 및 상하한액
  - `MATERNITY_PARENTAL_2026`: 출산휴가, 육아휴직, 연차 법정 기준
  - `GOVERNMENT_SUBSIDIES_2026`: 유연근무 장려금, 대체인력 지원금 등
  - 상태/유형 매핑: `POSITIONS`, `EMPLOYEE_STATUS`, `CONTRACT_TYPES`, `WORK_TYPES`, `LEAVE_TYPES` 등
- `src/lib/ui-config.ts`: 상태별 Badge 스타일 매핑 (employeeStatusConfig, expenseStatusBadgeConfig, contractTypeConfig, workTypeConfig, leaveTypeConfig)
- `src/lib/utils.ts`: `cn()` 유틸 (clsx + tailwind-merge)
- `src/lib/prisma.ts`: Prisma 클라이언트 싱글톤
- `src/lib/auth.ts`: Auth.js v5 설정 (Credentials + PrismaAdapter + JWT)
- `src/lib/safe-action.ts`: next-safe-action 클라이언트 (actionClient, authActionClient)
- `src/lib/leave-calculator.ts`: 연차 계산 순수 함수 (근로기준법 제60조 기반, 입사일 기준)
- `src/lib/salary-calculator.ts`: 급여 계산 함수 (Phase 1-B 리팩토링)
  - `calculateTotalGross()`: 총 급여 (기본급+수당)
  - `calculateTaxableAmount()`: 과세 대상 (비과세 제외)
  - `calculateMonthlyInsurance()`: 4대보험료 (과세 대상 기준)
  - `calculateIncomeTax()`: 소득세 (간이세액표 간단 버전)
  - `calculateSalary()`: 종합 계산 → 실수령액
- `src/lib/validations/salary.ts`: 최저임금 검증 (모든 수당 포함, 고정OT 제외)

## 핵심 규칙 및 코딩 컨벤션

### React 및 Next.js
- **Server Component 기본**, 클라이언트 필요 시에만 `"use client"` 명시
- **데이터 페칭**: 페이지에서 `prisma` 직접 조회, 변경은 Server Action 사용
- **경로 재검증**: Server Action 완료 후 `revalidatePath()` 호출 필수

### 타입 및 스키마
- **Prisma 타입**: `import type { Employee, Department } from "@prisma/client"`
- **Zod v4 임포트**: `import { z } from "zod/v4"` ← **v3 경로 사용 금지**
- **zodResolver**: `@hookform/resolvers/zod` (v5.2.2, Zod v3/v4 자동감지)
- **SQLite 제약**: enum 미지원 → String + 앱레벨 Zod enum 검증

### UI 및 스타일
- **cn() 유틸**: `import { cn } from "@/lib/utils"` (clsx + tailwind-merge)
- **Toaster**: `import { Toaster } from "sonner"` (useTheme 미사용)
- **shadcn/ui**: new-york 스타일, 필요한 컴포넌트만 추가
- **Tailwind v4**: CSS `@theme` 문법, oklch 색상 사용

### 다국어 및 네이밍
- **한국어 우선**: 커밋 메시지, 코드 주석, UI 텍스트 모두 한국어
- **영어 식별자**: 변수명, 함수명은 camelCase 영어, 타입명은 PascalCase 영어

## DB 스키마 (주요 모델)

### 인증 및 사용자
- **User**: Auth.js 인증 + RBAC (admin/manager/viewer), bcrypt 비밀번호 해시
- **Account**, **Session**, **VerificationToken**: Auth.js 표준 테이블

### 조직 구조
- **Department**: 부서 정보 (name, sortOrder, isActive)
- **Employee**: 직원 마스터 데이터 (사번, 소속, 계약정보, 근무조건, 유연근무, 급여, 4대보험, 상태)
  - 대체인력 자기참조: `replacementForId` → `replacementFor` 관계
  - 유연근무 설정: workType, flexStartTime, remoteWorkDays(JSON)
  - 휴직 상태: status, leaveType, leaveStartDate, leaveEndDate
  - 주소: `address` (선택), 자녀세액공제용: `childrenUnder20` (기본 0)
  - **급여 구조 (Phase 1-B)**: 기본급 + 수당 분리
    - 기본급: `baseSalary`
    - 수당: `mealAllowance`, `transportAllowance`, `positionAllowance`
    - 비과세: `taxFreeMeal`, `taxFreeTransport` (각 20만원까지)
    - 고정OT: `useFixedOT`, `fixedOTHours`, `fixedOTAmount` 등 7개 필드

### 근태 및 휴가
- **WorkSchedule**: 요일별 근무시간 스케줄 (시차출퇴근 지원, effectiveFrom/To로 이력 관리)
- **AttendanceRecord**: 일별 출퇴근 기록 (clockIn/Out, 연장근로, 야간근로, 확인 여부)
- **LeaveRecord**: 휴가/휴직 이력 (연차, 출산휴가, 육아휴직, 배우자출산휴가 등, 자녀출생일 기록)

### 재무
- **Expense**: 경비 신청 (직원, 제출자, 승인자, 상태, 금액, 카테고리)

### 관계 요약
```
User ─1:N→ Employee (경비 제출자/승인자)
Department ─1:N→ Employee
Employee ─1:N→ WorkSchedule, AttendanceRecord, LeaveRecord, Expense
Employee ─1:1→ Employee (대체인력 관계)
```

## 환경변수

```bash
# .env.local 파일에 설정 필요
DATABASE_URL="file:./dev.db"                # SQLite DB 파일 경로
AUTH_SECRET=<random_32_chars>               # openssl rand -base64 32
AUTH_ADMIN_EMAIL=admin@company.com          # 시드 데이터 관리자 이메일
AUTH_ADMIN_PASSWORD=<password>              # 시드 데이터 관리자 비밀번호
NEXT_PUBLIC_APP_NAME=사내 자동화 도구       # 앱 이름 (UI에 표시)
```

## 초기 설정 순서

1. 환경변수 파일 생성: `.env.local` 파일에 위 변수들 설정
2. 의존성 설치: `npm install`
3. DB 초기화: `npx prisma migrate dev` (마이그레이션 적용)
4. 시드 데이터 삽입: `npx prisma db seed` (관리자1+부서6+직원11+경비5+근무스케줄25)
5. 개발 서버 실행: `npm run dev`
6. 로그인: `AUTH_ADMIN_EMAIL`과 `AUTH_ADMIN_PASSWORD`로 로그인

## 노무 규정 및 주의사항

### 2026년 기준 법정 요율 (연도별 변경)
- **국민연금**: 4.75% (상한 637만원, 하한 40만원)
- **건강보험**: 3.595% (상한 1,270만원)
- **장기요양**: 건강보험료의 13.14%
- **고용보험**: 근로자 0.9%, 사업주 1.05%
- **최저임금**: 시급 10,320원, 월급 2,156,880원 (209시간 기준)

### 출산/육아 법정 기준
- **출산전후휴가**: 90일 (다태아 120일), 출산 후 최소 45일 의무
- **육아휴직**: 최대 18개월, 급여 80% (상한 160만원, 하한 70만원)
- **배우자출산휴가**: 20일 (2025.2.23 개정)
- **연차**: 1년 미만 월1일, 1년 이상 15일, 이후 2년마다 1일 추가 (최대 25일)

### 퇴직금 계산
- 평균임금 < 통상임금인 경우 → 통상임금 적용
- 계속근로기간 1년 이상 시 지급 의무

### 급여 계산 규칙 (Phase 1-B)
- **총 급여**: 기본급 + 식대 + 교통비 + 직책수당
- **과세 대상**: 총 급여 - 비과세 수당 (식대 20만, 교통비 20만)
- **최저임금 검증**: 총 급여 / 209시간 ≥ 10,320원 (고정OT 제외)
- **4대보험료**: 과세 대상 급여로 계산
- **실수령액**: 총 급여 - (4대보험 + 소득세 + 지방소득세)

### 개발 시 유의사항
- 4대보험 요율은 매년 변경되므로 `constants.ts`의 연도 확인 필수
- 출산휴가/육아휴직은 자녀 출생일 기준으로 자동 계산
- 대체인력 지원금 신청을 위해 `replacementForId`, `replacementReason` 필드 정확히 관리
- 근태 기록(`AttendanceRecord`)은 정부 지원금 증빙 자료이므로 `isConfirmed` 필드로 관리자 확인 필수
- **급여 수당**: 비과세 한도 초과분은 과세 대상으로 자동 전환
- **고정OT**: 최저임금 검증 시 제외, 서면 합의 필수, 법정 최소 금액 준수

## 서브에이전트 시스템

16개 전문가 에이전트가 `.claude/agents/`에 정의되어 있다. 에이전트는 **자문관/검토자** 역할이며, 코드 작성은 메인이 직접 수행한다.

### 호출 방식 (검증 완료 2026-02-09)

커스텀 에이전트는 Task 도구의 `subagent_type`으로 직접 호출할 수 없다. 대신 다음 방식을 사용:

| 방식 | 설명 | 예시 |
|------|------|------|
| **내장 code-reviewer** | Task의 `subagent_type: "code-reviewer"`로 호출 가능. 커스텀 프롬프트가 병합 적용됨 | 구현 완료 후 코드 리뷰 시 사용 |
| **general-purpose + 역할 프롬프트** | Task의 `subagent_type: "general-purpose"`에 에이전트 역할을 프롬프트로 주입 | DB 설계, 노무 자문 등 전문 분석 시 |
| **CLI 에이전트 모드** | `claude --agent <name>`으로 터미널에서 직접 실행 | 독립적인 깊은 분석 필요 시 |
| **사용자 자연어 요청** | "code-reviewer 에이전트로 리뷰해줘" 형태로 요청 | 사용자가 특정 에이전트 지정 시 |

**실용적 패턴**: 메인 세션에서는 `code-reviewer` (내장)과 `general-purpose` (역할 프롬프트 주입)를 활용하고, 에이전트 파일의 시스템 프롬프트와 체크리스트를 참조 문서로 활용한다.

### 에이전트 조직도

| 부서 | 에이전트 | 모델 | 역할 |
|------|---------|------|------|
| **기획실** | product-manager | sonnet | 요구사항 정의, 도메인 자문 라우팅 |
| **기술본부** | fullstack-architect | sonnet | 아키텍처/페이지 설계 |
| | db-architect | sonnet | DB 스키마, 마이그레이션 |
| | ui-ux-advisor | sonnet | UI/UX 설계, 컴포넌트 구조 |
| | devops-engineer | sonnet | 빌드, 타입 검사, 배포 |
| **도메인자문단** | hr-labor-expert | opus | 근로기준법, 연차, 모성보호 |
| | payroll-tax-expert | opus | 급여 계산, 4대보험, 소득세 |
| | employment-subsidy-expert | opus | 고용지원금, 출산육아기 지원 |
| | sme-policy-expert | sonnet | 중소기업 정책자금, 판로지원 |
| | tax-incentive-expert | sonnet | 세제혜택, 두루누리 |
| | document-admin-expert | sonnet | 법정 서식, 전자결재 |
| | accounting-expert | sonnet | 급여대장, 원천징수, Excel |
| **품질본부** | code-reviewer | sonnet | 코드 품질, 패턴, 타입 안전성 |
| | security-auditor | sonnet | 보안 취약점, RBAC, 데이터 보호 |
| | qa-engineer | sonnet | 테스트 설계/작성 |
| | technical-writer | haiku | 문서 정리, MEMORY 갱신 |

### 검증 프로토콜 (실용적 대안)

원래 설계된 병렬/순차 프로토콜 대신, 실제 사용 가능한 패턴:

| 프로토콜 | 실행 방법 | 사용 시점 |
|---------|----------|----------|
| **P0 기획** | general-purpose에 product-manager 역할 프롬프트 주입 | 새 기능 기획 시 |
| **P1 설계 리뷰** | general-purpose 3개 병렬 (각각 architect/db/ui-ux 역할) | 아키텍처 결정 시 |
| **P2 품질 게이트** | 내장 code-reviewer 호출 | 구현 완료 후 |
| **P3 교차검증** | general-purpose에 hr→payroll 순차 역할 프롬프트 | 급여/노무 정확성 필수 시 |
| **P4 스키마 검증** | general-purpose에 db-architect 역할 프롬프트 | DB 스키마 변경 시 |

### 비용 인식

| 모델 | 에이전트 | 사용 기준 |
|------|---------|----------|
| opus (높음) | hr-labor, payroll-tax, employment-subsidy | 법적/재무적 정확성 필수 시만 |
| sonnet (보통) | 나머지 12개 | 일반적 사용 |
| haiku (낮음) | technical-writer | 문서 정리 |

간단한 질문은 에이전트 없이 직접 답변한다. 에이전트는 전문성이 필요한 경우에만 호출.

---

## AI 에이전트 자동 라우팅 시스템

### 자동 라우팅 규칙

메인 에이전트(Claude Code)는 사용자의 자연어 요청을 분석하여 적절한 전문가 에이전트를 자동으로 호출한다.

#### 단일 에이전트 호출 규칙

| 키워드 패턴 | 호출 에이전트 | 예시 요청 |
|------------|-------------|----------|
| 연차, 휴가, 근로시간 | hr-labor-expert | "연차 계산 로직 검증해줘" |
| 급여, 4대보험, 소득세 | payroll-tax-expert | "급여 계산이 정확한지 확인해줘" |
| 지원금, 보조금 | employment-subsidy-expert | "받을 수 있는 지원금 알려줘" |
| 아키텍처, 설계 | fullstack-architect | "이 기능의 설계를 해줘" |
| DB, 스키마 | db-architect | "DB 스키마를 설계해줘" |
| 보안, RBAC | security-auditor | "보안 취약점 점검해줘" |

#### 오케스트레이션 트리거 (병렬 실행)

사용자의 요청에 다음 키워드가 포함되면 여러 에이전트를 **동시에** 호출:

| 트리거 | 호출 조합 | 예시 |
|--------|----------|------|
| "검증해줘", "리뷰해줘" | hr-labor + payroll-tax + security-auditor | "급여 시스템 전체 검증해줘" |
| "전체 분석" | hr-labor + payroll-tax + accounting + employment-subsidy | "현재 시스템 전체 분석해줘" |
| "계획 세워줘" | product-manager + fullstack-architect | "퇴직금 계산 기능 계획 세워줘" |

#### 체이닝 트리거 (순차 실행)

다음 요청은 자동으로 에이전트 체이닝이 발동:

| 트리거 | 체인 순서 | 예시 |
|--------|----------|------|
| "새 기능 추가" | PM → Architect → DB → Code-Reviewer | "연차 관리 기능 추가해줘" |
| "급여 로직 추가" | PM → payroll-tax → Architect → QA | "휴일근로 수당 계산 추가해줘" |

### 사용 예시

**예시 1: 자동 단일 에이전트 호출**
```
사용자: "연차 계산 로직이 맞는지 확인해줘"

→ 자동 분석: 키워드 "연차", "계산"
→ hr-labor-expert 호출
→ 노무 관점 검증 결과 반환
```

**예시 2: 자동 오케스트레이션**
```
사용자: "급여 시스템을 전체적으로 검증해줘"

→ 자동 분석: "급여", "전체", "검증"
→ 3명 병렬 호출:
  - hr-labor-expert (노무 관점)
  - payroll-tax-expert (세무 관점)
  - accounting-expert (회계 관점)
→ 통합 보고서 생성
```

**예시 3: 자동 체이닝**
```
사용자: "퇴직금 자동 계산 기능을 추가해줘"

→ 자동 분석: "기능 추가"
→ 순차 실행:
  1. product-manager (요구사항 정의)
  2. payroll-tax-expert (퇴직금 계산 자문)
  3. fullstack-architect (기술 설계)
  4. code-reviewer (구현 후 리뷰)
```

### 참고 문서

- [AI 회사 조직도](.claude/AI_COMPANY_ORGANIZATION.md): 16명 전문가 상세 정보
- [에이전트 시스템 가이드](.claude/AGENT_SYSTEM_GUIDE.md): 체이닝/오케스트레이션 완벽 가이드
- [라우팅 규칙 JSON](.claude/routing-rules.json): 전체 라우팅 규칙 상세
