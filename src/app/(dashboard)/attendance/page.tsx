// 근태 관리 페이지 — Step 2에서 본격 구현 예정
import { Clock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function AttendancePage() {
  return (
    <>
      <PageHeader
        title="근태 관리"
        description="출퇴근 기록 및 근태 현황을 관리합니다."
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Clock className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">준비 중입니다</p>
          <p className="text-sm mt-1">
            출퇴근 기록, 월별 달력, 근무시간 통계 기능이 곧 추가됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
