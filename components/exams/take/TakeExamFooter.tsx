"use client";

import { Box, Button, Stack } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { takeExamPageSx } from "./take-exam-styles";

interface TakeExamFooterProps {
  currentIndex: number;
  totalQuestions: number;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function TakeExamFooter({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onSubmit,
  isSubmitting,
}: TakeExamFooterProps) {
  const isFirst = currentIndex === 0;
  const isLast = currentIndex >= totalQuestions - 1;

  return (
    <Box
      sx={{
        ...takeExamPageSx.stickyHeader,
        position: "sticky",
        bottom: 0,
        top: "auto",
        mt: { xs: 1, sm: 2 },
        p: { xs: 1, sm: 2 },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
        <Button
          variant="outlined"
          size="large"
          startIcon={<ArrowForwardRoundedIcon />}
          onClick={onPrevious}
          disabled={isFirst}
          sx={{ borderRadius: 2, minWidth: { sm: 120 }, px: { xs: 1.5, sm: 2 } }}
        >
          قبلی
        </Button>

        {isLast ? (
          <Button
            variant="contained"
            color="success"
            size="medium"
            endIcon={<SendRoundedIcon />}
            onClick={onSubmit}
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              px: 3,
              boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
            }}
          >
            ارسال نهایی
          </Button>
        ) : (
          <Button
            variant="contained"
            size="medium"
            endIcon={<ArrowBackRoundedIcon />}
            onClick={onNext}
            sx={{ borderRadius: 2, fontWeight: 700, minWidth: { sm: 120 }, px: { xs: 1.5, sm: 2 } }}
          >
            بعدی
          </Button>
        )}
      </Stack>
    </Box>
  );
}
