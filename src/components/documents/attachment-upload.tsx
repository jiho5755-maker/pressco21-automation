// 첨부파일 업로드 컴포넌트
"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Upload } from "lucide-react";
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
      // 파일 input 초기화
      const fileInput = document.getElementById(
        "file-upload"
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      onUploadSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "파일 업로드 실패");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    // 클라이언트 검증
    const validation = validateUploadFile(file);
    if (!validation.valid) {
      toast.error(validation.error);
      e.target.value = ""; // input 초기화
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

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
        <Label htmlFor="file-upload">파일 첨부</Label>
        <div className="flex items-center gap-2">
          <input
            id="file-upload"
            type="file"
            accept={ALLOWED_FILE_TYPES.join(",")}
            onChange={handleFileChange}
            disabled={isPending}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50"
          />
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || isPending}
            size="sm"
          >
            <Upload className="h-4 w-4 mr-2" />
            {isPending ? "업로드 중..." : "업로드"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          PDF, JPG, PNG, DOCX 파일만 업로드 가능 (최대{" "}
          {MAX_FILE_SIZE / 1024 / 1024}MB)
        </p>
      </div>
    </div>
  );
}
