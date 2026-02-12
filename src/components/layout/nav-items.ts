// 사이드바 메뉴 항목 정의 — NavGroup[] 구조
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Wallet,
  Receipt,
  HandCoins,
  FileText,
  Settings,
  Calculator,
  TrendingUp,
  PiggyBank,
} from "lucide-react";
import type { NavGroup } from "@/types";

export const navGroups: NavGroup[] = [
  {
    label: "메인",
    items: [
      {
        title: "대시보드",
        href: "/dashboard",
        icon: LayoutDashboard,
        description: "전체 현황을 한눈에 확인",
      },
    ],
  },
  {
    label: "인사관리",
    items: [
      {
        title: "직원 관리",
        href: "/employees",
        icon: Users,
        description: "직원 정보 조회 및 관리",
      },
      {
        title: "근태 관리",
        href: "/attendance",
        icon: Clock,
        description: "출퇴근 기록 및 근태 현황",
      },
      {
        title: "휴가 관리",
        href: "/leaves",
        icon: CalendarDays,
        description: "휴가 신청 및 관리",
      },
    ],
  },
  {
    label: "재무",
    items: [
      {
        title: "급여 관리",
        href: "/payroll",
        icon: Wallet,
        description: "급여 계산 및 명세서",
      },
      {
        title: "경비 신청",
        href: "/expenses",
        icon: Receipt,
        description: "경비 신청 및 내역 확인",
      },
      {
        title: "정부지원사업",
        href: "/subsidies",
        icon: HandCoins,
        description: "정부 지원금 신청 및 관리",
      },
    ],
  },
  {
    label: "행정",
    items: [
      {
        title: "문서 관리",
        href: "/documents",
        icon: FileText,
        description: "근로계약서 및 전자결재",
      },
    ],
  },
  {
    label: "회계",
    requiredRole: "admin", // Admin 전용 그룹
    items: [
      {
        title: "회계 대시보드",
        href: "/accounting",
        icon: Calculator,
        description: "원천징수 및 DC형 부담금",
      },
      {
        title: "원천징수 세액",
        href: "/accounting/withholding-tax",
        icon: Receipt,
        description: "월별 원천징수 세액 집계",
      },
      {
        title: "급여 통계",
        href: "/accounting/payroll-stats",
        icon: TrendingUp,
        description: "부서별/직급별 급여 분석",
      },
      {
        title: "DC형 퇴직연금",
        href: "/accounting/dc-pension",
        icon: PiggyBank,
        description: "재직자별 월 부담금",
      },
    ],
  },
  {
    label: "시스템",
    items: [
      {
        title: "설정",
        href: "/settings",
        icon: Settings,
        description: "프로필 및 시스템 설정",
      },
    ],
  },
];
