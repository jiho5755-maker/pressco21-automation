// 파일 업로드 검증 유틸리티

/**
 * 허용된 파일 타입 (MIME)
 */
export const ALLOWED_FILE_TYPES = [
  "application/pdf", // PDF
  "image/jpeg", // JPG
  "image/png", // PNG
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
] as const;

/**
 * 파일 타입별 확장자 매핑
 */
export const FILE_TYPE_EXTENSIONS: Record<string, string> = {
  "application/pdf": ".pdf",
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
};

/**
 * 최대 파일 크기 (20MB)
 */
export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

/**
 * 파일 검증 결과
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * 파일 업로드 검증
 *
 * 파일 크기와 타입을 검증합니다.
 *
 * @param file - 검증할 파일 객체
 * @returns 검증 결과 (valid, error)
 */
export function validateUploadFile(file: File): FileValidationResult {
  // 1. 파일 크기 검증
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `파일 크기가 너무 큽니다. (최대 ${MAX_FILE_SIZE / 1024 / 1024}MB)`,
    };
  }

  // 2. 파일 타입 검증
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    return {
      valid: false,
      error: "지원하지 않는 파일 형식입니다. (PDF, JPG, PNG, DOCX만 허용)",
    };
  }

  return { valid: true };
}

/**
 * 파일명 정제
 *
 * 특수문자 제거, 공백을 언더스코어로 변환, 타임스탬프 추가
 *
 * @param fileName - 원본 파일명
 * @returns 정제된 파일명
 */
export function sanitizeFileName(fileName: string): string {
  // 확장자 분리
  const lastDotIndex = fileName.lastIndexOf(".");
  const name = lastDotIndex > 0 ? fileName.slice(0, lastDotIndex) : fileName;
  const ext = lastDotIndex > 0 ? fileName.slice(lastDotIndex) : "";

  // 특수문자 제거, 공백을 언더스코어로
  const sanitized = name
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, "") // 특수문자 제거
    .replace(/\s+/g, "_") // 공백을 언더스코어로
    .slice(0, 50); // 최대 50자

  // 타임스탬프 추가 (충돌 방지)
  const timestamp = Date.now();

  return `${sanitized}_${timestamp}${ext}`;
}

/**
 * 파일 크기를 사람이 읽기 쉬운 형식으로 변환
 *
 * @param bytes - 바이트 단위 크기
 * @returns 포맷된 문자열 (예: "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
