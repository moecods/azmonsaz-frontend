"use client";

import { Box, Typography } from "@mui/material";

export default function AuthFormHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <Box sx={{ mb: 2.5, textAlign: { xs: "center", md: "start" } }}>
      <Typography variant="h5" fontWeight={800} gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
