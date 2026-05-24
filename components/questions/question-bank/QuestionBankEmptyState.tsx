"use client";

import { Box, Button, Stack, Typography, alpha, useTheme } from "@mui/material";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import type { ReactNode } from "react";

interface QuestionBankEmptyStateProps {
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}

export function QuestionBankEmptyState({
  title = "سوالی یافت نشد",
  description = "فیلترها را تغییر دهید یا عبارت جستجو را ویرایش کنید.",
  action,
  icon,
}: QuestionBankEmptyStateProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: 6,
        px: 2,
        textAlign: "center",
        borderRadius: 3,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: alpha(theme.palette.primary.main, 0.03),
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          mx: "auto",
          mb: 2,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
        }}
      >
        {icon ?? <QuizOutlinedIcon sx={{ fontSize: 32 }} />}
      </Box>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: "auto", mb: action ? 2 : 0 }}>
        {description}
      </Typography>
      {action && (
        <Button variant="outlined" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Box>
  );
}
