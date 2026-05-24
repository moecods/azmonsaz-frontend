"use client";

import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { takeExamPageSx } from "./take-exam-styles";
import { TakeExamTimer } from "./TakeExamTimer";

interface TakeExamHeaderProps {
  examTitle: string;
  currentIndex: number;
  totalQuestions: number;
  answeredCount: number;
  timerVisible: boolean;
  timerSeconds: number | null;
  timerLabel?: string;
  timerHint?: string | null;
}

export function TakeExamHeader({
  examTitle,
  currentIndex,
  totalQuestions,
  answeredCount,
  timerVisible,
  timerSeconds,
  timerLabel,
  timerHint,
}: TakeExamHeaderProps) {
  const progress = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  return (
    <Box sx={{ ...takeExamPageSx.stickyHeader, mb: { xs: 1, sm: 2 }, p: { xs: 1.25, sm: 2.5 } }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ letterSpacing: 0.6, fontWeight: 600 }}
            >
              در حال برگزاری آزمون
            </Typography>
            <Typography variant="h6" fontWeight={700} noWrap title={examTitle}>
              {examTitle}
            </Typography>
          </Box>

          <TakeExamTimer
            visible={timerVisible}
            seconds={timerSeconds}
            label={timerLabel}
            hint={timerHint}
            compact
          />
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.75 }}>
            <Typography variant="body2" fontWeight={600}>
              سوال {currentIndex + 1} از {totalQuestions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {answeredCount.toLocaleString("fa-IR")} پاسخ داده‌شده
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": { borderRadius: 4 },
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}
