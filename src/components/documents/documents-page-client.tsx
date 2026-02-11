"use client";

// 문서 관리 페이지 클라이언트 래퍼 (Phase 3-C)
import { DocumentStatsCards } from "./document-stats-cards";
import { DocumentTable } from "./document-table";
import { DocumentFormDialog } from "./document-form-dialog";
import type { Document, Employee, Department, User, Approval } from "@prisma/client";

interface DocumentsPageClientProps {
  documents: Array<
    Document & {
      employee: Employee & {
        department: Department;
      };
      creator: User;
      approvals: Array<Approval & { approver: User }>;
    }
  >;
  employees: Array<Employee & { department: Department }>;
  users: User[];
}

export function DocumentsPageClient({
  documents,
  employees,
  users,
}: DocumentsPageClientProps) {
  // 통계 계산
  const stats = {
    total: documents.length,
    pending: documents.filter((d) => d.status === "PENDING_APPROVAL").length,
    approved: documents.filter((d) => d.status === "APPROVED").length,
    rejected: documents.filter((d) => d.status === "REJECTED").length,
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <DocumentStatsCards stats={stats} />

      {/* 액션 버튼 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          총 {documents.length}개의 문서
        </div>
        <DocumentFormDialog employees={employees} users={users} />
      </div>

      {/* 문서 테이블 */}
      <DocumentTable documents={documents} />
    </div>
  );
}
