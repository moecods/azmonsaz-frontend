"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ParticipantSelector from "@/components/exams/ParticipantSelector";
import type { ParticipantOption } from "@/components/exams/ParticipantSelector";
import { SectionCard } from "@/components/exams/participants/participant-ui-shared";

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
  const theme = useTheme();
  const canSend =
    isPublished && message.trim().length > 0 && participants.length > 0 && !isPending;

  return (
    <SectionCard title="ارسال اعلان جدید" icon={<SendIcon color="primary" fontSize="small" />}>
      <Stack spacing={2.5}>
        {!isPublished && (
          <Alert severity="info">
            فقط برای آزمون‌های منتشرشده می‌توانید اعلان بفرستید. ابتدا آزمون را منتشر کنید.
          </Alert>
        )}

        <TextField
          label="متن پیام"
          multiline
          minRows={4}
          maxRows={8}
          value={message}
          onChange={(e) => onMessageChange(e.target.value.slice(0, MAX_MESSAGE))}
          placeholder="متن اعلان را برای شرکت‌کنندگان بنویسید..."
          fullWidth
          helperText={`${message.length.toLocaleString("fa-IR")} / ${MAX_MESSAGE.toLocaleString("fa-IR")}`}
        />

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.03),
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
            گیرندگان
          </Typography>
          <ParticipantSelector
            participants={participants}
            selectedIds={recipientSelection}
            onSelectionChange={onRecipientChange}
            disabled={isPending || !isPublished}
          />
        </Box>

        {isError && (
          <Alert severity="error" onClose={onResetError}>
            {errorMessage || "خطا در ارسال اعلان"}
          </Alert>
        )}

        <Button
          variant="contained"
          size="large"
          startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : <SendIcon />}
          onClick={onSend}
          disabled={!canSend}
          sx={{ alignSelf: { xs: "stretch", sm: "flex-start" }, minWidth: 160 }}
        >
          {isPending ? "در حال ارسال..." : "ارسال اعلان"}
        </Button>
      </Stack>
    </SectionCard>
  );
}
