"use client";

// 문서 상세 클라이언트 컴포넌트 (Phase 3-C)
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  FileText,
  Trash2,
  Loader2,
  Archive,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApprovalTimeline } from "./approval-timeline";
import {
  documentTypeConfig,
  documentStatusConfig,
} from "@/lib/ui-config";
import {
  approveDocument,
  rejectDocument,
  deleteDocument,
  issueDocument,
  archiveDocument,
  downloadEmploymentContract,
} from "@/actions/document-actions";
import { AttachmentUpload } from "./attachment-upload";
import { AttachmentList } from "./attachment-list";
import type { Document, Employee, Department, User, Approval, Attachment } from "@prisma/client";
import type { EmploymentContractContent } from "@/types/document";

interface DocumentDetailClientProps {
  document: Document & {
    employee: Employee & { department: Department };
    creator: User;
    approvals: Array<Approval & { approver: User }>;
    attachments: Attachment[];
  };
  currentUserId: string;
  currentUserRole: string;
}

// 금액 포맷팅 (undefined 안전 처리)
function formatCurrency(amount: number | undefined): string {
  if (amount === undefined || amount === null) return "0";
  return amount.toLocaleString("ko-KR");
}

export function DocumentDetailClient({
  document: doc,
  currentUserId,
  currentUserRole,
}: DocumentDetailClientProps) {
  const router = useRouter();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approvalComment, setApprovalComment] = useState("");
  const [targetApprovalId, setTargetApprovalId] = useState<string | null>(null);

  const typeConfig = documentTypeConfig[doc.type];
  const statusConfig = documentStatusConfig[doc.status];

  // 현재 사용자가 처리할 수 있는 결재 찾기
  const myPendingApproval = doc.approvals.find(
    (a) => a.approverId === currentUserId && a.status === "PENDING"
  );

  // 이전 순위가 모두 승인됐는지 확인 (순차 결재)
  const canApprove = myPendingApproval
    ? myPendingApproval.approvalOrder === 1 ||
      doc.approvals
        .filter((a) => a.approvalOrder < myPendingApproval.approvalOrder)
        .every((a) => a.status === "APPROVED")
    : false;

  // Content 파싱 (근로계약서)
  const contractContent =
    doc.type === "EMPLOYMENT_CONTRACT"
      ? (JSON.parse(doc.content) as EmploymentContractContent)
      : null;

  // Server Actions
  const { execute: executeApprove, isPending: isApprovePending } = useAction(
    approveDocument,
    {
      onSuccess: ({ data }) => {
        toast.success(
          data?.documentComplete
            ? "모든 결재가 완료되었습니다."
            : "결재를 승인했습니다."
        );
        setApprovalComment("");
        router.refresh();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "승인 중 오류가 발생했습니다.");
      },
    }
  );

  const { execute: executeReject, isPending: isRejectPending } = useAction(
    rejectDocument,
    {
      onSuccess: () => {
        toast.success("결재를 반려했습니다.");
        setRejectOpen(false);
        setRejectReason("");
        router.refresh();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "반려 중 오류가 발생했습니다.");
      },
    }
  );

  const { execute: executeDelete, isPending: isDeletePending } = useAction(
    deleteDocument,
    {
      onSuccess: () => {
        toast.success("문서가 삭제되었습니다.");
        router.push("/documents");
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
        router.refresh();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "발급 중 오류가 발생했습니다.");
      },
    }
  );

  const { execute: executeArchive, isPending: isArchivePending } = useAction(
    archiveDocument,
    {
      onSuccess: () => {
        toast.success("문서가 보관되었습니다.");
        router.refresh();
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "보관 중 오류가 발생했습니다.");
      },
    }
  );

  const { execute: executeDownload, isPending: isDownloadPending } = useAction(
    downloadEmploymentContract,
    {
      onSuccess: ({ data }) => {
        if (data?.base64 && data?.fileName) {
          // base64 → Blob → 다운로드
          const binaryString = atob(data.base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: "application/pdf" });
          const url = URL.createObjectURL(blob);
          const link = window.document.createElement("a");
          link.href = url;
          link.download = data.fileName;
          link.click();
          URL.revokeObjectURL(url);
          toast.success("PDF가 다운로드되었습니다.");
        }
      },
      onError: ({ error }) => {
        toast.error(error.serverError || "PDF 생성 중 오류가 발생했습니다.");
      },
    }
  );

  const handleApprove = () => {
    if (!myPendingApproval) return;
    executeApprove({
      approvalId: myPendingApproval.id,
      comment: approvalComment || undefined,
    });
  };

  const handleRejectClick = () => {
    if (!myPendingApproval) return;
    setTargetApprovalId(myPendingApproval.id);
    setRejectOpen(true);
  };

  const handleRejectConfirm = () => {
    if (!targetApprovalId || !rejectReason.trim()) return;
    executeReject({
      approvalId: targetApprovalId,
      rejectReason: rejectReason.trim(),
    });
  };

  const handleDelete = () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    executeDelete({ id: doc.id });
  };

  const isAdmin = currentUserRole === "admin";

  return (
    <div className="space-y-6">
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/documents")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            목록으로
          </Button>
          <Badge className={typeConfig.className}>{typeConfig.label}</Badge>
          <Badge className={statusConfig.className}>{statusConfig.label}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {/* PDF 다운로드 (근로계약서만) */}
          {doc.type === "EMPLOYMENT_CONTRACT" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeDownload({ documentId: doc.id })}
              disabled={isDownloadPending}
            >
              {isDownloadPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              PDF 다운로드
            </Button>
          )}

          {/* 발급 (Admin, APPROVED만) */}
          {isAdmin && doc.status === "APPROVED" && (
            <Button
              variant="default"
              size="sm"
              onClick={() => executeIssue({ documentId: doc.id })}
              disabled={isIssuePending}
            >
              <FileText className="mr-2 h-4 w-4" />
              발급
            </Button>
          )}

          {/* 보관 (Admin, ISSUED만) */}
          {isAdmin && doc.status === "ISSUED" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => executeArchive({ documentId: doc.id })}
              disabled={isArchivePending}
            >
              <Archive className="mr-2 h-4 w-4" />
              보관
            </Button>
          )}

          {/* 삭제 (초안/반려만) */}
          {(doc.status === "DRAFT" || doc.status === "REJECTED") && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeletePending}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              삭제
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 좌측: 문서 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle>{doc.title}</CardTitle>
              <CardDescription>
                작성자: {doc.creator.name} | 작성일:{" "}
                {format(doc.createdAt, "yyyy-MM-dd HH:mm")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">대상 직원</span>
                  <p className="font-medium">
                    {doc.employee.name} ({doc.employee.employeeNo})
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">부서</span>
                  <p className="font-medium">{doc.employee.department.name}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">직급</span>
                  <p className="font-medium">{doc.employee.position}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">문서 버전</span>
                  <p className="font-medium">v{doc.versionNumber}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 근로계약서 상세 정보 */}
          {contractContent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">근로계약 조건</CardTitle>
                <CardDescription>
                  {contractContent.contractVariant === "REMOTE"
                    ? "재택근무 계약서 (9개 조항)"
                    : contractContent.contractVariant === "REEMPLOYED"
                      ? "촉탁직 계약서 (10개 조항)"
                      : "포괄임금제 계약서 (10개 조항)"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 회사 정보 */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">회사 정보</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">회사명: </span>
                      {contractContent.companyName}
                    </div>
                    <div>
                      <span className="text-muted-foreground">대표자: </span>
                      {contractContent.representativeName}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 계약 기간 */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">계약 기간</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">시작일: </span>
                      {contractContent.contractStartDate}
                    </div>
                    <div>
                      <span className="text-muted-foreground">종료일: </span>
                      {contractContent.isIndefinite
                        ? "무기한"
                        : contractContent.contractEndDate || "—"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">수습기간: </span>
                      {contractContent.probationPeriod || 3}개월
                    </div>
                  </div>
                </div>

                <Separator />

                {/* 근무 조건 */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">근무 조건</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">근무시간: </span>
                      {contractContent.workingHours.workStartTime} ~{" "}
                      {contractContent.workingHours.workEndTime}
                    </div>
                    <div>
                      <span className="text-muted-foreground">휴게시간: </span>
                      {contractContent.workingHours.breakStartTime || "12:30"} ~{" "}
                      {contractContent.workingHours.breakEndTime || "13:30"}
                    </div>
                    <div>
                      <span className="text-muted-foreground">근무장소: </span>
                      {contractContent.workLocation}
                    </div>
                    <div>
                      <span className="text-muted-foreground">업무내용: </span>
                      {contractContent.jobDescription}
                    </div>
                  </div>
                </div>

                {/* 재택근무 정보 */}
                {contractContent.remoteWork?.isRemote && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        재택근무 조건
                      </h4>
                      <div className="text-sm space-y-1">
                        <div>
                          <span className="text-muted-foreground">
                            재택 요일:{" "}
                          </span>
                          {contractContent.remoteWork.remoteDays}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            근로기준법 58조:{" "}
                          </span>
                          {contractContent.remoteWork.article58Applied
                            ? "적용"
                            : "미적용"}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 포괄임금제 정보 */}
                {contractContent.fixedOT?.useFixedOT && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        포괄임금제 조건
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            고정OT 시간:{" "}
                          </span>
                          월 {contractContent.fixedOT.monthlyFixedOTHours}시간
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            고정OT 수당:{" "}
                          </span>
                          {formatCurrency(
                            contractContent.fixedOT.monthlyFixedOTAmount
                          )}
                          원
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            별도 정산 기준:{" "}
                          </span>
                          월 {contractContent.fixedOT.overtimeThreshold}시간
                          초과
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* 시차출퇴근제 */}
                {contractContent.flexibleSchedule?.useFlexible && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold text-sm mb-2">
                        시차출퇴근제
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">
                            출근 가능 시간:{" "}
                          </span>
                          {contractContent.flexibleSchedule.flexStartTime} ~{" "}
                          {contractContent.flexibleSchedule.flexEndTime}
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            코어타임:{" "}
                          </span>
                          {contractContent.flexibleSchedule.coreStartTime} ~{" "}
                          {contractContent.flexibleSchedule.coreEndTime}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                {/* 급여 정보 */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">급여 정보</h4>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-muted-foreground bg-muted/50 font-medium w-32">
                            기본급
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {formatCurrency(contractContent.salary.baseSalary)}원
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2 px-3 text-muted-foreground bg-muted/50 font-medium">
                            식대
                          </td>
                          <td className="py-2 px-3 text-right font-mono">
                            {formatCurrency(contractContent.salary.mealAllowance)}원
                          </td>
                        </tr>
                        {(contractContent.salary.transportAllowance ?? 0) > 0 && (
                          <tr className="border-b">
                            <td className="py-2 px-3 text-muted-foreground bg-muted/50 font-medium">
                              교통비
                            </td>
                            <td className="py-2 px-3 text-right font-mono">
                              {formatCurrency(contractContent.salary.transportAllowance)}원
                            </td>
                          </tr>
                        )}
                        <tr className="border-b bg-primary/5">
                          <td className="py-2 px-3 font-semibold bg-muted/50">
                            월 지급액
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-semibold text-primary">
                            {formatCurrency(contractContent.salary.monthlyTotalGross)}원
                          </td>
                        </tr>
                        <tr>
                          <td className="py-2 px-3 text-muted-foreground bg-muted/50 font-medium">
                            지급일
                          </td>
                          <td className="py-2 px-3 text-right">
                            매월{" "}
                            {contractContent.salaryPayment.paymentDate === "말일"
                              ? "말일"
                              : `${contractContent.salaryPayment.paymentDate}일`}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 첨부파일 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">첨부파일</CardTitle>
              <CardDescription>
                {doc.attachments.length}개 파일 첨부됨 (최대 5개, 각 5MB 이하)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 업로드 (DRAFT 상태, 작성자/Admin만) */}
              {doc.status === "DRAFT" &&
                (doc.createdBy === currentUserId || isAdmin) && (
                  <AttachmentUpload
                    documentId={doc.id}
                    onUploadSuccess={() => router.refresh()}
                  />
                )}

              {/* 첨부파일 목록 */}
              <AttachmentList
                attachments={doc.attachments}
                canDelete={doc.status === "DRAFT" && isAdmin}
                onDeleteSuccess={() => router.refresh()}
              />
            </CardContent>
          </Card>
        </div>

        {/* 우측: 결재 현황 + 액션 */}
        <div className="space-y-6">
          {/* 결재 타임라인 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">결재 현황</CardTitle>
              <CardDescription>
                {doc.approvals.filter((a) => a.status === "APPROVED").length}/
                {doc.approvals.length} 승인 완료
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalTimeline approvals={doc.approvals} />
            </CardContent>
          </Card>

          {/* 결재 액션 (내 차례인 경우) */}
          {canApprove &&
            doc.status === "PENDING_APPROVAL" && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">결재 처리</CardTitle>
                  <CardDescription>
                    {myPendingApproval?.approvalOrder}차 결재 (내 차례)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="의견을 입력하세요 (선택)"
                    value={approvalComment}
                    onChange={(e) => setApprovalComment(e.target.value)}
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={handleApprove}
                      disabled={isApprovePending}
                    >
                      {isApprovePending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      승인
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleRejectClick}
                      disabled={isRejectPending}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      반려
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>

      {/* 반려 사유 Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>결재 반려</DialogTitle>
            <DialogDescription>
              반려 사유를 입력해주세요. 후속 결재는 자동으로 생략됩니다.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="반려 사유를 입력하세요..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={!rejectReason.trim() || isRejectPending}
            >
              {isRejectPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              반려 확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
