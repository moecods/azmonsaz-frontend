"use client";

import {
  Alert,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ParticipantSelector from "@/components/exams/ParticipantSelector";
import type { ParticipantOption } from "@/components/exams/ParticipantSelector";
import { ManageSectionHeader } from "@/components/exams/participants/participant-ui-shared";

const MAX_MESSAGE = 500;

interface ExamNotificationComposerProps {
  message: string;
  onMessageChange: (v: string) => void;
  recipientSelection: number[] | "all";
  onRecipientChange: (v: number[] | "all") => void;
  participants: ParticipantOption[];
  isPublished: boolean;
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onSend: () => void;
  onResetError: () => void;
}

export function ExamNotificationComposer({
  message,
  onMessageChange,
  recipientSelection,
  onRecipientChange,
  participants,
  isPublished,
  isPending,
  isError,
  errorMessage,
  onSend,
  onResetError,
}: ExamNotificationComposerProps) {
  const canSend =
    isPublished && message.trim().length > 0 && participants.length > 0 && !isPending;

  return (
    <Stack spacing={1.5}>
      <ManageSectionHeader
        title="ارسال اعلان"
        description={
          participants.length > 0
            ? `${participants.length.toLocaleString("fa-IR")} شرکت‌کننده قابل انتخاب`
            : "ابتدا شرکت‌کننده اضافه کنید"
        }
      />

      {!isPublished && (
        <Alert severity="info" sx={{ py: 0.5 }}>
          فقط برای آزمون‌های منتشرشده می‌توانید اعلان بفرستید.
        </Alert>
      )}

      <TextField
        label="متن پیام"
        size="small"
        multiline
        minRows={3}
        maxRows={6}
        value={message}
        onChange={(e) => onMessageChange(e.target.value.slice(0, MAX_MESSAGE))}
        placeholder="متن اعلان را بنویسید..."
        fullWidth
        helperText={`${message.length.toLocaleString("fa-IR")} / ${MAX_MESSAGE.toLocaleString("fa-IR")}`}
      />

      <Stack spacing={0.75}>
        <Typography variant="body2" fontWeight={600} color="text.secondary">
          گیرندگان
        </Typography>
        <ParticipantSelector
          participants={participants}
          selectedIds={recipientSelection}
          onSelectionChange={onRecipientChange}
          disabled={isPending || !isPublished}
        />
      </Stack>

      {isError && (
        <Alert severity="error" onClose={onResetError} sx={{ py: 0.5 }}>
          {errorMessage || "خطا در ارسال اعلان"}
        </Alert>
      )}

      <Button
        variant="contained"
        startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
        onClick={onSend}
        disabled={!canSend}
        sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
      >
        {isPending ? "در حال ارسال..." : "ارسال اعلان"}
      </Button>
    </Stack>
  );
}
