"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { BellOff, CheckCircle2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import type { Notification } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/actions/notification-actions";
import { cn } from "@/lib/utils";
import { NOTIFICATION_TYPES } from "@/lib/constants";

interface NotificationsPageClientProps {
  initialNotifications: Notification[];
  totalCount: number;
  unreadCount: number;
}

export function NotificationsPageClient({
  initialNotifications,
  totalCount,
  unreadCount,
}: NotificationsPageClientProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [currentUnreadCount, setCurrentUnreadCount] = useState(unreadCount);

  // 전체 읽음 처리
  const { execute: markAllAsRead, isPending: isMarkingAll } = useAction(
    markAllNotificationsAsRead,
    {
      onSuccess: () => {
        setCurrentUnreadCount(0);
        setNotifications((prev) =>
          prev.map((n) => ({
            ...n,
            isRead: true,
            readAt: new Date(),
          }))
        );
      },
    }
  );

  // 개별 읽음 처리
  const { execute: markAsRead } = useAction(markNotificationAsRead, {
    onSuccess: ({ input }) => {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === input.notificationId
            ? { ...n, isRead: true, readAt: new Date() }
            : n
        )
      );
      setCurrentUnreadCount((prev) => Math.max(0, prev - 1));
    },
  });

  const handleNotificationClick = async (notification: Notification) => {
    // 읽음 처리
    if (!notification.isRead) {
      markAsRead({ notificationId: notification.id });
    }

    // actionUrl 이동
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  // 빈 상태
  if (notifications.length === 0) {
    const isEmpty = totalCount === 0;
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        {isEmpty ? (
          <>
            <BellOff className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold">알림이 없습니다</h3>
            <p className="text-sm text-muted-foreground">
              새로운 알림이 도착하면 여기에 표시됩니다.
            </p>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <h3 className="text-lg font-semibold">모든 알림을 확인했습니다</h3>
            <p className="text-sm text-muted-foreground">
              새로운 알림이 도착하면 여기에 표시됩니다.
            </p>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 필터 및 액션 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={!currentUnreadCount ? "default" : "outline"}
            size="sm"
            onClick={() => router.push("/notifications")}
          >
            전체 ({totalCount})
          </Button>
          <Button
            variant={currentUnreadCount ? "default" : "outline"}
            size="sm"
            onClick={() => router.push("/notifications?unreadOnly=true")}
          >
            미읽음 ({currentUnreadCount})
          </Button>
        </div>

        {currentUnreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            disabled={isMarkingAll}
          >
            모두 읽음
          </Button>
        )}
      </div>

      {/* 알림 목록 (카드) */}
      <div className="grid gap-4">
        {notifications.map((notification) => {
          const typeName =
            NOTIFICATION_TYPES[
              notification.type as keyof typeof NOTIFICATION_TYPES
            ] || notification.type;

          return (
            <Card
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={cn(
                "cursor-pointer transition-colors hover:bg-accent",
                !notification.isRead && "bg-blue-50 border-blue-200"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
                  <CardTitle
                    className={cn(
                      "text-base",
                      !notification.isRead
                        ? "font-semibold"
                        : "font-normal text-muted-foreground"
                    )}
                  >
                    {notification.title}
                  </CardTitle>
                  <Badge variant="secondary" className="w-fit text-xs">
                    {typeName}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-sm mb-3",
                    !notification.isRead
                      ? "text-muted-foreground"
                      : "text-muted-foreground/70"
                  )}
                >
                  {notification.message}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground/60">
                    {formatDistanceToNow(notification.createdAt, {
                      addSuffix: true,
                      locale: ko,
                    })}
                  </span>
                  {notification.actionUrl && (
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      바로가기
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
