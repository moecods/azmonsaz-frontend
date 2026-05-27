"use client";

import type { ReactNode } from "react";
import { Box, Typography, alpha, useTheme } from "@mui/material";

interface ExamManageStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: "primary" | "success" | "error" | "warning" | "neutral";
}

const toneMap = {
  primary: "primary",
  success: "success",
  error: "error",
  warning: "warning",
  neutral: "text",
} as const;

export function ExamManageStatCard({
  icon,
  label,
  value,
  tone = "primary",
}: ExamManageStatCardProps) {
  const theme = useTheme();
  const paletteKey = toneMap[tone];
  const mainColor =
    paletteKey === "text"
      ? theme.palette.text.primary
      : theme.palette[paletteKey].main;

  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: 2.5,
        textAlign: "center",
        border: 1,
        borderColor: alpha(mainColor, 0.2),
        bgcolor: alpha(mainColor, 0.06),
        minWidth: 0,
      }}
    >
      <Box sx={{ color: mainColor, mb: 0.75, display: "flex", justifyContent: "center" }}>
        {icon}
      </Box>
      <Typography variant="h5" fontWeight={800} color={mainColor} lineHeight={1.2}>
        {typeof value === "number" ? value.toLocaleString("fa-IR") : value}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  );
}
