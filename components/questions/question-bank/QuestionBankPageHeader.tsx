"use client";

import { Box, Stack, Typography, alpha, useTheme } from "@mui/material";
import type { ReactNode } from "react";

interface QuestionBankPageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  stats?: ReactNode;
}

export function QuestionBankPageHeader({
  title,
  subtitle,
  icon,
  actions,
  stats,
}: QuestionBankPageHeaderProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.background.paper, 1)} 55%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "center" }}
        justifyContent="space-between"
        sx={{ px: { xs: 2, md: 3 }, py: { xs: 2, md: 2.5 } }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h5" fontWeight={800} gutterBottom={!!subtitle}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" noWrap={false}>
                {subtitle}
              </Typography>
            )}
            {stats && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                {stats}
              </Stack>
            )}
          </Box>
        </Stack>
        {actions && (
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            alignItems="center"
            justifyContent={{ xs: "flex-start", md: "flex-end" }}
          >
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
