"use client";

import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";

interface CreateGroupDialogProps {
  open: boolean;
  name: string;
  description: string;
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  isPending: boolean;
}

export function CreateGroupDialog({
  open,
  name,
  description,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSubmit,
  isPending,
}: CreateGroupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>ایجاد گروه جدید</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 0.5 }}>
          <TextField
            label="نام گروه"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            fullWidth
            required
            autoFocus
          />
          <TextField
            label="توضیحات (اختیاری)"
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            multiline
            minRows={2}
            fullWidth
          />
          <Alert severity="info">بعداً می‌توانید اعضا را از پنل گروه‌ها اضافه کنید.</Alert>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>انصراف</Button>
        <Button variant="contained" onClick={onSubmit} disabled={isPending || !name.trim()}>
          {isPending ? "در حال ایجاد..." : "ایجاد گروه"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
