"use client";

import { ReactNode } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { DesktopSidebar } from "@/components/layout/UserSidebar";
import UserLayout from "@/components/layout/UserLayout";
import StartedExamsAlert from "@/components/StartedExamsAlert";
import { NavigationProvider } from "@/components/layout/NavigationProvider";
import { SIDEBAR_WIDTH } from "@/components/layout/layout-constants";

/**
 * Authenticated app shell.
 * Desktop: CSS grid — navbar row, then sidebar (right in RTL) + scrollable main.
 * Mobile: UserLayout with bottom nav and temporary drawer.
 */
export default function AuthenticatedShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <ProtectedRoute>
      {isMobile ? (
        <UserLayout>{children}</UserLayout>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateRows: "auto 1fr",
            gridTemplateColumns: `${SIDEBAR_WIDTH}px 1fr`,
            height: "100vh",
            width: "100%",
            overflow: "hidden",
            bgcolor: "background.default",
          }}
        >
          <Box sx={{ gridColumn: "1 / -1", gridRow: 1, minWidth: 0 }}>
            <Navbar variant="shell" />
          </Box>

          <Box
            component="aside"
            sx={{
              gridRow: 2,
              gridColumn: 1,
              minHeight: 0,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <DesktopSidebar />
          </Box>

          <Box
            component="main"
            sx={{
              gridRow: 2,
              gridColumn: 2,
              minWidth: 0,
              minHeight: 0,
              overflowX: "hidden",
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Box sx={{ p: 3, boxSizing: "border-box", width: "100%", maxWidth: "100%" }}>
              <StartedExamsAlert />
              <NavigationProvider>{children}</NavigationProvider>
            </Box>
          </Box>
        </Box>
      )}
    </ProtectedRoute>
  );
}
