"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Mail, Bell } from "lucide-react";

interface NotificationSettingRowProps {
  type: string;
  label: string;
  description: string;
  badge: {
    text: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  };
  emailEnabled: boolean;
  webEnabled: boolean;
  emailGlobalEnabled: boolean;
  webGlobalEnabled: boolean;
  onToggleEmail: () => void;
  onToggleWeb: () => void;
}

export function NotificationSettingRow({
  type,
  label,
  description,
  badge,
  emailEnabled,
  webEnabled,
  emailGlobalEnabled,
  webGlobalEnabled,
  onToggleEmail,
  onToggleWeb,
}: NotificationSettingRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b last:border-0 gap-3">
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Label htmlFor={`${type}-email`} className="cursor-pointer">
            {label}
          </Label>
          <Badge variant={badge.variant}>{badge.text}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex items-center gap-6 sm:ml-4">
        {/* 이메일 토글 */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            이메일
          </span>
          <Switch
            id={`${type}-email`}
            checked={emailEnabled}
            onCheckedChange={onToggleEmail}
            disabled={!emailGlobalEnabled}
            aria-label={`${label} 이메일 알림 ${emailEnabled ? "활성화됨" : "비활성화됨"}`}
          />
        </div>

        {/* 웹 토글 */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Bell className="h-3 w-3" />
            웹
          </span>
          <Switch
            id={`${type}-web`}
            checked={webEnabled}
            onCheckedChange={onToggleWeb}
            disabled={!webGlobalEnabled}
            aria-label={`${label} 웹 알림 ${webEnabled ? "활성화됨" : "비활성화됨"}`}
          />
        </div>
      </div>
    </div>
  );
}
