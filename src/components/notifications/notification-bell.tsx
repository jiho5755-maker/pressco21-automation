"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  getUnreadNotificationCount,
  getRecentNotifications,
  markAllNotificationsAsRead,
} from "@/actions/notification-actions";
import { NotificationDropdownItem } from "./notification-dropdown-item";
import Link from "next/link";

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  // 미읽음 개수 조회 (5분 주기 폴링)
  const { execute: fetchUnreadCount } = useAction(getUnreadNotificationCount, {
    onSuccess: ({ data }) => {
      if (data?.count !== undefined) {
        setUnreadCount(data.count);
      }
    },
  });

  // 최근 알림 조회
  const {
    execute: fetchRecentNotifications,
    result,
    isPending,
  } = useAction(getRecentNotifications);

  // 전체 읽음 처리
  const { execute: markAllAsRead, isPending: isMarkingAll } = useAction(
    markAllNotificationsAsRead,
    {
      onSuccess: () => {
        setUnreadCount(0);
        fetchRecentNotifications();
      },
    }
  );

  // 초기 조회 + 5분 주기 폴링
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5 * 60 * 1000); // 5분

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 드롭다운 열릴 때 최근 알림 조회
  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const notifications = result?.data?.notifications || [];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[calc(100vw-2rem)] sm:w-96"
        sideOffset={8}
      >
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>알림</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="h-7 text-xs"
            >
              모두 읽음
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="max-h-[400px] overflow-y-auto">
          {isPending && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              로딩 중...
            </div>
          )}

          {!isPending && notifications.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              알림이 없습니다
            </div>
          )}

          {!isPending &&
            notifications.map((notification) => (
              <NotificationDropdownItem
                key={notification.id}
                notification={notification}
                onRead={() => {
                  fetchUnreadCount();
                  fetchRecentNotifications();
                }}
              />
            ))}
        </div>

        {notifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Link href="/notifications" className="block">
                <Button variant="ghost" className="w-full text-sm">
                  전체 알림 보기
                </Button>
              </Link>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
