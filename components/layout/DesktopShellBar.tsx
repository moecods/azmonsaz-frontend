"use client";

import { Box, alpha, useTheme } from "@mui/material";
import ShellChrome from "@/components/layout/ShellChrome";
import { DESKTOP_SHELL_BAR_HEIGHT } from "@/components/layout/layout-constants";

/** Slim top bar on desktop main column: notifications + account (no duplicate nav links). */
export default function DesktopShellBar() {
  const theme = useTheme();

  return (
    <Box
      component="header"
      sx={{
        flexShrink: 0,
        minHeight: DESKTOP_SHELL_BAR_HEIGHT,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        px: 2,
        py: 0.5,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.background.paper, 0.96),
      }}
    >
      <ShellChrome />
    </Box>
  );
}
