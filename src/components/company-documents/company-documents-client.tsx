// 회사 공용 문서 클라이언트 래퍼 (상태 관리)
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { CompanyDocument, User } from "@prisma/client";
import { CompanyDocumentStats } from "./company-document-stats";
import { CompanyDocumentFilters } from "./company-document-filters";
import { CompanyDocumentUpload } from "./company-document-upload";
import { CompanyDocumentTable } from "./company-document-table";
import { CompanyDocumentEditDialog } from "./company-document-edit-dialog";

type CompanyDocumentWithUploader = CompanyDocument & {
  uploader: Pick<User, "name" | "email">;
};

interface CompanyDocumentsClientProps {
  documents: CompanyDocumentWithUploader[];
  userRole: "admin" | "manager" | "viewer";
}

export function CompanyDocumentsClient({
  documents,
  userRole,
}: CompanyDocumentsClientProps) {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingDocument, setEditingDocument] =
    useState<CompanyDocumentWithUploader | null>(null);

  // 카테고리별 문서 수 계산
  const documentCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: documents.length,
    };

    documents.forEach((doc) => {
      counts[doc.category] = (counts[doc.category] || 0) + 1;
    });

    return counts;
  }, [documents]);

  // 필터링된 문서
  const filteredDocuments = useMemo(() => {
    if (!selectedCategory) return documents;
    return documents.filter((doc) => doc.category === selectedCategory);
  }, [documents, selectedCategory]);

  const handleRefresh = () => {
    router.refresh();
  };

  const handleUploadSuccess = () => {
    handleRefresh();
  };

  const handleEdit = (document: CompanyDocumentWithUploader) => {
    setEditingDocument(document);
  };

  const handleEditSuccess = () => {
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <CompanyDocumentStats documents={documents} />

      {/* Admin 전용: 업로드 섹션 */}
      {userRole === "admin" && (
        <CompanyDocumentUpload onUploadSuccess={handleUploadSuccess} />
      )}

      {/* 카테고리 필터 */}
      <CompanyDocumentFilters
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        documentCounts={documentCounts}
      />

      {/* 문서 테이블 */}
      <CompanyDocumentTable
        documents={filteredDocuments}
        userRole={userRole}
        onEdit={handleEdit}
        onRefresh={handleRefresh}
      />

      {/* 수정 Dialog */}
      <CompanyDocumentEditDialog
        document={editingDocument}
        open={!!editingDocument}
        onOpenChange={(open) => {
          if (!open) setEditingDocument(null);
        }}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
}
