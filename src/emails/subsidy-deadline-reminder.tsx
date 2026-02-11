/**
 * 지원금 마감 알림 이메일 템플릿
 *
 * Phase 3-F: 알림 시스템
 * React Email 컴포넌트 기반 HTML 이메일 생성
 */

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { SubsidyDeadlineReminderProps } from "@/types/notification";

/**
 * 지원금 마감 알림 이메일
 *
 * @example
 * ```tsx
 * <SubsidyDeadlineReminder
 *   employeeName="홍길동"
 *   subsidyTypeName="유연근무 장려금"
 *   deadline="2026-02-28"
 *   dDay={3}
 *   estimatedAmount={600000}
 *   subsidyId="cm6g2a8h100006gbqf5fkgjfx"
 * />
 * ```
 */
export default function SubsidyDeadlineReminder({
  employeeName,
  subsidyTypeName,
  deadline,
  dDay,
  estimatedAmount,
  subsidyId,
}: SubsidyDeadlineReminderProps) {
  // 금액 포맷팅
  const formattedAmount = new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(estimatedAmount);

  // 마감일 포맷팅 (YYYY-MM-DD → YYYY년 M월 D일)
  const deadlineDate = new Date(deadline);
  const formattedDeadline = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(deadlineDate);

  // 신청 페이지 URL (프로덕션 절대 URL)
  const applicationUrl = `https://pressco21-automation.vercel.app/subsidies?id=${subsidyId}`;

  return (
    <Html>
      <Head />
      <Preview>
        {`[긴급] ${subsidyTypeName} 신청 마감 D-${dDay}일 전 - ${formattedAmount} 지급 예정`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* 헤더 */}
          <Section style={header}>
            <Heading style={h1}>PRESSCO21</Heading>
            <Text style={subtitle}>소기업 경영 자동화 시스템</Text>
          </Section>

          {/* 본문 */}
          <Section style={content}>
            <Heading style={h2}>
              [긴급] {subsidyTypeName} 신청 마감 D-{dDay}일 전
            </Heading>

            <Text style={paragraph}>안녕하세요, {employeeName}님</Text>

            <Text style={paragraph}>
              신청 가능한 정부지원금이 곧 마감됩니다. 아래 내용을 확인하시고
              기한 내 신청해주세요.
            </Text>

            {/* 지원금 정보 박스 */}
            <Section style={infoBox}>
              <Text style={infoLabel}>지원금 유형</Text>
              <Text style={infoValue}>{subsidyTypeName}</Text>

              <Text style={infoLabel}>신청 마감일</Text>
              <Text style={infoValue}>
                {formattedDeadline} (D-{dDay}일)
              </Text>

              <Text style={infoLabel}>예상 지급액</Text>
              <Text style={infoValueHighlight}>{formattedAmount}</Text>
            </Section>

            {/* CTA 버튼 */}
            <Section style={buttonContainer}>
              <Button style={button} href={applicationUrl}>
                지금 신청하기
              </Button>
            </Section>

            <Text style={warningText}>
              ⚠️ 마감일을 놓치면 지원금을 받을 수 없으니 서둘러 신청해주세요.
            </Text>
          </Section>

          {/* 구분선 */}
          <Hr style={hr} />

          {/* 푸터 */}
          <Section style={footer}>
            <Text style={footerText}>
              문의사항이 있으시면 아래로 연락주세요.
            </Text>
            <Text style={footerText}>
              이메일:{" "}
              <a href="mailto:admin@pressco21.com" style={link}>
                admin@pressco21.com
              </a>
            </Text>
            <Text style={footerText}>주소: 서울특별시 강남구 테헤란로 123</Text>
            <Text style={footerTextSmall}>
              본 메일은 발신 전용이며, 회신은 처리되지 않습니다.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ============================================================================
// 스타일 정의 (Inline CSS)
// ============================================================================

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#0f172a", // slate-900
  padding: "32px 24px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "32px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const subtitle = {
  color: "#cbd5e1", // slate-300
  fontSize: "14px",
  margin: "0",
};

const content = {
  padding: "24px",
};

const h2 = {
  color: "#dc2626", // red-600 (긴급)
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 24px",
};

const paragraph = {
  color: "#334155", // slate-700
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const infoBox = {
  backgroundColor: "#f8fafc", // slate-50
  border: "1px solid #e2e8f0", // slate-200
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const infoLabel = {
  color: "#64748b", // slate-500
  fontSize: "14px",
  fontWeight: "500",
  margin: "12px 0 4px",
};

const infoValue = {
  color: "#0f172a", // slate-900
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const infoValueHighlight = {
  color: "#dc2626", // red-600
  fontSize: "24px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#0f172a", // slate-900
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const warningText = {
  color: "#dc2626", // red-600
  fontSize: "14px",
  fontWeight: "500",
  margin: "16px 0",
  padding: "12px",
  backgroundColor: "#fef2f2", // red-50
  borderRadius: "6px",
  border: "1px solid #fecaca", // red-200
};

const hr = {
  borderColor: "#e2e8f0", // slate-200
  margin: "20px 0",
};

const footer = {
  padding: "0 24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#64748b", // slate-500
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

const footerTextSmall = {
  color: "#94a3b8", // slate-400
  fontSize: "12px",
  lineHeight: "16px",
  margin: "16px 0 0",
};

const link = {
  color: "#0f172a", // slate-900
  textDecoration: "underline",
};
