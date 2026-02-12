import { redirect } from "next/navigation";

// 퇴직금 추계(DB형) → DC형 퇴직연금 리다이렉트
export default function SeverancePayRedirectPage() {
  redirect("/accounting/dc-pension");
}
