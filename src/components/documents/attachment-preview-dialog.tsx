// 첨부파일 미리보기 Dialog
"use client";

import { useState } from "react";
import { X, Download, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
interface AttachmentPreviewDialogProps {
  attachment: {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileUrl: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AttachmentPreviewDialog({
  attachment,
  open,
  onOpenChange,
}: AttachmentPreviewDialogProps) {
  const [imageError, setImageError] = useState(false);

  if (!attachment) return null;

  const isImage =
    attachment.mimeType === "image/jpeg" ||
    attachment.mimeType === "image/png";
  const isPDF = attachment.mimeType === "application/pdf";

  const handleDownload = () => {
    window.open(`/api/attachments/${attachment.id}`, "_blank");
  };

  const handleOpenInNewTab = () => {
    window.open(attachment.fileUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>{attachment.fileName}</DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
              {(isImage || isPDF) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleOpenInNewTab}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  새 탭에서 열기
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="relative w-full overflow-auto" style={{ maxHeight: "70vh" }}>
          {isImage && !imageError ? (
            <div className="relative w-full min-h-[400px]">
              <Image
                src={attachment.fileUrl}
                alt={attachment.fileName}
                width={800}
                height={600}
                className="w-full h-auto"
                onError={() => setImageError(true)}
                unoptimized // Vercel Blob URL은 최적화 불필요
              />
            </div>
          ) : isPDF ? (
            <iframe
              src={attachment.fileUrl}
              className="w-full h-[70vh] border-0"
              title={attachment.fileName}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-muted-foreground mb-4">
                이 파일 형식은 미리보기를 지원하지 않습니다.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                파일 유형: {attachment.mimeType}
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
            </div>
          )}

          {imageError && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <p className="text-destructive mb-4">
                이미지를 불러올 수 없습니다.
              </p>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                다운로드
              </Button>
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          크기: {(attachment.fileSize / 1024 / 1024).toFixed(2)} MB
        </div>
      </DialogContent>
    </Dialog>
  );
}
