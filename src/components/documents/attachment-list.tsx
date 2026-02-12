// 첨부파일 목록 컴포넌트 (미리보기 지원)
"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { FileText, Download, Trash2, Eye, Image as ImageIcon, FileType } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteAttachment } from "@/actions/attachment-actions";
import { formatFileSize } from "@/lib/file-upload-validator";
import { AttachmentPreviewDialog } from "./attachment-preview-dialog";

interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  createdAt: Date;
}

interface AttachmentListProps {
  attachments: Attachment[];
  canDelete?: boolean;
  onDeleteSuccess?: () => void;
}

export function AttachmentList({
  attachments,
  canDelete = false,
  onDeleteSuccess,
}: AttachmentListProps) {
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { execute: executeDelete, isPending } = useAction(deleteAttachment, {
    onSuccess: () => {
      toast.success("파일이 삭제되었습니다.");
      onDeleteSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "파일 삭제 실패");
    },
  });

  const handleDelete = (id: string, fileName: string) => {
    if (confirm(`"${fileName}" 파일을 삭제하시겠습니까?`)) {
      executeDelete({ id });
    }
  };

  const handleDownload = (id: string) => {
    window.open(`/api/attachments/${id}`, "_blank");
  };

  const handlePreview = (attachment: Attachment) => {
    setPreviewAttachment(attachment);
    setPreviewOpen(true);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === "application/pdf") {
      return <FileText className="h-5 w-5 text-red-500" />;
    }
    if (mimeType === "image/jpeg" || mimeType === "image/png") {
      return <ImageIcon className="h-5 w-5 text-blue-500" />;
    }
    return <FileType className="h-5 w-5 text-gray-500" />;
  };

  const canPreview = (mimeType: string) => {
    return (
      mimeType === "application/pdf" ||
      mimeType === "image/jpeg" ||
      mimeType === "image/png"
    );
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        첨부파일이 없습니다.
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12"></TableHead>
            <TableHead>파일명</TableHead>
            <TableHead>크기</TableHead>
            <TableHead>업로드 일시</TableHead>
            <TableHead className="text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attachments.map((attachment) => (
            <TableRow key={attachment.id}>
              <TableCell>{getFileIcon(attachment.mimeType)}</TableCell>
              <TableCell className="font-medium">{attachment.fileName}</TableCell>
              <TableCell>{formatFileSize(attachment.fileSize)}</TableCell>
              <TableCell>{format(attachment.createdAt, "yyyy-MM-dd HH:mm")}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {canPreview(attachment.mimeType) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(attachment)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment.id)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(attachment.id, attachment.fileName)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* 미리보기 Dialog */}
      <AttachmentPreviewDialog
        attachment={previewAttachment}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
}
