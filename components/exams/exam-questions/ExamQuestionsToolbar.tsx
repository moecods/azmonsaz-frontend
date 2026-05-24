"use client";

import type { ReactNode } from "react";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

interface ExamQuestionsToolbarProps {
  title: string;
  questionCount: number;
  totalPoints: number;
  maxScore?: number | null;
  onBack: () => void;
  viewModeToggle?: ReactNode;
}

export function ExamQuestionsToolbar({
  title,
  questionCount,
  totalPoints,
  maxScore,
  onBack,
  viewModeToggle,
}: ExamQuestionsToolbarProps) {
  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2 }}
      >
        <Button startIcon={<ArrowRightIcon />} onClick={onBack} variant="outlined" size="small" sx={{ alignSelf: "flex-start" }}>
          بازگشت
        </Button>
        {viewModeToggle}
      </Stack>
      <Typography variant="h4" gutterBottom>
        مدیریت سوالات: {title}
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={`${questionCount} سوال`} size="small" color="primary" variant="outlined" />
        <Chip
          label={
            maxScore != null
              ? `بارم: ${totalPoints} / ${maxScore}`
              : `${totalPoints} نمره کل`
          }
          size="small"
          variant="outlined"
          color={maxScore != null && totalPoints > maxScore ? 'error' : 'default'}
        />
      </Stack>
    </Box>
  );
}
