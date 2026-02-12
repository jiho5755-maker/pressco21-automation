"use client";

/**
 * 알림 로그 클라이언트 컴포넌트
 *
 * Phase 3-D Sub-Task 2-4: 알림 로깅 + 관리 UI
 * - 필터링 (유형, 상태, 기간)
 * - 테이블 표시 (발송 일시, 유형, 수신자, 제목, 상태, 이메일 ID)
 * - 페이지네이션
 */

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  getNotificationLogs,
  getNotificationTypes,
  type NotificationLogWithRecipient,
  type GetNotificationLogsParams,
} from "@/actions/notification-log-actions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Mail, CheckCircle, XCircle } from "lucide-react";

// ============================================================================
// 타입 정의
// ============================================================================

type NotificationTypeLabel = {
  [key: string]: { label: string; color: string };
};

const NOTIFICATION_TYPE_LABELS: NotificationTypeLabel = {
  APPROVAL_REQUEST: { label: "결재 요청", color: "bg-blue-500" },
  DOCUMENT_APPROVED: { label: "문서 승인", color: "bg-green-500" },
  DOCUMENT_REJECTED: { label: "문서 반려", color: "bg-red-500" },
  PAYSLIP_READY: { label: "급여명세서", color: "bg-purple-500" },
  SUBSIDY_DEADLINE: { label: "지원금 마감", color: "bg-yellow-500" },
  LEAVE_APPROVED: { label: "휴가 승인", color: "bg-teal-500" },
  SYSTEM: { label: "시스템", color: "bg-gray-500" },
};

// ============================================================================
// 컴포넌트
// ============================================================================

export function NotificationLogsClient() {
  const [logs, setLogs] = useState<NotificationLogWithRecipient[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  // 필터 상태
  const [filters, setFilters] = useState<GetNotificationLogsParams>({
    type: undefined,
    success: undefined,
    startDate: undefined,
    endDate: undefined,
    page: 1,
    limit: 20,
  });

  // 초기 로드: 알림 유형 목록 조회
  useEffect(() => {
    async function fetchTypes() {
      try {
        const result = await getNotificationTypes();
        setTypes(result);
      } catch (error) {
        console.error("알림 유형 조회 실패:", error);
      }
    }
    fetchTypes();
  }, []);

  // 로그 조회
  useEffect(() => {
    async function fetchLogs() {
      setLoading(true);
      try {
        const result = await getNotificationLogs(filters);
        setLogs(result.logs);
        setPagination(result.pagination);
      } catch (error) {
        console.error("알림 로그 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [filters]);

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof GetNotificationLogsParams, value: string | boolean | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // 필터 변경 시 1페이지로 리셋
    }));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      type: undefined,
      success: undefined,
      startDate: undefined,
      endDate: undefined,
      page: 1,
      limit: 20,
    });
  };

  return (
    <div className="space-y-6">
      {/* 필터 카드 */}
      <Card>
        <CardHeader>
          <CardTitle>필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 알림 유형 */}
            <div className="space-y-2">
              <Label>알림 유형</Label>
              <Select
                value={filters.type || "ALL"}
                onValueChange={(value) =>
                  handleFilterChange("type", value === "ALL" ? undefined : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {NOTIFICATION_TYPE_LABELS[type]?.label || type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 발송 상태 */}
            <div className="space-y-2">
              <Label>발송 상태</Label>
              <Select
                value={
                  filters.success === undefined
                    ? "ALL"
                    : filters.success
                      ? "SUCCESS"
                      : "FAILED"
                }
                onValueChange={(value) =>
                  handleFilterChange(
                    "success",
                    value === "ALL" ? undefined : value === "SUCCESS"
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체</SelectItem>
                  <SelectItem value="SUCCESS">성공</SelectItem>
                  <SelectItem value="FAILED">실패</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 시작일 */}
            <div className="space-y-2">
              <Label>시작일</Label>
              <Input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange("startDate", e.target.value || undefined)}
              />
            </div>

            {/* 종료일 */}
            <div className="space-y-2">
              <Label>종료일</Label>
              <Input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange("endDate", e.target.value || undefined)}
              />
            </div>

            {/* 초기화 버튼 */}
            <div className="flex items-end">
              <Button variant="outline" onClick={handleResetFilters} className="w-full">
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 알림 로그 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>발송 이력 ({pagination.total}건)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">로딩 중...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              발송 이력이 없습니다.
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>발송 일시</TableHead>
                    <TableHead>유형</TableHead>
                    <TableHead>수신자</TableHead>
                    <TableHead>제목</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>이메일 ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {format(new Date(log.sentAt), "yyyy-MM-dd HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            NOTIFICATION_TYPE_LABELS[log.type]?.color || "bg-gray-500"
                          }
                        >
                          {NOTIFICATION_TYPE_LABELS[log.type]?.label || log.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {log.recipient.employee?.name || "알 수 없음"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {log.recipientEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{log.subject}</TableCell>
                      <TableCell>
                        {log.success ? (
                          <Badge variant="outline" className="border-green-500 text-green-500">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            성공
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-red-500 text-red-500">
                            <XCircle className="mr-1 h-3 w-3" />
                            실패
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.emailId ? (
                          <code className="text-xs text-muted-foreground">{log.emailId}</code>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* 페이지네이션 */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    페이지 {pagination.page} / {pagination.totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      이전
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                    >
                      다음
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
