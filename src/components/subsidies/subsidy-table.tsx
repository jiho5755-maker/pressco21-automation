"use client";

// 정부지원사업 신청 목록 테이블
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
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
import { Search, CheckCircle2, XCircle, Banknote } from "lucide-react";
import { subsidyTypeConfig, subsidyStatusConfig } from "@/lib/ui-config";
import {
  approveSubsidy,
  markSubsidyAsPaid,
} from "@/actions/subsidy-actions";
import { useRole } from "@/hooks/use-role";
import type { SubsidyApplication } from "@prisma/client";

interface SubsidyTableProps {
  applications: Array<
    SubsidyApplication & {
      employee: {
        id: string;
        employeeNo: string;
        name: string;
        department: { name: string };
      };
      submitter: { id: string; name: string | null };
      approver: { id: string; name: string | null } | null;
      replacementEmployee: {
        id: string;
        employeeNo: string;
        name: string;
      } | null;
    }
  >;
}

export function SubsidyTable({ applications }: SubsidyTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { isAdmin, isAdminOrManager } = useRole();

  const { execute: executeApprove, isPending: isApprovePending } = useAction(
    approveSubsidy,
    {
      onSuccess: ({ data }) => {
        toast.success(
          data?.application.status === "APPROVED" ? "승인되었습니다." : "반려되었습니다."
        );
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "처리 중 오류가 발생했습니다.");
      },
    }
  );

  const { execute: executePaid, isPending: isPaidPending } = useAction(
    markSubsidyAsPaid,
    {
      onSuccess: () => {
        toast.success("지급 처리되었습니다.");
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "처리 중 오류가 발생했습니다.");
      },
    }
  );

  const handleApprove = (id: string, requestedAmount: number) => {
    executeApprove({
      id,
      action: "APPROVED",
      approvedAmount: requestedAmount,
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt("반려 사유를 입력하세요:");
    if (!reason) return;
    executeApprove({
      id,
      action: "REJECTED",
      rejectReason: reason,
    });
  };

  const handlePaid = (id: string) => {
    executePaid({ id });
  };

  // 검색 필터링
  const filteredApplications = applications.filter((app) => {
    const query = searchQuery.toLowerCase();
    return (
      app.employee.name.toLowerCase().includes(query) ||
      app.employee.employeeNo.toLowerCase().includes(query) ||
      app.employee.department.name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="직원명, 사번, 부서 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredApplications.length}건
        </div>
      </div>

      {/* 테이블 */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>신청자</TableHead>
              <TableHead>지원금 유형</TableHead>
              <TableHead>귀속 연월</TableHead>
              <TableHead>신청금액</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>신청일</TableHead>
              <TableHead>승인자</TableHead>
              {isAdminOrManager && <TableHead>액션</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isAdminOrManager ? 8 : 7}
                  className="text-center py-8 text-muted-foreground"
                >
                  신청 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications.map((app) => {
                const typeConfig =
                  subsidyTypeConfig[app.type as keyof typeof subsidyTypeConfig];
                const statusConfig =
                  subsidyStatusConfig[app.status as keyof typeof subsidyStatusConfig];

                return (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{app.employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {app.employee.employeeNo} ·{" "}
                          {app.employee.department.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={typeConfig.className}>
                        {typeConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {app.year}년 {app.month}월
                    </TableCell>
                    <TableCell>
                      {app.requestedAmount.toLocaleString()}원
                    </TableCell>
                    <TableCell>
                      <Badge className={statusConfig.className}>
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(app.submittedAt), "yyyy-MM-dd", {
                        locale: ko,
                      })}
                    </TableCell>
                    <TableCell>
                      {app.approver?.name || "-"}
                    </TableCell>
                    {isAdminOrManager && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {app.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleApprove(app.id, app.requestedAmount)
                                }
                                disabled={isApprovePending}
                              >
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                승인
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(app.id)}
                                disabled={isApprovePending}
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                반려
                              </Button>
                            </>
                          )}
                          {app.status === "APPROVED" && isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePaid(app.id)}
                              disabled={isPaidPending}
                            >
                              <Banknote className="mr-1 h-3 w-3" />
                              지급완료
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    )}
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
