/**
 * 결재 승인 알림 이메일 템플릿
 *
 * Phase 3-F: 알림 시스템
 * 결재 승인 완료 시 작성자에게 발송
 */

import { Button, Section, Text } from "@react-email/components";
import EmailLayout, { emailStyles } from "./email-layout";
import type { ApprovalResultProps } from "@/types/notification";

/**
 * 결재 승인 알림 이메일
 *
 * @example
 * ```tsx
 * <DocumentApproved
 *   creatorName="홍길동"
 *   documentTypeName="근로계약서"
 *   documentTitle="장다경님 근로계약서"
 *   isApproved={true}
 *   approverName="김부장"
 *   documentId="cm6g2a8h100006gbqf5fkgjfx"
 * />
 * ```
 */
export default function DocumentApproved({
  creatorName,
  documentTypeName,
  documentTitle,
  approverName,
  documentId,
}: Omit<ApprovalResultProps, "isApproved" | "rejectionReason">) {
  // 문서 상세 URL (프로덕션 절대 URL)
  const documentUrl = `https://pressco21-automation.vercel.app/documents/${documentId}`;

  // 승인 일시 (현재 시각)
  const approvedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <EmailLayout
      preview={`[결재 승인] ${documentTypeName} 승인 완료`}
      title={`[결재 승인] ${documentTypeName}`}
      titleColor="#16a34a" // green-600
    >
      <Text style={emailStyles.paragraph}>안녕하세요, {creatorName}님</Text>

      <Text style={emailStyles.paragraph}>
        제출하신 문서가 승인되었습니다. 축하드립니다! 🎉
      </Text>

      {/* 문서 정보 박스 */}
      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>문서 유형</Text>
        <Text style={emailStyles.infoValue}>{documentTypeName}</Text>

        <Text style={emailStyles.infoLabel}>문서 제목</Text>
        <Text style={emailStyles.infoValue}>{documentTitle}</Text>

        <Text style={emailStyles.infoLabel}>결재자</Text>
        <Text style={emailStyles.infoValue}>{approverName}</Text>

        <Text style={emailStyles.infoLabel}>승인 일시</Text>
        <Text style={emailStyles.infoValue}>{approvedAt}</Text>
      </Section>

      {/* CTA 버튼 */}
      <Section style={emailStyles.buttonContainer}>
        <Button style={emailStyles.button} href={documentUrl}>
          문서 확인하기
        </Button>
      </Section>

      <Section style={emailStyles.successBox}>
        ✅ 모든 결재가 완료되었습니다. 문서 상세 페이지에서 PDF 다운로드가
        가능합니다.
      </Section>
    </EmailLayout>
  );
}
