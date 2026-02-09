// 휴가 관리 페이지 — Step 3에서 본격 구현 예정
import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function LeavesPage() {
  return (
    <>
      <PageHeader
        title="휴가 관리"
        description="휴가 신청 및 승인 현황을 관리합니다."
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">준비 중입니다</p>
          <p className="text-sm mt-1">
            휴가 신청, 잔여 연차 확인, 관리자 승인 기능이 곧 추가됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
