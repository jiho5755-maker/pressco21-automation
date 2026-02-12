// 회사 공용 문서 업로드 컴포넌트 (Admin 전용)
"use client";

import { useState, useCallback } from "react";
import { useAction } from "next-safe-action/hooks";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

interface CompanyDocumentUploadProps {
  onUploadSuccess?: () => void;
}

export function CompanyDocumentUpload({
  onUploadSuccess,
}: CompanyDocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");

  const { execute, isPending } = useAction(uploadCompanyDocument, {
    onSuccess: () => {
      toast.success("문서 업로드 성공");
      // 폼 초기화
      setSelectedFile(null);
      setTitle("");
      setCategory("");
      setDescription("");
      onUploadSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "문서 업로드 실패");
    },
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // 클라이언트 검증
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      return;
    }

    setSelectedFile(file);

    // 파일명에서 제목 자동 추출 (확장자 제거)
    if (!title) {
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setTitle(fileName);
    }
  }, [title]);

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
    multiple: false,
    disabled: isPending,
  });

  const handleUpload = async () => {
    // 유효성 검증
    if (!selectedFile) {
      toast.error("파일을 선택해주세요.");
      return;
    }
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!category) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    execute({
      title: title.trim(),
      category: category as "BANK" | "BUSINESS_LICENSE" | "SEAL" | "TAX" | "OTHER",
      description: description.trim() || undefined,
      file: selectedFile,
    });
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
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
          <Label>파일 선택</Label>
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
              ${isPending ? "opacity-50 cursor-not-allowed" : ""}
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
                  지원 형식: PDF, JPG, PNG, DOCX (최대 {formatFileSize(MAX_FILE_SIZE)})
                </p>
              </div>
            )}
          </div>

          {/* 선택된 파일 표시 */}
          {selectedFile && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveFile}
                disabled={isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* 제목 */}
        <div className="space-y-2">
          <Label htmlFor="title">
            제목 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            placeholder="예: 신한은행 통장사본"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPending}
            maxLength={200}
          />
        </div>

        {/* 카테고리 */}
        <div className="space-y-2">
          <Label htmlFor="category">
            카테고리 <span className="text-red-500">*</span>
          </Label>
          <Select value={category} onValueChange={setCategory} disabled={isPending}>
            <SelectTrigger id="category">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(COMPANY_DOCUMENT_CATEGORIES).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 설명 (선택) */}
        <div className="space-y-2">
          <Label htmlFor="description">설명 (선택)</Label>
          <Textarea
            id="description"
            placeholder="추가 설명을 입력하세요..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isPending}
            rows={3}
          />
        </div>

        {/* 업로드 버튼 */}
        <div className="flex justify-end">
          <Button
            onClick={handleUpload}
            disabled={isPending || !selectedFile || !title.trim() || !category}
          >
            {isPending ? "업로드 중..." : "업로드"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
