"use client";

import { Alert, AlertTitle, Box, Paper } from "@mui/material";

interface FormValidationAlertsProps {
  messages: string[] | null;
  onClose?: () => void;
  /** Sticky bar above submit buttons */
  variant?: "top" | "sticky";
}

export function FormValidationAlerts({
  messages,
  onClose,
  variant = "top",
}: FormValidationAlertsProps) {
  if (!messages?.length) return null;

  const content = (
    <Alert severity="warning" onClose={onClose} sx={{ width: "100%" }}>
      <AlertTitle>لطفاً خطاهای زیر را برطرف کنید</AlertTitle>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        {messages.map((msg, i) => (
          <li key={i}>{msg}</li>
        ))}
      </Box>
    </Alert>
  );

  if (variant === "sticky") {
    return (
      <Paper
        elevation={8}
        sx={{
          position: "sticky",
          bottom: 72,
          zIndex: 10,
          p: 1,
          borderRadius: 2,
          border: 1,
          borderColor: "warning.main",
        }}
      >
        {content}
      </Paper>
    );
  }

  return content;
}
