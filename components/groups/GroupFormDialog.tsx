"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { GroupAvatarUpload } from "@/components/groups/GroupAvatarUpload";

interface GroupFormDialogProps {
  open: boolean;
  mode: "create" | "edit";
  name: string;
  description: string;
  avatarUrl?: string | null;
  groupId?: number | null;
  pendingAvatarFile?: File | null;
  onPendingAvatarChange?: (file: File | null) => void;
  isPending: boolean;
  onClose: () => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSubmit: () => void;
}

export function GroupFormDialog({
  open,
  mode,
  name,
  description,
  avatarUrl,
  groupId,
  pendingAvatarFile,
  onPendingAvatarChange,
  isPending,
  onClose,
  onNameChange,
  onDescriptionChange,
  onSubmit,
}: GroupFormDialogProps) {
  const theme = useTheme();
  const isCreate = mode === "create";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="body">
      <DialogContent sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,
            py: 2.5,
            background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 1)} 70%)`,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            {isCreate ? "گروه جدید" : "ویرایش گروه"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {isCreate
              ? "پس از ایجاد، به صفحه اختصاصی گروه منتقل می‌شوید تا اعضا و تنظیمات را تکمیل کنید."
              : "نام، توضیح و تصویر گروه را به‌روزرسانی کنید."}
          </Typography>
        </Box>

        <Stack spacing={3} sx={{ px: 3, py: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 3,
              alignItems: { xs: "center", sm: "flex-start" },
            }}
          >
            <GroupAvatarUpload
              groupId={isCreate ? null : groupId}
              name={name || "گروه جدید"}
              avatarUrl={avatarUrl}
              pendingFile={pendingAvatarFile}
              onPendingFileChange={onPendingAvatarChange}
              size={112}
              disabled={isPending}
            />
            <Stack spacing={2} sx={{ flex: 1, width: "100%" }}>
              <TextField
                label="نام گروه"
                value={name}
                onChange={(e) => onNameChange(e.target.value)}
                fullWidth
                required
                autoFocus
                placeholder="مثلاً کلاس یازدهم — ریاضی"
              />
              <TextField
                label="توضیحات"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                multiline
                minRows={3}
                fullWidth
                placeholder="هدف گروه، پایه تحصیلی، نیمسال و…"
              />
            </Stack>
          </Box>

          {isCreate && (
            <Alert severity="info" icon={<ArrowForwardIcon fontSize="inherit" />}>
              بعد از ایجاد می‌توانید اعضا را اضافه کنید، فایل Excel import کنید و معلمین دارای
              دسترسی را تنظیم کنید.
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <Divider />
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={isPending}>
          انصراف
        </Button>
        <Button
          variant="contained"
          onClick={onSubmit}
          disabled={isPending || !name.trim()}
          startIcon={
            isPending ? (
              <CircularProgress size={18} color="inherit" />
            ) : isCreate ? (
              <AddIcon />
            ) : undefined
          }
        >
          {isPending ? "در حال ذخیره…" : isCreate ? "ایجاد و ادامه" : "ذخیره تغییرات"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
