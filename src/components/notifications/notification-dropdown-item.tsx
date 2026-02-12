"use client";

import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useAction } from "next-safe-action/hooks";
import type { Notification } from "@prisma/client";
import { markNotificationAsRead } from "@/actions/notification-actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { NOTIFICATION_TYPES } from "@/lib/constants";

interface NotificationDropdownItemProps {
  notification: Notification;
  onRead?: () => void;
}

export function NotificationDropdownItem({
  notification,
  onRead,
}: NotificationDropdownItemProps) {
  const router = useRouter();

  const { execute: markAsRead } = useAction(markNotificationAsRead, {
    onSuccess: () => {
      onRead?.();
    },
  });

  const handleClick = async () => {
    // 읽음 처리
    if (!notification.isRead) {
      markAsRead({ notificationId: notification.id });
    }

    // actionUrl 이동
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const typeName =
    NOTIFICATION_TYPES[notification.type as keyof typeof NOTIFICATION_TYPES] ||
    notification.type;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-3 cursor-pointer transition-colors hover:bg-accent border-b last:border-b-0",
        !notification.isRead && "bg-blue-50 font-semibold border-blue-100"
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span
          className={cn(
            "text-sm",
            !notification.isRead ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {notification.title}
        </span>
        <Badge variant="secondary" className="text-xs shrink-0">
          {typeName}
        </Badge>
      </div>
      <p
        className={cn(
          "text-xs mb-2",
          !notification.isRead
            ? "text-muted-foreground"
            : "text-muted-foreground/70"
        )}
      >
        {notification.message}
      </p>
      <span className="text-xs text-muted-foreground/60">
        {formatDistanceToNow(notification.createdAt, {
          addSuffix: true,
          locale: ko,
        })}
      </span>
    </div>
  );
}
