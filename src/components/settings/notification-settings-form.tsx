"use client";

import { useState, useEffect } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { NotificationGroupCard } from "./notification-group-card";
import { NotificationSettingRow } from "./notification-setting-row";
import { TestNotificationButton } from "./test-notification-button";
import { updateNotificationPreference } from "@/actions/notification-preference-actions";
import {
  NOTIFICATION_GROUPS,
  NOTIFICATION_TYPE_INFO,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from "@/lib/notification-defaults";
import type { NotificationPreference, NotificationTypePreference } from "@prisma/client";

interface Props {
  initialPreference:
    | (NotificationPreference & {
        typePreferences: NotificationTypePreference[];
      })
    | null;
}

export function NotificationSettingsForm({ initialPreference }: Props) {
  // 전체 채널 설정
  const [emailEnabled, setEmailEnabled] = useState(
    initialPreference?.emailEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.emailEnabled
  );
  const [webEnabled, setWebEnabled] = useState(
    initialPreference?.webEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.webEnabled
  );

  // 유형별 설정
  const [typePreferences, setTypePreferences] = useState<
    Array<{
      type: string;
      emailEnabled: boolean;
      webEnabled: boolean;
    }>
  >(
    initialPreference?.typePreferences.map((pref) => ({
      type: pref.type,
      emailEnabled: pref.emailEnabled,
      webEnabled: pref.webEnabled,
    })) ??
      DEFAULT_NOTIFICATION_PREFERENCES.typePreferences.map((pref) => ({
        type: pref.type,
        emailEnabled: pref.emailEnabled,
        webEnabled: pref.webEnabled,
      }))
  );

  // 변경사항 추적
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // 초기값과 비교하여 변경사항 감지
    const initialEmail = initialPreference?.emailEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.emailEnabled;
    const initialWeb = initialPreference?.webEnabled ?? DEFAULT_NOTIFICATION_PREFERENCES.webEnabled;

    const emailChanged = emailEnabled !== initialEmail;
    const webChanged = webEnabled !== initialWeb;

    const typesChanged = typePreferences.some((pref, index) => {
      const initial = initialPreference?.typePreferences[index] ?? DEFAULT_NOTIFICATION_PREFERENCES.typePreferences[index];
      return pref.emailEnabled !== initial?.emailEnabled || pref.webEnabled !== initial?.webEnabled;
    });

    setHasChanges(emailChanged || webChanged || typesChanged);
  }, [emailEnabled, webEnabled, typePreferences, initialPreference]);

  const { execute, isPending } = useAction(updateNotificationPreference, {
    onSuccess: () => {
      toast.success("알림 설정이 저장되었습니다.");
      setHasChanges(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "저장에 실패했습니다.");
    },
  });

  const handleSubmit = () => {
    execute({
      emailEnabled,
      webEnabled,
      typePreferences: typePreferences.map((pref) => ({
        type: pref.type as never,
        emailEnabled: pref.emailEnabled,
        webEnabled: pref.webEnabled,
      })),
    });
  };

  const handleToggleType = (type: string, channel: "emailEnabled" | "webEnabled") => {
    setTypePreferences((prev) =>
      prev.map((pref) =>
        pref.type === type ? { ...pref, [channel]: !pref[channel] } : pref
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* 사용자 가이드 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>알림 수신 안내</AlertTitle>
        <AlertDescription>
          이메일 알림은 회사 이메일로 발송되며, 웹 알림은 브라우저에서 확인할 수 있습니다.
        </AlertDescription>
      </Alert>

      {/* 전체 채널 토글 */}
      <Card>
        <CardHeader>
          <CardTitle>알림 채널 설정</CardTitle>
          <CardDescription>
            이메일 및 웹 알림 전체 수신 여부를 설정하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled">이메일 알림</Label>
              <p className="text-sm text-muted-foreground">
                모든 알림 유형의 이메일 수신 전체 설정
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={emailEnabled}
              onCheckedChange={setEmailEnabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="web-enabled">웹 알림</Label>
              <p className="text-sm text-muted-foreground">
                모든 알림 유형의 웹 알림 수신 전체 설정
              </p>
            </div>
            <Switch
              id="web-enabled"
              checked={webEnabled}
              onCheckedChange={setWebEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* 유형별 설정 그룹 */}
      {NOTIFICATION_GROUPS.map((group) => (
        <NotificationGroupCard
          key={group.id}
          title={group.title}
          description={group.description}
        >
          {group.types.map((type) => {
            const pref = typePreferences.find((p) => p.type === type);
            const info = NOTIFICATION_TYPE_INFO[type as keyof typeof NOTIFICATION_TYPE_INFO];

            if (!pref || !info) return null;

            return (
              <NotificationSettingRow
                key={type}
                type={type}
                label={info.label}
                description={info.description}
                badge={info.badge}
                emailEnabled={pref.emailEnabled}
                webEnabled={pref.webEnabled}
                emailGlobalEnabled={emailEnabled}
                webGlobalEnabled={webEnabled}
                onToggleEmail={() => handleToggleType(type, "emailEnabled")}
                onToggleWeb={() => handleToggleType(type, "webEnabled")}
              />
            );
          })}
        </NotificationGroupCard>
      ))}

      {/* 저장 및 테스트 */}
      <div className="flex gap-3 justify-end">
        <TestNotificationButton />
        <Button onClick={handleSubmit} disabled={isPending || !hasChanges}>
          {isPending ? "저장 중..." : hasChanges ? "변경사항 저장 ●" : "변경사항 저장"}
        </Button>
      </div>
    </div>
  );
}
