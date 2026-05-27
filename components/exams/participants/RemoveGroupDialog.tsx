"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

interface RemoveGroupDialogProps {
  open: boolean;
  groupName?: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function RemoveGroupDialog({
  open,
  groupName,
  isPending,
  onClose,
  onConfirm,
}: RemoveGroupDialogProps) {
  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>حذف گروه از آزمون</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {groupName ? (
            <>
              گروه «{groupName}» از این آزمون جدا شود؟
            </>
          ) : (
            "این گروه از آزمون حذف شود؟"
          )}
          <br />
          <br />
          اعضایی که فقط از این گروه به آزمون اضافه شده‌اند، از لیست شرکت‌کنندگان هم حذف می‌شوند.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 2.5, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          انصراف
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isPending}>
          {isPending ? "در حال حذف..." : "حذف گروه"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
