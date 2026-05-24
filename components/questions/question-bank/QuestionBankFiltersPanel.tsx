"use client";

import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import type { ReactNode } from "react";

interface QuestionBankFiltersPanelProps {
  children: ReactNode;
  loadedCount?: number;
  totalCount?: number;
  isRefetching?: boolean;
  title?: string;
}

export function QuestionBankFiltersPanel({
  children,
  loadedCount,
  totalCount,
  isRefetching = false,
  title = "فیلترها",
}: QuestionBankFiltersPanelProps) {
  const theme = useTheme();
  const hasProgress = totalCount != null && totalCount > 0;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: alpha(theme.palette.background.paper, 0.9),
      }}
    >
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <TuneIcon fontSize="small" color="primary" />
        <Typography variant="subtitle2" fontWeight={700}>
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ pt: 2, "&:last-child": { pb: 2 } }}>
        <Stack spacing={2}>{children}</Stack>
        {hasProgress && (
          <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
              <Typography variant="caption" color="text.secondary">
                بارگذاری شده
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {(loadedCount ?? 0).toLocaleString("fa-IR")} / {totalCount.toLocaleString("fa-IR")}
              </Typography>
            </Stack>
            {isRefetching && (
              <Typography variant="caption" color="primary.main" sx={{ mt: 0.5, display: "block" }}>
                در حال به‌روزرسانی…
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
