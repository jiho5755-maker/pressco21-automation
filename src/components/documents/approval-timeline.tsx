"use client";

// 결재 타임라인 (Phase 3-C)
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { approvalStatusConfig } from "@/lib/ui-config";
import { Check, X, Clock, Minus } from "lucide-react";
import { format } from "date-fns";
import type { Approval, User } from "@prisma/client";

interface ApprovalTimelineProps {
  approvals: (Approval & { approver: User })[];
}

export function ApprovalTimeline({ approvals }: ApprovalTimelineProps) {
  // 결재 순서대로 정렬
  const sortedApprovals = [...approvals].sort(
    (a, b) => a.approvalOrder - b.approvalOrder
  );

  return (
    <div className="space-y-4">
      {sortedApprovals.map((approval, idx) => {
        const statusConfig = approvalStatusConfig[approval.status];
        const isActive = approval.status === "PENDING";
        const isCompleted = approval.status === "APPROVED";
        const isRejected = approval.status === "REJECTED";
        const isSkipped = approval.status === "SKIPPED";

        // 아이콘 선택
        const Icon = isCompleted
          ? Check
          : isRejected
            ? X
            : isSkipped
              ? Minus
              : Clock;

        return (
          <div key={approval.id} className="flex items-start gap-4">
            {/* 순서 표시 */}
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                isCompleted &&
                  "border-green-500 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
                isRejected &&
                  "border-red-500 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                isActive &&
                  "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
                isSkipped &&
                  "border-gray-300 bg-gray-50 text-gray-400 dark:bg-gray-900 dark:text-gray-500"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            {/* 결재자 정보 */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{approval.approver.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {approval.approvalOrder}차
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {approval.approver.email}
                  </div>
                </div>

                {/* 상태 Badge */}
                <Badge className={statusConfig.className}>
                  {statusConfig.label}
                </Badge>
              </div>

              {/* 승인/반려 시각 및 의견 */}
              {(approval.approvedAt || approval.rejectedAt) && (
                <div className="rounded-md bg-muted/50 p-3 text-sm">
                  <div className="mb-1 text-xs text-muted-foreground">
                    {approval.approvedAt &&
                      format(approval.approvedAt, "yyyy-MM-dd HH:mm")}
                    {approval.rejectedAt &&
                      format(approval.rejectedAt, "yyyy-MM-dd HH:mm")}
                  </div>
                  {approval.comment && (
                    <div className="text-foreground">{approval.comment}</div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
