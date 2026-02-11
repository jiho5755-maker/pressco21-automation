/**
 * 결재 요청 이메일 템플릿
 *
 * Phase 3-F: 알림 시스템
 * 문서 제출 시 다음 결재자에게 발송
 */

import { Button, Section, Text } from "@react-email/components";
import EmailLayout, { emailStyles } from "./email-layout";
import type { ApprovalRequestProps } from "@/types/notification";

/**
 * 결재 요청 이메일
 *
 * @example
 * ```tsx
 * <DocumentApprovalRequest
 *   approverName="김부장"
 *   documentTypeName="근로계약서"
 *   documentTitle="장다경님 근로계약서"
 *   creatorName="홍길동"
 *   documentId="cm6g2a8h100006gbqf5fkgjfx"
 * />
 * ```
 */
export default function DocumentApprovalRequest({
  approverName,
  documentTypeName,
  documentTitle,
  creatorName,
  documentId,
}: ApprovalRequestProps) {
  // 문서 상세 URL (프로덕션 절대 URL)
  const documentUrl = `https://pressco21-automation.vercel.app/documents/${documentId}`;

  // CTA 버튼 URL (쿼리 파라미터로 액션 전달)
  const approveUrl = `${documentUrl}?action=approve`;
  const rejectUrl = `${documentUrl}?action=reject`;

  return (
    <EmailLayout
      preview={`[결재 요청] ${documentTypeName} - ${creatorName}`}
      title={`[결재 요청] ${documentTypeName}`}
      titleColor="#2563eb" // blue-600
    >
      <Text style={emailStyles.paragraph}>안녕하세요, {approverName}님</Text>

      <Text style={emailStyles.paragraph}>
        새로운 문서의 결재 요청이 도착했습니다. 아래 내용을 확인하시고 결재
        처리 부탁드립니다.
      </Text>

      {/* 문서 정보 박스 */}
      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>문서 유형</Text>
        <Text style={emailStyles.infoValue}>{documentTypeName}</Text>

        <Text style={emailStyles.infoLabel}>문서 제목</Text>
        <Text style={emailStyles.infoValue}>{documentTitle}</Text>

        <Text style={emailStyles.infoLabel}>작성자</Text>
        <Text style={emailStyles.infoValue}>{creatorName}</Text>

        <Text style={emailStyles.infoLabel}>제출일</Text>
        <Text style={emailStyles.infoValue}>
          {new Intl.DateTimeFormat("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date())}
        </Text>
      </Section>

      {/* CTA 버튼 2개 (승인/반려) */}
      <Section style={emailStyles.buttonContainer}>
        <Button style={emailStyles.buttonPrimary} href={approveUrl}>
          승인하기
        </Button>
        <Button style={emailStyles.buttonSecondary} href={rejectUrl}>
          반려하기
        </Button>
      </Section>

      <Text style={emailStyles.paragraph}>
        또는{" "}
        <a href={documentUrl} style={{ color: "#2563eb", textDecoration: "underline" }}>
          문서 상세 페이지
        </a>
        에서 전체 내용을 확인하실 수 있습니다.
      </Text>

      <Section style={emailStyles.successBox}>
        💡 결재 처리 후 작성자에게 자동으로 알림이 발송됩니다.
      </Section>
    </EmailLayout>
  );
}
