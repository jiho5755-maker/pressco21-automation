// 공통 타입 정의

/** 네비게이션 메뉴 항목 타입 */
export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

/** 네비게이션 그룹 타입 */
export interface NavGroup {
  label: string;
  items: NavItem[];
}
