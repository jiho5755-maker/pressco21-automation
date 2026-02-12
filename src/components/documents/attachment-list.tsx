// 첨부파일 목록 컴포넌트
"use client";

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { FileText, Download, Trash2 } from "lucide-react";
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
    if (
      !confirm(`"${fileName}" 파일을 삭제하시겠습니까?\n삭제된 파일은 복구할 수 없습니다.`)
    ) {
      return;
    }

    executeDelete({ id });
  };

  const handleDownload = (id: string, fileName: string) => {
    // API 라우트를 통해 다운로드 (RBAC 적용)
    const link = document.createElement("a");
    link.href = `/api/attachments/${id}`;
    link.download = fileName;
    link.target = "_blank";
    link.click();
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        첨부된 파일이 없습니다.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">타입</TableHead>
            <TableHead>파일명</TableHead>
            <TableHead className="w-[100px]">크기</TableHead>
            <TableHead className="w-[150px]">업로드 일시</TableHead>
            <TableHead className="w-[120px] text-right">작업</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attachments.map((attachment) => {
            // MIME 타입별 아이콘 (간단 버전)
            const icon =
              attachment.mimeType === "application/pdf" ? (
                <FileText className="h-5 w-5 text-red-500" />
              ) : attachment.mimeType.startsWith("image/") ? (
                <FileText className="h-5 w-5 text-blue-500" />
              ) : (
                <FileText className="h-5 w-5 text-gray-500" />
              );

            return (
              <TableRow key={attachment.id}>
                <TableCell>{icon}</TableCell>
                <TableCell className="font-medium">
                  {attachment.fileName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatFileSize(attachment.fileSize)}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(attachment.createdAt), "yyyy-MM-dd HH:mm")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        handleDownload(attachment.id, attachment.fileName)
                      }
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleDelete(attachment.id, attachment.fileName)
                        }
                        disabled={isPending}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
