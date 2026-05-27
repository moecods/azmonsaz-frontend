"use client";

import { Alert, Button, IconButton, Stack, TextField, Typography, alpha, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface ParticipantLinksTabProps {
  registrationLink?: string | null;
  examLink?: string | null;
  onCopyRegistration: () => void;
  onCopyExam: () => void;
}

function LinkBlock({
  title,
  description,
  href,
  onCopy,
  emptyMessage,
}: {
  title: string;
  description: string;
  href?: string | null;
  onCopy: () => void;
  emptyMessage: string;
}) {
  const theme = useTheme();

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.primary.main, 0.03),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <LinkIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
        {description}
      </Typography>
      {href ? (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            value={href}
            size="small"
            fullWidth
            InputProps={{ readOnly: true }}
          />
          <Stack direction="row" spacing={0.5}>
            <IconButton onClick={onCopy} aria-label="کپی لینک" color="primary">
              <ContentCopyIcon />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              component="a"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<OpenInNewIcon />}
            >
              باز کردن
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Alert severity="info" sx={{ py: 0.5 }}>
          {emptyMessage}
        </Alert>
      )}
    </Stack>
  );
}

export function ParticipantLinksTab({
  registrationLink,
  examLink,
  onCopyRegistration,
  onCopyExam,
}: ParticipantLinksTabProps) {
  return (
    <Stack spacing={2}>
      <LinkBlock
        title="لینک ثبت‌نام"
        description="برای دعوت افراد جدید — با این لینک در آزمون ثبت‌نام می‌کنند."
        href={registrationLink}
        onCopy={onCopyRegistration}
        emptyMessage="پس از انتشار آزمون، لینک ثبت‌نام در اینجا نمایش داده می‌شود."
      />
      <LinkBlock
        title="لینک شرکت در آزمون"
        description="فقط برای کسانی که قبلاً ثبت‌نام کرده‌اند — ورود مستقیم به آزمون."
        href={examLink}
        onCopy={onCopyExam}
        emptyMessage="از تب «اطلاعات» دکمه «تولید لینک آزمون» را بزنید."
      />
    </Stack>
  );
}
