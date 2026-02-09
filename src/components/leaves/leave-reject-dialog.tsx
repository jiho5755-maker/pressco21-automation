// 휴가 반려 Dialog
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { rejectLeaveRequest } from "@/actions/leave-actions";

const rejectFormSchema = z.object({
  rejectedReason: z
    .string()
    .min(5, "반려 사유는 최소 5자 이상 입력해야 합니다.")
    .max(500, "반려 사유는 최대 500자까지 입력 가능합니다."),
});

type RejectFormValues = z.infer<typeof rejectFormSchema>;

interface LeaveRejectDialogProps {
  leaveId: string;
  onClose: () => void;
}

export function LeaveRejectDialog({
  leaveId,
  onClose,
}: LeaveRejectDialogProps) {
  const [open, setOpen] = useState(true);

  const form = useForm<RejectFormValues>({
    resolver: zodResolver(rejectFormSchema),
    defaultValues: {
      rejectedReason: "",
    },
  });

  const { execute, isPending } = useAction(rejectLeaveRequest, {
    onSuccess: () => {
      toast.success("휴가 신청이 반려되었습니다.");
      setOpen(false);
      onClose();
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "반려 실패");
    },
  });

  const handleSubmit = (values: RejectFormValues) => {
    execute({
      id: leaveId,
      rejectedReason: values.rejectedReason,
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isPending) {
      setOpen(newOpen);
      if (!newOpen) {
        onClose();
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>휴가 반려</DialogTitle>
          <DialogDescription>
            휴가 신청을 반려하는 사유를 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rejectedReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    반려 사유 <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="예: 해당 기간 인력 부족으로 승인이 어렵습니다."
                      rows={4}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                반려 사유는 직원에게 전달됩니다. 명확하고 구체적으로 작성해주세요.
              </AlertDescription>
            </Alert>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                취소
              </Button>
              <Button type="submit" variant="destructive" disabled={isPending}>
                반려
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
