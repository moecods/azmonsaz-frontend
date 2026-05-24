"use client";

import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import type { ReactNode } from "react";

interface QuestionBankToolbarProps {
  viewToggle?: ReactNode;
  hint?: string;
}

export function QuestionBankToolbar({ viewToggle, hint }: QuestionBankToolbarProps) {
  const theme = useTheme();

  if (!viewToggle && !hint) return null;

  return (
    <Box
      sx={{
        px: 2,
        py: 1.25,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "center" },
        justifyContent: "space-between",
        gap: 1.5,
      }}
    >
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {hint}
        </Typography>
      )}
      {viewToggle && (
        <Stack direction="row" justifyContent={{ xs: "flex-start", sm: "flex-end" }}>
          {viewToggle}
        </Stack>
      )}
    </Box>
  );
}
