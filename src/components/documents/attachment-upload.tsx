// 첨부파일 업로드 컴포넌트 (드래그 앤 드롭 지원)
"use client";

import { useState, useCallback } from "react";
import { useAction } from "next-safe-action/hooks";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Upload, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadAttachment } from "@/actions/attachment-actions";
import {
  validateUploadFile,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/file-upload-validator";

interface AttachmentUploadProps {
  documentId: string;
  onUploadSuccess?: () => void;
}

export function AttachmentUpload({
  documentId,
  onUploadSuccess,
}: AttachmentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { execute, isPending } = useAction(uploadAttachment, {
    onSuccess: () => {
      toast.success("파일 업로드 성공");
      setSelectedFile(null);
      onUploadSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "파일 업로드 실패");
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
    multiple: false,
    disabled: isPending,
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("파일을 선택해주세요.");
      return;
    }

    execute({ documentId, file: selectedFile });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>파일 첨부</Label>

        {/* 드래그 앤 드롭 영역 */}
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            }
            ${isPending ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isDragActive ? (
              <>
                <FileUp className="h-10 w-10 text-primary" />
                <p className="text-sm text-primary font-medium">
                  파일을 여기에 놓으세요
                </p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG, PNG, DOCX (최대{" "}
                  {MAX_FILE_SIZE / 1024 / 1024}MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* 선택된 파일 정보 */}
        {selectedFile && (
          <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2">
              <FileUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              onClick={handleUpload}
              disabled={isPending}
              size="sm"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isPending ? "업로드 중..." : "업로드"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
