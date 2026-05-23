"use client";

import { useState, ReactNode } from "react";
import { Box } from "@mui/material";
import UserSidebar from "./UserSidebar";
import MobileBottomNav from "./MobileBottomNav";
import StartedExamsAlert from "@/components/StartedExamsAlert";
import { NavigationProvider } from "@/components/layout/NavigationProvider";
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
  SHELL_CONTENT_PADDING,
} from "@/components/layout/layout-constants";

interface UserLayoutProps {
  children: ReactNode;
}

/** Mobile authenticated layout: scrollable main + bottom nav + drawer. */
export default function UserLayout({ children }: UserLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
      }}
    >
      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          height: "100%",
          overflowX: "hidden",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          boxSizing: "border-box",
          pb: `${MOBILE_BOTTOM_NAV_HEIGHT}px`,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            ...SHELL_CONTENT_PADDING,
          }}
        >
          <StartedExamsAlert />
          <NavigationProvider>{children}</NavigationProvider>
        </Box>
      </Box>

      <UserSidebar open={mobileOpen} onClose={handleDrawerToggle} variant="temporary" />
      <MobileBottomNav onMenuClick={handleDrawerToggle} />
    </Box>
  );
}
