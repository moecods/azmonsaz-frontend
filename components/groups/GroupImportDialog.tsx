"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import type { Group } from "@/services/groups/GroupService";

interface GroupImportDialogProps {
  open: boolean;
  group: Group | null;
  file: File | null;
  isPending: boolean;
  onClose: () => void;
  onFileChange: (file: File | null) => void;
  onImport: () => void;
}

export function GroupImportDialog({
  open,
  group,
  file,
  isPending,
  onClose,
  onFileChange,
  onImport,
}: GroupImportDialogProps) {
  const inputId = "group-excel-file-input";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">Import از Excel</Typography>
            <Typography variant="body2" color="text.secondary">
              {group?.name}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 0.5 }}>
          <Alert severity="info">
            <Typography variant="body2" fontWeight={700} gutterBottom>
              ستون‌های فایل
            </Typography>
            <Typography variant="body2" component="div">
              نام (الزامی)، شماره تلفن (الزامی)، کد ملی و ایمیل (اختیاری)
            </Typography>
          </Alert>

          <input
            accept=".xlsx,.xls,.csv"
            style={{ display: "none" }}
            id={inputId}
            type="file"
            onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          />
          <label htmlFor={inputId}>
            <Button variant="outlined" component="span" fullWidth startIcon={<UploadFileIcon />} sx={{ py: 1.5 }}>
              انتخاب فایل Excel
            </Button>
          </label>

          {file && (
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <DescriptionIcon color="primary" fontSize="small" />
                <Typography variant="body2" sx={{ flex: 1 }} noWrap title={file.name}>
                  {file.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {(file.size / 1024).toFixed(1)} KB
                </Typography>
                <IconButton size="small" onClick={() => onFileChange(null)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Box>
          )}

          <Alert severity="warning">
            کاربران جدید در صورت نیاز ساخته می‌شوند؛ تکراری‌ها نادیده گرفته می‌شوند.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>انصراف</Button>
        <Button
          variant="contained"
          onClick={onImport}
          disabled={isPending || !file}
          startIcon={isPending ? <CircularProgress size={20} /> : <UploadFileIcon />}
        >
          {isPending ? "در حال import…" : "شروع Import"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
