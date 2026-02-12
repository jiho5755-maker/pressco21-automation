// 회사 공용 문서 테이블 컴포넌트
"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Download, Edit, Trash2, Eye, FileText } from "lucide-react";
import type { CompanyDocument, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AttachmentPreviewDialog } from "@/components/documents/attachment-preview-dialog";
import { deleteCompanyDocument } from "@/actions/company-document-actions";
import { companyDocumentCategoryConfig } from "@/lib/ui-config";
import { formatFileSize } from "@/lib/file-upload-validator";

type CompanyDocumentWithUploader = CompanyDocument & {
  uploader: Pick<User, "name" | "email">;
};

interface CompanyDocumentTableProps {
  documents: CompanyDocumentWithUploader[];
  userRole: "admin" | "manager" | "viewer";
  onEdit?: (document: CompanyDocumentWithUploader) => void;
  onRefresh?: () => void;
}

export function CompanyDocumentTable({
  documents,
  userRole,
  onEdit,
  onRefresh,
}: CompanyDocumentTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDocument, setDeletingDocument] =
    useState<CompanyDocumentWithUploader | null>(null);
  const [previewDocument, setPreviewDocument] =
    useState<CompanyDocumentWithUploader | null>(null);

  const { execute: executeDelete, isPending: isDeleting } = useAction(
    deleteCompanyDocument,
    {
      onSuccess: () => {
        toast.success("문서 삭제 완료");
        setDeleteDialogOpen(false);
        setDeletingDocument(null);
        onRefresh?.();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "문서 삭제 실패");
      },
    }
  );

  const handleDeleteClick = (document: CompanyDocumentWithUploader) => {
    setDeletingDocument(document);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!deletingDocument) return;
    executeDelete({ id: deletingDocument.id });
  };

  const handleDownload = async (doc: CompanyDocumentWithUploader) => {
    try {
      // Vercel Blob URL에서 파일 가져오기
      const response = await fetch(doc.fileUrl);
      if (!response.ok) throw new Error("파일 다운로드 실패");

      const blob = await response.blob();

      // Blob URL 생성
      const blobUrl = window.URL.createObjectURL(blob);

      // 임시 <a> 태그 생성하여 다운로드 트리거
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = doc.fileName; // 원본 파일명으로 다운로드
      window.document.body.appendChild(link);
      link.click();

      // 정리
      window.document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      toast.success("다운로드 시작");
    } catch (error) {
      console.error("[handleDownload] 다운로드 실패", error);
      toast.error("파일 다운로드 중 오류가 발생했습니다.");
    }
  };

  const handlePreview = (document: CompanyDocumentWithUploader) => {
    setPreviewDocument(document);
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-lg">
        <FileText className="h-12 w-12 mx-auto text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
          등록된 문서가 없습니다
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {userRole === "admin"
            ? "새 문서를 업로드하여 시작하세요."
            : "관리자가 문서를 업로드할 때까지 기다려주세요."}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">제목</TableHead>
              <TableHead className="w-[15%]">카테고리</TableHead>
              <TableHead className="w-[15%]">파일명</TableHead>
              <TableHead className="w-[10%]">크기</TableHead>
              <TableHead className="w-[15%]">업로드자</TableHead>
              <TableHead className="w-[10%]">업로드일</TableHead>
              <TableHead className="w-[5%] text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document) => {
              const categoryConfig =
                companyDocumentCategoryConfig[document.category];

              return (
                <TableRow key={document.id}>
                  {/* 제목 */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {document.title}
                      </p>
                      {document.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                          {document.description}
                        </p>
                      )}
                    </div>
                  </TableCell>

                  {/* 카테고리 */}
                  <TableCell>
                    {categoryConfig && (
                      <Badge variant="outline" className={categoryConfig.className}>
                        {categoryConfig.label}
                      </Badge>
                    )}
                  </TableCell>

                  {/* 파일명 */}
                  <TableCell>
                    <p className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                      {document.fileName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {document.mimeType}
                    </p>
                  </TableCell>

                  {/* 크기 */}
                  <TableCell>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatFileSize(document.fileSize)}
                    </p>
                  </TableCell>

                  {/* 업로드자 */}
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {document.uploader.name || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {document.uploader.email}
                      </p>
                    </div>
                  </TableCell>

                  {/* 업로드일 */}
                  <TableCell>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDistanceToNow(new Date(document.createdAt), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </TableCell>

                  {/* 작업 */}
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {/* 미리보기 (모든 사용자) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(document)}
                        title="미리보기"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* 다운로드 (모든 사용자) */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(document)}
                        title="다운로드"
                      >
                        <Download className="h-4 w-4" />
                      </Button>

                      {/* 수정 (Admin만) */}
                      {userRole === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit?.(document)}
                          title="수정"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}

                      {/* 삭제 (Admin만) */}
                      {userRole === "admin" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(document)}
                          title="삭제"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
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

      {/* 삭제 확인 Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>문서 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingDocument && (
                <>
                  <strong>{deletingDocument.title}</strong> 문서를 삭제하시겠습니까?
                  <br />
                  파일도 함께 삭제되며, 복구할 수 없습니다.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 미리보기 Dialog */}
      {previewDocument && (
        <AttachmentPreviewDialog
          attachment={{
            id: previewDocument.id,
            fileName: previewDocument.fileName,
            fileUrl: previewDocument.fileUrl,
            fileSize: previewDocument.fileSize,
            mimeType: previewDocument.mimeType,
          }}
          open={!!previewDocument}
          onOpenChange={(open) => {
            if (!open) setPreviewDocument(null);
          }}
        />
      )}
    </>
  );
}
