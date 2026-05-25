"use client";

import { Box, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationBell from "@/components/notifications/NotificationBell";
import UserMenu from "@/components/layout/UserMenu";

export interface ShellChromeProps {
  /** Show hamburger that opens the navigation drawer (mobile). */
  showMenuButton?: boolean;
  onMenuClick?: () => void;
}

/**
 * Shared shell actions: notifications + account (+ optional menu).
 * Navigation links live in the sidebar only.
 */
export default function ShellChrome({ showMenuButton, onMenuClick }: ShellChromeProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, flexShrink: 0 }}>
      {showMenuButton && onMenuClick && (
        <IconButton
          aria-label="باز کردن منو"
          onClick={onMenuClick}
          edge="start"
          data-cy="nav-mobile-menu"
          sx={{ color: "text.primary", mr: 0.25 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <NotificationBell />
      <UserMenu variant="shell" />
    </Box>
  );
}
