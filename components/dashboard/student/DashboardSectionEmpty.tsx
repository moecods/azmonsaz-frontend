"use client";

import { Box, Typography } from "@mui/material";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

interface DashboardSectionEmptyProps {
  message: string;
}

export default function DashboardSectionEmpty({ message }: DashboardSectionEmptyProps) {
  return (
    <Box
      sx={{
        py: 2.5,
        px: 2,
        textAlign: "center",
        borderRadius: 2,
        border: "1px dashed",
        borderColor: "divider",
        bgcolor: "action.hover",
      }}
    >
      <InboxOutlinedIcon sx={{ fontSize: 32, color: "text.disabled", mb: 0.75 }} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
