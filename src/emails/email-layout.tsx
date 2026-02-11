/**
 * 이메일 공통 레이아웃 컴포넌트
 *
 * Phase 3-F: 알림 시스템
 * PRESSCO21 브랜드 헤더/푸터 재사용
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

interface EmailLayoutProps {
  /** 이메일 미리보기 텍스트 */
  preview: string;
  /** 이메일 본문 제목 */
  title: string;
  /** 본문 내용 (React 노드) */
  children: ReactNode;
  /** 제목 색상 (선택, 기본: slate-900) */
  titleColor?: string;
}

/**
 * 이메일 레이아웃 (헤더 + 본문 + 푸터)
 *
 * @example
 * ```tsx
 * <EmailLayout preview="결재 요청" title="[결재 요청] 근로계약서">
 *   <Text>본문 내용...</Text>
 * </EmailLayout>
 * ```
 */
export default function EmailLayout({
  preview,
  title,
  children,
  titleColor = "#0f172a", // slate-900
}: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* 헤더 */}
          <Section style={header}>
            <Heading style={h1}>PRESSCO21</Heading>
            <Text style={subtitle}>소기업 경영 자동화 시스템</Text>
          </Section>

          {/* 본문 */}
          <Section style={content}>
            <Heading style={{ ...h2, color: titleColor }}>{title}</Heading>
            {children}
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
  fontSize: "24px",
  fontWeight: "600",
  margin: "0 0 24px",
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

// 재사용 가능한 공통 스타일 export
export const emailStyles = {
  paragraph: {
    color: "#334155", // slate-700
    fontSize: "16px",
    lineHeight: "24px",
    margin: "16px 0",
  },
  infoBox: {
    backgroundColor: "#f8fafc", // slate-50
    border: "1px solid #e2e8f0", // slate-200
    borderRadius: "8px",
    padding: "20px",
    margin: "24px 0",
  },
  infoLabel: {
    color: "#64748b", // slate-500
    fontSize: "14px",
    fontWeight: "500",
    margin: "12px 0 4px",
  },
  infoValue: {
    color: "#0f172a", // slate-900
    fontSize: "16px",
    fontWeight: "600",
    margin: "0 0 12px",
  },
  button: {
    backgroundColor: "#0f172a", // slate-900
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 32px",
  },
  buttonPrimary: {
    backgroundColor: "#0f172a", // slate-900
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 32px",
    marginRight: "12px",
  },
  buttonSecondary: {
    backgroundColor: "#dc2626", // red-600
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 32px",
  },
  buttonContainer: {
    textAlign: "center" as const,
    margin: "32px 0",
  },
  warningBox: {
    color: "#dc2626", // red-600
    fontSize: "14px",
    fontWeight: "500",
    margin: "16px 0",
    padding: "12px",
    backgroundColor: "#fef2f2", // red-50
    borderRadius: "6px",
    border: "1px solid #fecaca", // red-200

  },
  successBox: {
    color: "#16a34a", // green-600
    fontSize: "14px",
    fontWeight: "500",
    margin: "16px 0",
    padding: "12px",
    backgroundColor: "#f0fdf4", // green-50
    borderRadius: "6px",
    border: "1px solid #bbf7d0", // green-200
  },
};
