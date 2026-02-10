// PDF 다운로드 유틸리티
import { pdf } from "@react-pdf/renderer";
import type { ReactElement } from "react";

/**
 * PDF 다운로드 함수
 * @param pdfDocument - @react-pdf/renderer Document 컴포넌트
 * @param filename - 다운로드할 파일명 (.pdf 확장자 자동 추가)
 */
export async function downloadPDF(
  pdfDocument: ReactElement,
  filename: string
): Promise<void> {
  try {
    // PDF Blob 생성
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const blob = await pdf(pdfDocument as any).toBlob();

    // Blob URL 생성
    const url = URL.createObjectURL(blob);

    // 다운로드 링크 생성 및 클릭
    const link = window.document.createElement("a");
    link.href = url;
    link.download = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    link.click();

    // URL 해제 (메모리 정리)
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("PDF 다운로드 실패:", error);
    throw new Error("PDF 다운로드에 실패했습니다.");
  }
}

/**
 * 파일명 생성 유틸리티
 * @param prefix - 파일명 접두사 (예: "급여명세서")
 * @param year - 연도
 * @param month - 월
 * @param employeeName - 직원 이름 (선택)
 */
export function generatePayrollSlipFilename(
  prefix: string,
  year: number,
  month: number,
  employeeName?: string
): string {
  const yearMonth = `${year}년${month}월`;
  const name = employeeName ? `_${employeeName}` : "";
  return `${prefix}_${yearMonth}${name}`;
}
