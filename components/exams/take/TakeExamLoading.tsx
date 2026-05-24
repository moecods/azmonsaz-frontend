"use client";

import { Box, CircularProgress, Stack, Typography } from "@mui/material";

interface TakeExamLoadingProps {
  message?: string;
}

export function TakeExamLoading({ message = "لطفاً چند لحظه صبر کنید..." }: TakeExamLoadingProps) {
  return (
    <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ py: 10 }}>
      <CircularProgress size={44} thickness={4} />
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Stack>
  );
}
