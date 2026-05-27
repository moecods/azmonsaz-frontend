"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface RemoveParticipantDialogProps {
  open: boolean;
  participantName: string;
  isPending?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveParticipantDialog({
  open,
  participantName,
  isPending = false,
  onClose,
  onConfirm,
}: RemoveParticipantDialogProps) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>حذف شرکت‌کننده</DialogTitle>
      <DialogContent>
        <DialogContentText>
          «{participantName}» از این آزمون حذف می‌شود. این عمل قابل بازگشت نیست.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          انصراف
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} disabled={isPending}>
          {isPending ? "در حال حذف..." : "حذف"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
