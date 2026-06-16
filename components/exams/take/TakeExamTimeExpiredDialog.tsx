"use client";

import {
  Dialog,
  DialogContent,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import TimerOffOutlinedIcon from "@mui/icons-material/TimerOffOutlined";

interface TakeExamTimeExpiredDialogProps {
  open: boolean;
  isCompleting?: boolean;
}

export function TakeExamTimeExpiredDialog({
  open,
  isCompleting = true,
}: TakeExamTimeExpiredDialogProps) {
  return (
    <Dialog open={open} aria-labelledby="exam-time-expired-title" maxWidth="xs" fullWidth>
      <DialogContent sx={{ py: 3 }}>
        <Stack spacing={2} alignItems="center" textAlign="center">
          <TimerOffOutlinedIcon sx={{ fontSize: 48, color: "warning.main" }} />
          <Typography id="exam-time-expired-title" variant="h6" fontWeight={700}>
            زمان آزمون به پایان رسید
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isCompleting
              ? "پاسخ‌های شما در حال ثبت است. لطفاً این صفحه را نبندید."
              : "آزمون ثبت شد."}
          </Typography>
          {isCompleting && <CircularProgress size={28} />}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
