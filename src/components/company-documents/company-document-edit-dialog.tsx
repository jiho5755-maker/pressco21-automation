// 회사 공용 문서 수정 Dialog (메타데이터만)
"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { CompanyDocument, User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateCompanyDocument } from "@/actions/company-document-actions";
import { COMPANY_DOCUMENT_CATEGORIES } from "@/lib/constants";
import { formatFileSize } from "@/lib/file-upload-validator";

type CompanyDocumentWithUploader = CompanyDocument & {
  uploader: Pick<User, "name" | "email">;
};

interface CompanyDocumentEditDialogProps {
  document: CompanyDocumentWithUploader | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CompanyDocumentEditDialog({
  document,
  open,
  onOpenChange,
  onSuccess,
}: CompanyDocumentEditDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>("");
  const [description, setDescription] = useState("");

  // document 변경 시 폼 초기화
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setCategory(document.category);
      setDescription(document.description || "");
    }
  }, [document]);

  const { execute, isPending } = useAction(updateCompanyDocument, {
    onSuccess: () => {
      toast.success("문서 정보 수정 완료");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "문서 정보 수정 실패");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!document) return;

    // 유효성 검증
    if (!title.trim()) {
      toast.error("제목을 입력해주세요.");
      return;
    }
    if (!category) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    execute({
      id: document.id,
      title: title.trim(),
      category: category as "BANK" | "BUSINESS_LICENSE" | "SEAL" | "TAX" | "OTHER",
      description: description.trim() || undefined,
    });
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>문서 정보 수정</DialogTitle>
            <DialogDescription>
              문서의 제목, 카테고리, 설명을 수정할 수 있습니다. (파일은 수정 불가)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 파일 정보 (읽기 전용) */}
            <div className="space-y-2">
              <Label>파일 정보 (읽기 전용)</Label>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {document.fileName}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{document.mimeType}</span>
                  <span>•</span>
                  <span>{formatFileSize(document.fileSize)}</span>
                </div>
              </div>
            </div>

            {/* 제목 */}
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                제목 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit-title"
                placeholder="예: 신한은행 통장사본"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isPending}
                maxLength={200}
              />
            </div>

            {/* 카테고리 */}
            <div className="space-y-2">
              <Label htmlFor="edit-category">
                카테고리 <span className="text-red-500">*</span>
              </Label>
              <Select value={category} onValueChange={setCategory} disabled={isPending}>
                <SelectTrigger id="edit-category">
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
              <Label htmlFor="edit-description">설명 (선택)</Label>
              <Textarea
                id="edit-description"
                placeholder="추가 설명을 입력하세요..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
