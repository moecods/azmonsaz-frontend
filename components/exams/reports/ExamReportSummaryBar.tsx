"use client";

import { Box, Chip, Skeleton, Stack, Typography } from "@mui/material";
import type { ExamReportSummary } from "@/services/exams/ExamReportService";

interface ExamReportSummaryBarProps {
  summary: ExamReportSummary | undefined;
  isLoading?: boolean;
}

export function ExamReportSummaryBar({ summary, isLoading }: ExamReportSummaryBarProps) {
  if (isLoading) {
    return (
      <Stack direction="row" spacing={1} flexWrap="wrap">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rounded" width={100} height={32} />
        ))}
      </Stack>
    );
  }
  if (!summary) return null;

  return (
    <Box>
      {summary.is_live && (
        <Typography variant="body2" color="success.main" fontWeight={700} sx={{ mb: 1 }}>
          الان {summary.in_progress_count.toLocaleString("fa-IR")} نفر در حال انجام آزمون
        </Typography>
      )}
      <Stack direction="row" flexWrap="wrap" gap={0.75} useFlexGap>
        <Chip size="small" label={`کل: ${summary.total_participants.toLocaleString("fa-IR")}`} />
        <Chip
          size="small"
          color="warning"
          variant="outlined"
          label={`در حال انجام: ${summary.in_progress_count.toLocaleString("fa-IR")}`}
        />
        <Chip
          size="small"
          color="success"
          variant="outlined"
          label={`پایان: ${summary.completed_count.toLocaleString("fa-IR")}`}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`غیبت: ${summary.absent_count.toLocaleString("fa-IR")}`}
        />
        {summary.average_score != null && (
          <Chip
            size="small"
            variant="outlined"
            label={`میانگین: ${summary.average_score.toLocaleString("fa-IR")}`}
          />
        )}
        {summary.passed_count > 0 && (
          <Chip
            size="small"
            color="success"
            label={`قبول: ${summary.passed_count.toLocaleString("fa-IR")}`}
          />
        )}
      </Stack>
    </Box>
  );
}
