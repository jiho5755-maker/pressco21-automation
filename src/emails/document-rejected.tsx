/**
 * 결재 반려 알림 이메일 템플릿
 *
 * Phase 3-F: 알림 시스템
 * 결재 반려 시 작성자에게 발송
 */

import { Button, Section, Text } from "@react-email/components";
import EmailLayout, { emailStyles } from "./email-layout";
import type { ApprovalResultProps } from "@/types/notification";

/**
 * 결재 반려 알림 이메일
 *
 * @example
 * ```tsx
 * <DocumentRejected
 *   creatorName="홍길동"
 *   documentTypeName="근로계약서"
 *   documentTitle="장다경님 근로계약서"
 *   isApproved={false}
 *   approverName="김부장"
 *   rejectionReason="계약 기간이 명확하지 않습니다. 수정 후 재제출 바랍니다."
 *   documentId="cm6g2a8h100006gbqf5fkgjfx"
 * />
 * ```
 */
export default function DocumentRejected({
  creatorName,
  documentTypeName,
  documentTitle,
  approverName,
  rejectionReason,
  documentId,
}: Omit<ApprovalResultProps, "isApproved"> & { rejectionReason: string }) {
  // 문서 상세 URL (프로덕션 절대 URL)
  const documentUrl = `https://pressco21-automation.vercel.app/documents/${documentId}`;

  // 재제출 URL (문서 수정 페이지)
  const resubmitUrl = `${documentUrl}?action=edit`;

  // 반려 일시 (현재 시각)
  const rejectedAt = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());

  return (
    <EmailLayout
      preview={`[결재 반려] ${documentTypeName} 반려됨`}
      title={`[결재 반려] ${documentTypeName}`}
      titleColor="#dc2626" // red-600
    >
      <Text style={emailStyles.paragraph}>안녕하세요, {creatorName}님</Text>

      <Text style={emailStyles.paragraph}>
        제출하신 문서가 반려되었습니다. 아래 반려 사유를 확인하시고 수정 후
        재제출 부탁드립니다.
      </Text>

      {/* 문서 정보 박스 */}
      <Section style={emailStyles.infoBox}>
        <Text style={emailStyles.infoLabel}>문서 유형</Text>
        <Text style={emailStyles.infoValue}>{documentTypeName}</Text>

        <Text style={emailStyles.infoLabel}>문서 제목</Text>
        <Text style={emailStyles.infoValue}>{documentTitle}</Text>

        <Text style={emailStyles.infoLabel}>결재자</Text>
        <Text style={emailStyles.infoValue}>{approverName}</Text>

        <Text style={emailStyles.infoLabel}>반려 일시</Text>
        <Text style={emailStyles.infoValue}>{rejectedAt}</Text>
      </Section>

      {/* 반려 사유 강조 박스 */}
      <Section style={emailStyles.warningBox}>
        <Text style={{ margin: "0 0 8px", fontWeight: "700", fontSize: "16px" }}>
          반려 사유
        </Text>
        <Text style={{ margin: "0" }}>{rejectionReason}</Text>
      </Section>

      {/* CTA 버튼 2개 (재제출/문서확인) */}
      <Section style={emailStyles.buttonContainer}>
        <Button style={emailStyles.buttonPrimary} href={resubmitUrl}>
          문서 수정하기
        </Button>
        <Button
          style={{ ...emailStyles.buttonSecondary, backgroundColor: "#64748b" }}
          href={documentUrl}
        >
          문서 확인하기
        </Button>
      </Section>

      <Text style={emailStyles.paragraph}>
        문의사항이 있으시면 결재자({approverName})에게 직접 연락 부탁드립니다.
      </Text>
    </EmailLayout>
  );
}
