"use client";

import { Box, Stack } from "@mui/material";
import type { ReactNode } from "react";

interface QuestionBankLayoutProps {
  header: ReactNode;
  filters: ReactNode;
  toolbar?: ReactNode;
  children: ReactNode;
  /** Extra bottom padding when a fixed cart bar is shown */
  bottomReservePx?: number;
}

export function QuestionBankLayout({
  header,
  filters,
  toolbar,
  children,
  bottomReservePx = 0,
}: QuestionBankLayoutProps) {
  return (
    <Stack
      spacing={3}
      sx={{
        pb: bottomReservePx > 0 ? `${bottomReservePx}px` : 0,
      }}
    >
      {header}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "280px 1fr" },
          gap: { xs: 2, lg: 3 },
          alignItems: "start",
        }}
      >
        <Box
          sx={{
            position: { lg: "sticky" },
            top: { lg: 88 },
            zIndex: 1,
          }}
        >
          {filters}
        </Box>

        <Stack spacing={2} sx={{ minWidth: 0 }}>
          {toolbar}
          {children}
        </Stack>
      </Box>
    </Stack>
  );
}
