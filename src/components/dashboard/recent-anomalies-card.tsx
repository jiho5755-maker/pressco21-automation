// 최근 근태 이상 카드
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { format } from "date-fns";

interface AnomalyRecord {
  id: string;
  employeeName: string;
  date: Date;
  clockIn: Date | null;
  clockOut: Date | null;
  workMinutes: number | null;
}

interface RecentAnomaliesCardProps {
  data: AnomalyRecord[];
}

export function RecentAnomaliesCard({ data }: RecentAnomaliesCardProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            최근 근태 이상
          </CardTitle>
          <CardDescription>최근 7일 지각/조퇴 기록</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            최근 7일간 근태 이상 기록이 없습니다.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-yellow-600" />
          최근 근태 이상
        </CardTitle>
        <CardDescription>최근 7일 지각/조퇴 기록</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((record) => {
            const isLate = record.clockIn && record.clockIn.getHours() >= 9;
            const isEarlyLeave =
              record.workMinutes !== null && record.workMinutes < 480;

            return (
              <div
                key={record.id}
                className="flex items-center justify-between border-b pb-2 last:border-0"
              >
                <div>
                  <p className="font-medium">{record.employeeName}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(record.date, "yyyy-MM-dd")}
                  </p>
                </div>
                <div className="text-right">
                  {isLate && (
                    <span className="text-sm text-yellow-600">
                      지각 ({record.clockIn && format(record.clockIn, "HH:mm")})
                    </span>
                  )}
                  {isEarlyLeave && (
                    <span className="text-sm text-yellow-600">
                      조퇴 ({record.workMinutes}분)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
