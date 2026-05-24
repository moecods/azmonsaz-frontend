"use client";

import type { ReactNode } from "react";
import { Box, Container } from "@mui/material";
import ProtectedRoute from "@/components/ProtectedRoute";
import { takeExamPageSx } from "./take-exam-styles";

interface TakeExamShellProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg";
}

export function TakeExamShell({ children, maxWidth = "lg" }: TakeExamShellProps) {
  return (
    <ProtectedRoute>
      <Box sx={takeExamPageSx.root}>
        <Container
          maxWidth={maxWidth}
          disableGutters
          sx={{ ...takeExamPageSx.container, mx: "auto", width: "100%" }}
        >
          {children}
        </Container>
      </Box>
    </ProtectedRoute>
  );
}
