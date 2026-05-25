"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ShellChrome from "@/components/layout/ShellChrome";
import { MOBILE_SHELL_HEADER_HEIGHT } from "@/components/layout/layout-constants";

const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME_FA || "آزمون‌ساز";

interface MobileShellHeaderProps {
  onMenuClick: () => void;
}

/** Sticky top bar on mobile shell: menu → sidebar drawer + notifications + account. */
export default function MobileShellHeader({ onMenuClick }: MobileShellHeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  if (!isMobile) {
    return null;
  }

  return (
    <AppBar
      position="sticky"
      elevation={0}
      color="transparent"
      sx={{
        top: 0,
        zIndex: (t) => t.zIndex.drawer,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: alpha(theme.palette.background.paper, 0.94),
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        minHeight: MOBILE_SHELL_HEADER_HEIGHT,
      }}
    >
      <Toolbar
        variant="dense"
        disableGutters
        sx={{
          minHeight: MOBILE_SHELL_HEADER_HEIGHT,
          px: 1,
          gap: 0.5,
        }}
      >
        <ShellChrome showMenuButton onMenuClick={onMenuClick} />

        <Typography
          variant="subtitle2"
          fontWeight={800}
          noWrap
          sx={{ flex: 1, minWidth: 0, px: 0.5 }}
        >
          {APP_NAME}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
