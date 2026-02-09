// 사이드바 메뉴 항목 정의
import { LayoutDashboard, Settings } from "lucide-react";
import type { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "전체 현황을 한눈에 확인",
  },
  {
    title: "설정",
    href: "/settings",
    icon: Settings,
    description: "프로필 및 시스템 설정",
  },
];
