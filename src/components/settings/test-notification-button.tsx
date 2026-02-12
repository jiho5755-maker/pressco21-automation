"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { sendTestNotification } from "@/actions/notification-preference-actions";
import { NOTIFICATION_TYPE_INFO } from "@/lib/notification-defaults";

const notificationTypes = Object.keys(NOTIFICATION_TYPE_INFO) as Array<
  keyof typeof NOTIFICATION_TYPE_INFO
>;

export function TestNotificationButton() {
  const [open, setOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>(notificationTypes[0]);

  const { execute, isPending } = useAction(sendTestNotification, {
    onSuccess: () => {
      toast.success("테스트 알림 발송 완료", {
        description: "웹 알림을 확인해주세요.",
      });
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "발송 실패");
    },
  });

  const handleSend = () => {
    execute({ type: selectedType as never });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">테스트 알림 발송</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>테스트 알림 발송</DialogTitle>
          <DialogDescription>
            선택한 알림 유형의 테스트 메시지를 발송합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="notification-type">알림 유형</Label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger id="notification-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {notificationTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {NOTIFICATION_TYPE_INFO[type].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSend} disabled={isPending} className="w-full">
            {isPending ? "발송 중..." : "발송"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
