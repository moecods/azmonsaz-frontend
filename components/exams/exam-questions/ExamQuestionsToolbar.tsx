"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import MenuIcon from "@mui/icons-material/Menu";

interface ExamQuestionsToolbarProps {
  title: string;
  questionCount: number;
  totalPoints: number;
  maxScore?: number | null;
  onBack: () => void;
  onOpenBank?: () => void;
  showMobileBankToggle?: boolean;
}

export function ExamQuestionsToolbar({
  title,
  questionCount,
  totalPoints,
  maxScore,
  onBack,
  onOpenBank,
  showMobileBankToggle,
}: ExamQuestionsToolbarProps) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
        <Button startIcon={<ArrowRightIcon />} onClick={onBack} variant="outlined" size="small">
          بازگشت
        </Button>
        {showMobileBankToggle && onOpenBank && (
          <Button startIcon={<MenuIcon />} onClick={onOpenBank} variant="contained" size="small">
            بانک سوالات
          </Button>
        )}
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
