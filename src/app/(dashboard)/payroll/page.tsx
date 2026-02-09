// 급여 관리 페이지 — Step 4에서 본격 구현 예정
import { Wallet } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function PayrollPage() {
  return (
    <>
      <PageHeader
        title="급여 관리"
        description="급여 계산 및 명세서를 관리합니다."
      />
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Wallet className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">준비 중입니다</p>
          <p className="text-sm mt-1">
            월별 급여 자동계산, 명세서 조회, Excel 내보내기 기능이 곧 추가됩니다.
          </p>
        </CardContent>
      </Card>
    </>
  );
}
