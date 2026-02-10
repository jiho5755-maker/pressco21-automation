// 미처리 승인 카드 (경비 + 휴가)
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/salary-calculator";

interface PendingExpense {
  id: string;
  employeeName: string;
  category: string;
  amount: number;
  date: Date;
}

interface PendingLeave {
  id: string;
  employeeName: string;
  leaveType: string;
  startDate: Date;
  endDate: Date;
  days: number;
}

interface PendingApprovalsCardProps {
  expenses: PendingExpense[];
  leaves: PendingLeave[];
}

export function PendingApprovalsCard({
  expenses,
  leaves,
}: PendingApprovalsCardProps) {
  const total = expenses.length + leaves.length;

  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            미처리 승인
          </CardTitle>
          <CardDescription>경비 및 휴가 승인 대기</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            승인 대기 중인 항목이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-blue-600" />
          미처리 승인 ({total}건)
        </CardTitle>
        <CardDescription>경비 {expenses.length}건, 휴가 {leaves.length}건</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* 경비 */}
          {expenses.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">경비 신청</h4>
              <div className="space-y-2">
                {expenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{expense.employeeName}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category} • {format(expense.date, "yyyy-MM-dd")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 휴가 */}
          {leaves.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">휴가 신청</h4>
              <div className="space-y-2">
                {leaves.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{leave.employeeName}</p>
                      <p className="text-xs text-muted-foreground">
                        {leave.leaveType} • {format(leave.startDate, "yyyy-MM-dd")} ~{" "}
                        {format(leave.endDate, "yyyy-MM-dd")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{leave.days}일</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
