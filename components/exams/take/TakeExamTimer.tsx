"use client";

import { Box, Stack, Typography } from "@mui/material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TimerOffOutlinedIcon from "@mui/icons-material/TimerOffOutlined";
import { formatTakeExamDuration } from "@/lib/exam-take-timing";
import { takeExamColors } from "./take-exam-styles";

const URGENT_THRESHOLD_SEC = 300;

interface TakeExamTimerProps {
  /** Active countdown during the exam. */
  mode?: "countdown" | "preview";
  visible: boolean;
  seconds?: number | null;
  label?: string;
  hint?: string | null;
  compact?: boolean;
}

/**
 * Displays remaining answer time based on exam schedule strategy (from API timing).
 */
export function TakeExamTimer({
  mode = "countdown",
  visible,
  seconds = null,
  label = "زمان باقی‌مانده",
  hint,
  compact = false,
}: TakeExamTimerProps) {
  if (!visible) {
    return null;
  }

  if (mode === "preview") {
    return (
      <Box
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          borderRadius: 2,
          bgcolor: takeExamColors.accentSoft,
          border: "1px solid",
          borderColor: takeExamColors.border,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <AccessTimeRoundedIcon fontSize="small" color="primary" sx={{ mt: 0.25 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {label}
            </Typography>
            {hint && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                {hint}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
    );
  }

  if (seconds === null) {
    return null;
  }

  const isUrgent = seconds < URGENT_THRESHOLD_SEC;
  const isExpired = seconds <= 0;

  return (
    <Box
      aria-live="polite"
      aria-atomic="true"
      role="timer"
      sx={{
        display: "flex",
        flexDirection: compact ? "row" : "column",
        alignItems: compact ? "center" : "flex-end",
        gap: compact ? 1 : 0.5,
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          px: compact ? 1.5 : 2,
          py: compact ? 0.75 : 1,
          borderRadius: 999,
          bgcolor: isExpired
            ? "error.light"
            : isUrgent
              ? "warning.light"
              : takeExamColors.accentSoft,
          color: isExpired
            ? "error.dark"
            : isUrgent
              ? "warning.dark"
              : "primary.dark",
          fontWeight: 700,
        }}
      >
        {isExpired ? (
          <TimerOffOutlinedIcon fontSize="small" />
        ) : (
          <AccessTimeRoundedIcon fontSize="small" />
        )}
        <Typography variant={compact ? "body2" : "body1"} fontWeight={700} component="span">
          {isExpired ? "پایان وقت" : formatTakeExamDuration(seconds)}
        </Typography>
      </Box>
      {!compact && hint && (
        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="end"
          sx={{ maxWidth: 220, lineHeight: 1.5 }}
        >
          {hint}
        </Typography>
      )}
    </Box>
  );
}
