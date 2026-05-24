"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

interface TakeExamSubmitDialogProps {
  open: boolean;
  answeredCount: number;
  totalQuestions: number;
  unansweredCount: number;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TakeExamSubmitDialog({
  open,
  answeredCount,
  totalQuestions,
  unansweredCount,
  isSubmitting,
  onClose,
  onConfirm,
}: TakeExamSubmitDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 800 }}>ارسال نهایی آزمون</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Typography>
            پس از ارسال، امکان ویرایش پاسخ‌ها وجود ندارد. آیا مطمئن هستید؟
          </Typography>
          <Typography variant="body2" color="text.secondary">
            پاسخ‌داده: {answeredCount.toLocaleString("fa-IR")} از{" "}
            {totalQuestions.toLocaleString("fa-IR")} سوال
          </Typography>
          {unansweredCount > 0 && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              {unansweredCount.toLocaleString("fa-IR")} سوال بدون پاسخ باقی مانده است.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          بازگشت به آزمون
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          disabled={isSubmitting}
          sx={{ fontWeight: 700 }}
        >
          {isSubmitting ? "در حال ارسال..." : "بله، ارسال شود"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
