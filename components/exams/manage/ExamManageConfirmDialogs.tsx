"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

export type ExamManageConfirmAction =
  | "publish"
  | "unpublish"
  | "activate"
  | "deactivate"
  | "releaseResults"
  | null;

const COPY: Record<
  Exclude<ExamManageConfirmAction, null>,
  { title: string; body: string; confirm: string; color?: "error" | "primary" }
> = {
  publish: {
    title: "انتشار آزمون",
    body: "پس از انتشار، شرکت‌کنندگان می‌توانند (با توجه به زمان‌بندی) در آزمون شرکت کنند. ادامه می‌دهید؟",
    confirm: "انتشار",
  },
  unpublish: {
    title: "لغو انتشار",
    body: "آزمون به حالت پیش‌نویس برمی‌گردد و دسترسی شرکت برای ورود جدید محدود می‌شود.",
    confirm: "لغو انتشار",
    color: "error",
  },
  activate: {
    title: "فعال‌سازی آزمون",
    body: "آزمون منتشرشده در بازه زمانی برای شرکت‌کنندگان فعال می‌شود (در کنار وضعیت انتشار).",
    confirm: "فعال کردن",
  },
  deactivate: {
    title: "غیرفعال کردن آزمون",
    body: "شرکت‌کنندگان تا زمان فعال‌سازی مجدد نمی‌توانند آزمون را شروع کنند.",
    confirm: "غیرفعال کردن",
    color: "error",
  },
  releaseResults: {
    title: "انتشار نتایج",
    body: "نمره و کارنامه برای شرکت‌کنندگان واجد شرایط نمایش داده می‌شود.",
    confirm: "انتشار نتایج",
  },
};

interface ExamManageConfirmDialogsProps {
  action: ExamManageConfirmAction;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ExamManageConfirmDialogs({
  action,
  isPending = false,
  onClose,
  onConfirm,
}: ExamManageConfirmDialogsProps) {
  if (!action) return null;
  const copy = COPY[action];

  return (
    <Dialog open onClose={isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{copy.title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{copy.body}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          انصراف
        </Button>
        <Button
          variant="contained"
          color={copy.color ?? "primary"}
          onClick={onConfirm}
          disabled={isPending}
        >
          {isPending ? "در حال انجام..." : copy.confirm}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
