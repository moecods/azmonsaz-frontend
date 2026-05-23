"use client";

import type { ReactNode } from "react";
import { Box, Stack, Typography, Button } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children: ReactNode;
}

export default function DashboardSection({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: DashboardSectionProps) {
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 1.5 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {actionLabel && onAction && (
          <Button size="small" endIcon={<ChevronLeftIcon />} onClick={onAction} sx={{ flexShrink: 0 }}>
            {actionLabel}
          </Button>
        )}
      </Stack>
      {children}
    </Box>
  );
}
