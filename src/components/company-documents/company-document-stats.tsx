// 회사 공용 문서 통계 카드
"use client";

import type { CompanyDocument } from "@prisma/client";
import { FileText, FolderOpen, HardDrive } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { formatFileSize } from "@/lib/file-upload-validator";

interface CompanyDocumentStatsProps {
  documents: CompanyDocument[];
}

export function CompanyDocumentStats({ documents }: CompanyDocumentStatsProps) {
  // 총 문서 수
  const totalCount = documents.length;

  // 고유 카테고리 수
  const uniqueCategories = new Set(documents.map((doc) => doc.category)).size;

  // 총 용량 (bytes)
  const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard
        title="전체 문서"
        value={totalCount.toString()}
        description="등록된 공용 문서"
        icon={<FileText className="h-4 w-4" />}
        trend={undefined}
      />

      <StatCard
        title="카테고리"
        value={uniqueCategories.toString()}
        description="사용 중인 카테고리"
        icon={<FolderOpen className="h-4 w-4" />}
        trend={undefined}
      />

      <StatCard
        title="총 용량"
        value={formatFileSize(totalSize)}
        description="저장 공간 사용량"
        icon={<HardDrive className="h-4 w-4" />}
        trend={undefined}
      />
    </div>
  );
}
