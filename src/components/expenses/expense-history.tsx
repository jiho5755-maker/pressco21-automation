// 최근 경비 내역 — Prisma 타입 기반
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { expenseStatusBadgeConfig } from "@/lib/ui-config";
import type { Expense } from "@prisma/client";

interface ExpenseHistoryProps {
  expenses: Expense[];
}

export function ExpenseHistory({ expenses }: ExpenseHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>최근 내역</CardTitle>
        <CardDescription>최근 신청된 경비 내역입니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>항목</TableHead>
              <TableHead className="text-right">금액</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses.length > 0 ? (
              expenses.map((expense) => {
                const config = expenseStatusBadgeConfig[expense.status] || {
                  label: expense.status,
                  className: "",
                };
                return (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{expense.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {expense.category} ·{" "}
                          {format(new Date(expense.date), "M월 d일", {
                            locale: ko,
                          })}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {expense.amount.toLocaleString()}원
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={config.className}>
                        {config.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="h-24 text-center text-muted-foreground"
                >
                  경비 내역이 없습니다.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
