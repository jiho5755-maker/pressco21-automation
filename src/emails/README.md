# 이메일 템플릿 가이드

Phase 3-F: 이메일 알림 시스템

## 개요

React Email과 Resend를 활용한 트랜잭션 이메일 시스템입니다. HTML 이메일을 React 컴포넌트로 작성하여 유지보수성과 타입 안전성을 확보합니다.

## 기술 스택

- **React Email**: HTML 이메일을 React 컴포넌트로 작성
- **Resend**: 이메일 발송 서비스 (트랜잭션 이메일 특화)
- **@react-email/render**: React 컴포넌트 → HTML 변환

## 환경 설정

### 1. Resend 계정 생성 및 API 키 발급

1. [Resend](https://resend.com) 회원가입
2. 도메인 추가 및 DNS 인증
3. API Keys 메뉴에서 API 키 발급
4. `.env.local`에 환경변수 추가:

```bash
# Resend API 키
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"

# 발신자 이메일 (도메인 인증 필수)
RESEND_FROM_EMAIL="PRESSCO21 <noreply@pressco21.com>"
```

### 2. 도메인 인증

Resend 대시보드에서 도메인을 추가하고 DNS 레코드를 설정합니다.

**필수 DNS 레코드**:
- SPF (TXT)
- DKIM (TXT)
- DMARC (TXT)

인증 완료 후 `RESEND_FROM_EMAIL`에 인증된 도메인 사용.

## 구현된 템플릿

### 1. 지원금 마감 알림 (subsidy-deadline-reminder.tsx)

**용도**: 정부지원금 신청 마감일 D-3, D-7일 전 자동 알림

**사용 예시**:

```typescript
import { sendSubsidyDeadlineReminder } from "@/actions/notification-actions";

// 단일 직원에게 발송
await sendSubsidyDeadlineReminder(
  "cm6g2a8h100006gbqf5fkgjfx", // employeeId
  "FLEXIBLE_WORK",              // subsidyType
  new Date("2026-02-28"),       // deadline
  600000,                       // estimatedAmount (원)
  "cm6g2a8h100006gbqf5fkgjfx"  // subsidyId (선택)
);
```

**배치 발송** (관리자 전용):

```typescript
import { sendBatchSubsidyDeadlineReminders } from "@/actions/notification-actions";

// 자격 있는 모든 직원에게 발송
await sendBatchSubsidyDeadlineReminders(
  "FLEXIBLE_WORK",                          // subsidyType
  new Date("2026-02-28"),                   // deadline
  ["emp1", "emp2", "emp3"],                 // eligibleEmployeeIds
  600000                                    // estimatedAmount
);
```

**이메일 내용**:
- 제목: `[긴급] 유연근무 장려금 신청 마감 D-3일 전`
- 본문:
  - 직원명 인사말
  - 지원금 유형, 마감일, 예상 지급액
  - "지금 신청하기" 버튼 (절대 URL)
  - 문의 정보 (이메일, 주소)

## 새 템플릿 추가하기

### 1. 타입 정의 (src/types/notification.ts)

```typescript
export interface MyEmailProps {
  userName: string;
  actionUrl: string;
}
```

### 2. 템플릿 작성 (src/emails/my-email.tsx)

```tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { MyEmailProps } from "@/types/notification";

export default function MyEmail({ userName, actionUrl }: MyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>미리보기 텍스트</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading>안녕하세요, {userName}님</Heading>
          <Button href={actionUrl}>클릭하세요</Button>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc" };
const container = { backgroundColor: "#ffffff", padding: "20px" };
```

### 3. Server Action 작성 (src/actions/notification-actions.ts)

```typescript
export async function sendMyEmail(
  userId: string,
  actionUrl: string
): Promise<NotificationResult> {
  try {
    // 1. 사용자 조회
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user?.email) {
      return { success: false, error: "이메일 주소가 없습니다." };
    }

    // 2. HTML 생성
    const emailHtml = await render(
      MyEmail({ userName: user.name, actionUrl })
    );

    // 3. 이메일 발송
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: "제목",
      html: emailHtml,
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, emailId: result.data?.id };
  } catch (error) {
    return { success: false, error: "발송 실패" };
  }
}
```

## 로컬 개발 및 테스트

### 1. React Email 개발 서버 (선택)

```bash
# React Email CLI 설치
npm install -D @react-email/cli

# 개발 서버 실행 (http://localhost:3000)
npx email dev
```

브라우저에서 이메일 템플릿 미리보기 가능.

### 2. 테스트 이메일 발송

실제 발송 없이 테스트하려면 Resend의 테스트 모드 사용:

```typescript
// 환경변수
RESEND_API_KEY="re_test_xxxxxxxxxxxxxxxxxxxxxxxxxx" // 테스트 키
```

테스트 키 사용 시 이메일이 발송되지 않고 Resend 대시보드에만 기록됩니다.

### 3. 로컬 SMTP 서버 (Mailpit)

Mailpit을 사용하면 로컬에서 이메일 수신 테스트 가능:

```bash
# Docker로 Mailpit 실행
docker run -d \
  --name mailpit \
  -p 1025:1025 \
  -p 8025:8025 \
  axllent/mailpit

# SMTP 서버: localhost:1025
# 웹 UI: http://localhost:8025
```

Resend 대신 SMTP 전송 설정 필요 (nodemailer 등).

## 프로덕션 배포

### Vercel 환경변수 설정

Vercel 대시보드 → Settings → Environment Variables:

1. **RESEND_API_KEY** (Production/Preview, Sensitive)
2. **RESEND_FROM_EMAIL** (All Environments)

환경변수 추가 후 재배포.

### 발송 제한

Resend 무료 티어 제한:
- **100 emails/day**
- **3,000 emails/month**

유료 플랜 전환 시 제한 해제.

## 모범 사례

### 1. 절대 URL 사용

이메일에서는 상대 경로가 작동하지 않으므로 항상 절대 URL 사용:

```tsx
// ❌ 잘못된 예시
<Button href="/subsidies?id=123">신청하기</Button>

// ✅ 올바른 예시
<Button href="https://pressco21-automation.vercel.app/subsidies?id=123">
  신청하기
</Button>
```

### 2. Inline CSS

이메일 클라이언트는 `<style>` 태그를 지원하지 않으므로 모든 스타일을 인라인으로 작성:

```tsx
const paragraph = {
  color: "#334155",
  fontSize: "16px",
  lineHeight: "24px",
};

<Text style={paragraph}>내용</Text>
```

### 3. Preview 텍스트

받은편지함에서 미리보기 텍스트로 표시되므로 핵심 내용 요약:

```tsx
<Preview>
  [긴급] 유연근무 장려금 신청 마감 D-3일 전 - ₩600,000 지급 예정
</Preview>
```

### 4. 반응형 디자인

모바일 이메일 클라이언트를 고려하여 max-width 설정:

```tsx
const container = {
  maxWidth: "600px",
  margin: "0 auto",
};
```

### 5. 오류 처리

이메일 발송 실패는 앱 전체를 중단시키면 안 됨:

```typescript
try {
  await sendSubsidyDeadlineReminder(...);
} catch (error) {
  console.error("이메일 발송 실패", error);
  // 앱은 계속 진행
}
```

## 참고 자료

- [React Email 문서](https://react.email/docs/introduction)
- [Resend 문서](https://resend.com/docs/introduction)
- [이메일 디자인 가이드](https://templates.emailoctopus.com/)

## TODO

- [ ] Phase 3-F-2: 결재 요청 이메일 템플릿 (`approval-request.tsx`)
- [ ] Phase 3-F-3: 결재 결과 이메일 템플릿 (`approval-result.tsx`)
- [ ] Phase 3-F-4: 휴가 신청 이메일 템플릿 (`leave-request.tsx`)
- [ ] Phase 3-F-5: 급여명세서 발급 이메일 템플릿 (`payroll-ready.tsx`)
