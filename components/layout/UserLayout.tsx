"use client";

import { useState, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import UserSidebar from "./UserSidebar";
import MobileBottomNav from "./MobileBottomNav";
import StartedExamsAlert from "@/components/StartedExamsAlert";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { NavigationProvider } from "@/components/layout/NavigationProvider";
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
  SHELL_CONTENT_PADDING,
} from "@/components/layout/layout-constants";
import { isTakeExamRoute } from "@/lib/take-exam-path";
import { takeExamMainSx } from "@/components/exams/take/take-exam-styles";

interface UserLayoutProps {
  children: ReactNode;
}

/** Mobile authenticated layout: scrollable main + bottom nav + drawer. */
export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const isTakeExam = isTakeExamRoute(pathname);
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
          ...(isTakeExam ? takeExamMainSx : {}),
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            minHeight: isTakeExam ? "100%" : undefined,
            ...(isTakeExam ? { px: 0, py: 0 } : SHELL_CONTENT_PADDING),
          }}
        >
          <ImpersonationBanner />
          {!isTakeExam && <StartedExamsAlert />}
          <NavigationProvider>{children}</NavigationProvider>
        </Box>
      </Box>

      <UserSidebar open={mobileOpen} onClose={handleDrawerToggle} variant="temporary" />
      <MobileBottomNav onMenuClick={handleDrawerToggle} />
    </Box>
  );
}
