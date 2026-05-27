"use client";

import { Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

interface ParticipantBulkTabProps {
  mode: "phone" | "national_id";
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isPending: boolean;
}

const CONFIG = {
  phone: {
    hint: "هر شماره موبایل را در یک خط جداگانه بنویسید.",
    placeholder: "09123456789\n09187654321",
    label: "شماره‌های موبایل",
  },
  national_id: {
    hint: "هر کد ملی را در یک خط جداگانه بنویسید.",
    placeholder: "1234567890\n0987654321",
    label: "کدهای ملی",
  },
} as const;

export function ParticipantBulkTab({
  mode,
  value,
  onChange,
  onSubmit,
  isPending,
}: ParticipantBulkTabProps) {
  const cfg = CONFIG[mode];
  const lineCount = value.split("\n").filter((l) => l.trim()).length;

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {cfg.hint}
      </Typography>
      <TextField
        label={cfg.label}
        multiline
        minRows={6}
        maxRows={12}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={cfg.placeholder}
        fullWidth
        helperText={
          lineCount > 0 ? `${lineCount.toLocaleString("fa-IR")} مورد وارد شده` : undefined
        }
      />
      <Button
        variant="contained"
        onClick={onSubmit}
        disabled={isPending || !value.trim()}
        startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
      >
        {isPending ? "در حال افزودن..." : "افزودن به آزمون"}
      </Button>
    </Stack>
  );
}
