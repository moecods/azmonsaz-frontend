"use client";

import type { ReactNode } from "react";
import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import { takeExamPageSx } from "./take-exam-styles";

interface TakeExamGateProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  actions?: ReactNode;
}

/** Centered card for pre-exam states (register, wait, error). */
export function TakeExamGate({ title, icon, children, actions }: TakeExamGateProps) {
  return (
    <Card sx={{ ...takeExamPageSx.card, maxWidth: 520, mx: "auto", mt: { xs: 0.5, md: 6 } }}>
      <CardContent sx={{ p: { xs: 2, sm: 4 } }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          {icon && (
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
                color: "primary.main",
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="h5" fontWeight={700} component="h1">
            {title}
          </Typography>
          <Box sx={{ width: "100%", textAlign: "start" }}>{children}</Box>
          {actions && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ width: "100%", pt: 1 }}>
              {actions}
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}
