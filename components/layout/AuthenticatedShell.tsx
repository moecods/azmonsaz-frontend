"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import ProtectedRoute from "@/components/ProtectedRoute";
import { DesktopSidebar } from "@/components/layout/UserSidebar";
import DesktopShellBar from "@/components/layout/DesktopShellBar";
import UserLayout from "@/components/layout/UserLayout";
import StartedExamsAlert from "@/components/StartedExamsAlert";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { MainProgressProvider } from "@/components/layout/MainProgressProvider";
import { RealtimeProvider } from "@/providers/RealtimeProvider";
import { SIDEBAR_WIDTH } from "@/components/layout/layout-constants";
import { isTakeExamRoute } from "@/lib/take-exam-path";
import { takeExamMainSx } from "@/components/exams/take/take-exam-styles";

/**
 * Authenticated app shell.
 * Desktop: sidebar + main (shell bar for notifications/account only).
 * Mobile: expandable bottom dock (quick tabs + menu sheet).
 */
export default function AuthenticatedShell({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const pathname = usePathname();
  const isTakeExam = isTakeExamRoute(pathname);
  const isMobile = useMediaQuery(theme.breakpoints.down("md"), { noSsr: true });

  return (
    <ProtectedRoute>
      <RealtimeProvider>
        {isMobile ? (
          <UserLayout>{children}</UserLayout>
        ) : (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: `${SIDEBAR_WIDTH}px 1fr`,
              gridTemplateRows: "1fr",
              height: "100vh",
              width: "100%",
              overflow: "hidden",
              bgcolor: "background.default",
            }}
          >
            <Box
              component="aside"
              sx={{
                gridColumn: 1,
                gridRow: 1,
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
                gridColumn: 2,
                gridRow: 1,
                minWidth: 0,
                minHeight: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                ...(isTakeExam ? takeExamMainSx : {}),
              }}
            >
              {!isTakeExam && <DesktopShellBar />}
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  overflowX: "hidden",
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <MainProgressProvider>
                  <Box
                    sx={{
                      p: isTakeExam ? 0 : 3,
                      boxSizing: "border-box",
                      width: "100%",
                      maxWidth: "100%",
                      minHeight: isTakeExam ? "100%" : undefined,
                      flex: 1,
                    }}
                  >
                    <ImpersonationBanner />
                    {!isTakeExam && <StartedExamsAlert />}
                    {children}
                  </Box>
                </MainProgressProvider>
              </Box>
            </Box>
          </Box>
        )}
      </RealtimeProvider>
    </ProtectedRoute>
  );
}
