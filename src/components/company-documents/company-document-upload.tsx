// 회사 공용 문서 업로드 컴포넌트 (Admin 전용, 다중 파일 지원)
"use client";

import { useState, useCallback } from "react";
import { useAction } from "next-safe-action/hooks";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, FileUp, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { uploadCompanyDocument } from "@/actions/company-document-actions";
import {
  validateUploadFile,
  MAX_FILE_SIZE,
  formatFileSize,
} from "@/lib/file-upload-validator";
import { COMPANY_DOCUMENT_CATEGORIES } from "@/lib/constants";

interface FileWithMetadata {
  file: File;
  id: string; // 임시 ID (Date.now() + index)
  title: string;
  category: string;
  description: string;
  uploading: boolean;
  uploaded: boolean;
  error?: string;
}

interface CompanyDocumentUploadProps {
  onUploadSuccess?: () => void;
}

export function CompanyDocumentUpload({
  onUploadSuccess,
}: CompanyDocumentUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithMetadata[]>([]);
  const [isUploadingAll, setIsUploadingAll] = useState(false);

  const { execute } = useAction(uploadCompanyDocument, {
    onSuccess: () => {
      // 개별 파일 업로드 성공 시 처리는 handleUploadAll에서
    },
    onError: () => {
      // 개별 파일 업로드 실패 시 처리는 handleUploadAll에서
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const newFiles: FileWithMetadata[] = [];

    for (const file of acceptedFiles) {
      // 클라이언트 검증
      const validation = validateUploadFile(file);
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        continue;
      }

      // 파일명에서 제목 자동 추출 (확장자 제거)
      const fileName = file.name.replace(/\.[^/.]+$/, "");

      newFiles.push({
        file,
        id: `${Date.now()}-${Math.random()}`,
        title: fileName,
        category: "", // 빈 값, 사용자가 선택해야 함
        description: "",
        uploading: false,
        uploaded: false,
      });
    }

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    toast.success(`${newFiles.length}개 파일이 추가되었습니다.`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true, // 다중 파일 허용
    disabled: isUploadingAll,
  });

  const handleRemoveFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleUpdateMetadata = (
    id: string,
    field: "title" | "category" | "description",
    value: string
  ) => {
    setSelectedFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleUploadAll = async () => {
    // 유효성 검증
    const invalidFiles = selectedFiles.filter(
      (f) => !f.title.trim() || !f.category
    );
    if (invalidFiles.length > 0) {
      toast.error("모든 파일의 제목과 카테고리를 입력해주세요.");
      return;
    }

    setIsUploadingAll(true);

    let successCount = 0;
    let failCount = 0;

    // 순차 업로드
    for (const fileData of selectedFiles) {
      if (fileData.uploaded) continue; // 이미 업로드된 파일 스킵

      // 업로딩 상태 표시
      setSelectedFiles((prev) =>
        prev.map((f) => (f.id === fileData.id ? { ...f, uploading: true } : f))
      );

      try {
        await execute({
          title: fileData.title.trim(),
          category: fileData.category as
            | "BANK"
            | "BUSINESS_LICENSE"
            | "SEAL"
            | "TAX"
            | "OTHER",
          description: fileData.description.trim() || undefined,
          file: fileData.file,
        });

        // 오류 없이 완료되면 성공
        successCount++;
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id
              ? { ...f, uploading: false, uploaded: true }
              : f
          )
        );
      } catch (error) {
        failCount++;
        console.error(`[Upload] ${fileData.file.name} 업로드 실패`, error);
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.id === fileData.id
              ? {
                  ...f,
                  uploading: false,
                  error: "업로드 중 오류 발생",
                }
              : f
          )
        );
      }
    }

    setIsUploadingAll(false);

    // 결과 알림
    if (successCount > 0 && failCount === 0) {
      toast.success(`${successCount}개 문서 업로드 완료`);
      // 성공한 파일 제거
      setSelectedFiles((prev) => prev.filter((f) => !f.uploaded));
      onUploadSuccess?.();
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`${successCount}개 성공, ${failCount}개 실패`);
    } else if (failCount > 0) {
      toast.error(`${failCount}개 파일 업로드 실패`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          새 문서 업로드
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 파일 선택 */}
        <div className="space-y-2">
          <Label>파일 선택 (여러 개 가능)</Label>
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
              transition-colors
              ${
                isDragActive
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                  : "border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600"
              }
              ${isUploadingAll ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            <input {...getInputProps()} />
            <FileUp className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            {isDragActive ? (
              <p className="text-sm text-blue-600 dark:text-blue-400">
                파일을 놓아주세요...
              </p>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <span className="font-medium text-blue-600 dark:text-blue-400">
                    클릭
                  </span>
                  하거나 파일을 드래그하여 업로드
                </p>
                <p className="text-xs">
                  지원 형식: PDF, JPG, PNG, DOCX (최대{" "}
                  {formatFileSize(MAX_FILE_SIZE)})
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 선택된 파일 목록 */}
        {selectedFiles.length > 0 && (
          <div className="space-y-3">
            <Label>
              선택된 파일 ({selectedFiles.filter((f) => !f.uploaded).length}
              개)
            </Label>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedFiles.map((fileData) => (
                <div
                  key={fileData.id}
                  className={`p-3 border rounded-lg space-y-2 ${
                    fileData.uploaded
                      ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                      : fileData.error
                        ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                        : "bg-gray-50 dark:bg-gray-900"
                  }`}
                >
                  {/* 파일 정보 및 삭제 버튼 */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {fileData.uploading ? (
                        <Loader2 className="h-4 w-4 text-blue-500 animate-spin flex-shrink-0" />
                      ) : fileData.uploaded ? (
                        <FileUp className="h-4 w-4 text-green-600 flex-shrink-0" />
                      ) : fileData.error ? (
                        <X className="h-4 w-4 text-red-600 flex-shrink-0" />
                      ) : (
                        <FileUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {fileData.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(fileData.file.size)}
                        </p>
                        {fileData.error && (
                          <p className="text-xs text-red-600 mt-1">
                            {fileData.error}
                          </p>
                        )}
                      </div>
                    </div>
                    {!fileData.uploaded && !fileData.uploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(fileData.id)}
                        disabled={isUploadingAll}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* 메타데이터 입력 (업로드 전에만) */}
                  {!fileData.uploaded && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-2 border-t">
                      {/* 제목 */}
                      <Input
                        placeholder="제목 *"
                        value={fileData.title}
                        onChange={(e) =>
                          handleUpdateMetadata(
                            fileData.id,
                            "title",
                            e.target.value
                          )
                        }
                        disabled={isUploadingAll || fileData.uploading}
                        className="text-sm"
                      />

                      {/* 카테고리 */}
                      <Select
                        value={fileData.category}
                        onValueChange={(value) =>
                          handleUpdateMetadata(fileData.id, "category", value)
                        }
                        disabled={isUploadingAll || fileData.uploading}
                      >
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="카테고리 *" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(COMPANY_DOCUMENT_CATEGORIES).map(
                            ([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>

                      {/* 설명 */}
                      <Input
                        placeholder="설명 (선택)"
                        value={fileData.description}
                        onChange={(e) =>
                          handleUpdateMetadata(
                            fileData.id,
                            "description",
                            e.target.value
                          )
                        }
                        disabled={isUploadingAll || fileData.uploading}
                        className="text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 업로드 버튼 */}
        {selectedFiles.filter((f) => !f.uploaded).length > 0 && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedFiles([])}
              disabled={isUploadingAll}
            >
              모두 취소
            </Button>
            <Button onClick={handleUploadAll} disabled={isUploadingAll}>
              {isUploadingAll ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                `모두 업로드 (${selectedFiles.filter((f) => !f.uploaded).length}개)`
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
