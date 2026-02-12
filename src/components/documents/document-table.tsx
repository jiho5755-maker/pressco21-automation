"use client";

// 문서 목록 테이블 (Phase 3-C)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Eye,
  CheckCircle2,
  Trash2,
  FileText,
} from "lucide-react";
import {
  documentTypeConfig,
  documentStatusConfig,
} from "@/lib/ui-config";
import { deleteDocument, issueDocument } from "@/actions/document-actions";
import { useRole } from "@/hooks/use-role";
import type { Document, Employee, Department, User, Approval } from "@prisma/client";

interface DocumentTableProps {
  documents: Array<
    Document & {
      employee: Employee & {
        department: Department;
      };
      creator: User;
      approvals: Array<Approval & { approver: User }>;
    }
  >;
}

export function DocumentTable({ documents }: DocumentTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin } = useRole();
  const router = useRouter();

  const { execute: executeDelete, isPending: isDeletePending } = useAction(
    deleteDocument,
    {
      onSuccess: () => {
        toast.success("문서가 삭제되었습니다.");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "삭제 중 오류가 발생했습니다.");
      },
    }
  );

  const { execute: executeIssue, isPending: isIssuePending } = useAction(
    issueDocument,
    {
      onSuccess: () => {
        toast.success("문서가 발급되었습니다.");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "발급 중 오류가 발생했습니다.");
      },
    }
  );

  const handleDelete = (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    executeDelete({ id });
  };

  const handleIssue = (documentId: string) => {
    if (!confirm("문서를 발급하시겠습니까?")) return;
    executeIssue({ documentId });
  };

  const handleViewDetail = (id: string) => {
    router.push(`/documents/${id}`);
  };

  // 검색 필터링
  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(query) ||
      doc.employee.name.toLowerCase().includes(query) ||
      doc.employee.employeeNo.toLowerCase().includes(query) ||
      doc.creator.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="문서 제목, 직원명, 사번, 작성자로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>문서 유형</TableHead>
              <TableHead>제목</TableHead>
              <TableHead>대상 직원</TableHead>
              <TableHead>작성자</TableHead>
              <TableHead>작성일</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>결재 진행</TableHead>
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDocuments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  {searchQuery
                    ? "검색 결과가 없습니다."
                    : "등록된 문서가 없습니다."}
                </TableCell>
              </TableRow>
            ) : (
              filteredDocuments.map((doc) => {
                const typeConfig = documentTypeConfig[doc.type];
                const statusConfig = documentStatusConfig[doc.status];

                // 결재 진행률 계산
                const totalApprovals = doc.approvals.length;
                const completedApprovals = doc.approvals.filter(
                  (a) => a.status === "APPROVED"
                ).length;
                const approvalProgress =
                  totalApprovals > 0
                    ? `${completedApprovals}/${totalApprovals}`
                    : "—";

                return (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Badge className={typeConfig.className}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell>
                      <div>
                        <div>{doc.employee.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {doc.employee.employeeNo} · {doc.employee.department.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{doc.creator.name}</div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(doc.createdAt, "yyyy-MM-dd")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{approvalProgress}</span>
                        {completedApprovals > 0 && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(doc.id)}
                        >
                          <Eye className="mr-1 h-4 w-4" />
                          상세
                        </Button>

                        {/* 발급 버튼 (Admin 전용, APPROVED 상태만) */}
                        {isAdmin && doc.status === "APPROVED" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleIssue(doc.id)}
                            disabled={isIssuePending}
                          >
                            <FileText className="mr-1 h-4 w-4" />
                            발급
                          </Button>
                        )}

                        {/* 삭제 버튼 (초안/반려만) */}
                        {(doc.status === "DRAFT" || doc.status === "REJECTED") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(doc.id)}
                            disabled={isDeletePending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
