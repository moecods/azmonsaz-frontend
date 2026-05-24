"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import { RichLabel } from "@/components/editor";
import { takeExamPageSx } from "./take-exam-styles";
import { TakeExamTimer } from "./TakeExamTimer";
import type { ExamTakeTimingPreview } from "@/lib/exam-take-timing";

interface TakeExamLobbyProps {
  title: string;
  questionsCount?: number;
  durationMinutes?: number | null;
  instructions?: string | null;
  timeMessage?: string | null;
  timingPreview?: ExamTakeTimingPreview | null;
  isStarting: boolean;
  canStart: boolean;
  errorMessage?: string | null;
  onStart: () => void;
}

export function TakeExamLobby({
  title,
  questionsCount,
  durationMinutes,
  instructions,
  timeMessage,
  timingPreview,
  isStarting,
  canStart,
  errorMessage,
  onStart,
}: TakeExamLobbyProps) {
  return (
    <Card sx={{ ...takeExamPageSx.card, maxWidth: 640, mx: "auto", mt: { xs: 0.5, md: 4 } }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Chip label="آماده شروع" size="small" color="primary" variant="outlined" sx={{ mb: 1.5 }} />
            <Typography variant="h4" fontWeight={800} component="h1" gutterBottom>
              {title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
              قبل از شروع، دستورالعمل را بخوانید. پس از شروع، زمان آزمون محاسبه می‌شود و پاسخ‌ها
              به‌صورت خودکار ذخیره می‌شوند.
            </Typography>
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {questionsCount != null && questionsCount > 0 && (
              <Chip
                icon={<QuizOutlinedIcon />}
                label={`${questionsCount.toLocaleString("fa-IR")} سوال`}
                variant="outlined"
              />
            )}
            {durationMinutes != null && durationMinutes > 0 && (
              <Chip
                icon={<ScheduleOutlinedIcon />}
                label={`${durationMinutes.toLocaleString("fa-IR")} دقیقه`}
                variant="outlined"
              />
            )}
          </Stack>

          {timingPreview?.visible && (
            <TakeExamTimer
              mode="preview"
              visible
              label={timingPreview.label}
              hint={timingPreview.hint}
            />
          )}

          {timeMessage && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {timeMessage}
            </Alert>
          )}

          {instructions?.trim() && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  دستورالعمل آزمون
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    maxHeight: 220,
                    overflow: "auto",
                  }}
                >
                  <RichLabel html={instructions} fontSize="0.95rem" />
                </Box>
              </Box>
            </>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<PlayArrowRoundedIcon />}
            onClick={onStart}
            disabled={isStarting || !canStart}
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: "1.05rem",
              boxShadow: "0 4px 14px rgba(37, 99, 235, 0.35)",
            }}
          >
            {isStarting ? "در حال آماده‌سازی..." : "شروع آزمون"}
          </Button>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            با شروع آزمون، شرایط برگزاری را می‌پذیرید و امکان بازگشت به این صفحه وجود ندارد.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
