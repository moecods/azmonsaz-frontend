"use client";

import { Box, Card, Stack, Typography, alpha, useTheme } from "@mui/material";
import type { ReactNode } from "react";

interface ProfileStatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error";
}

export function ProfileStatCard({
  label,
  value,
  icon,
  hint,
  color = "primary",
}: ProfileStatCardProps) {
  const theme = useTheme();
  const main = theme.palette[color].main;

  return (
    <Card
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 2.5,
        height: "100%",
        borderColor: alpha(main, 0.25),
        bgcolor: alpha(main, 0.04),
      }}
    >
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          {icon && (
            <Box sx={{ color: main, display: "flex", alignItems: "center" }}>{icon}</Box>
          )}
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {label}
          </Typography>
        </Stack>
        <Typography variant="h4" fontWeight={800} color={`${color}.main`}>
          {typeof value === "number" ? value.toLocaleString("fa-IR") : value}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.disabled">
            {hint}
          </Typography>
        )}
      </Stack>
    </Card>
  );
}
