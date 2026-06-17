"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";
import MobileBottomNav from "./MobileBottomNav";
import StartedExamsAlert from "@/components/StartedExamsAlert";
import ImpersonationBanner from "@/components/admin/ImpersonationBanner";
import { MainProgressProvider } from "@/components/layout/MainProgressProvider";
import { PageContentFade } from "@/components/layout/PageContentFade";
import {
  MOBILE_BOTTOM_NAV_HEIGHT,
  SHELL_CONTENT_PADDING,
} from "@/components/layout/layout-constants";
import { isTakeExamRoute } from "@/lib/take-exam-path";
import { takeExamMainSx } from "@/components/exams/take/take-exam-styles";

interface UserLayoutProps {
  children: ReactNode;
}

/**
 * Mobile shell: expandable bottom dock (quick tabs + full menu sheet).
 * No top header — avoids duplicate chrome with sidebar items.
 */
export default function UserLayout({ children }: UserLayoutProps) {
  const pathname = usePathname();
  const isTakeExam = isTakeExamRoute(pathname);
  const showMobileChrome = !isTakeExam;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        component="main"
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          flex: 1,
          minHeight: 0,
          overflowX: "hidden",
          overflowY: "auto",
          WebkitOverflowScrolling: "touch",
          boxSizing: "border-box",
          pb: showMobileChrome
            ? `calc(${MOBILE_BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom, 0px))`
            : 0,
          display: "flex",
          flexDirection: "column",
          ...(isTakeExam ? takeExamMainSx : {}),
        }}
      >
        <MainProgressProvider>
          <Box
            sx={{
              width: "100%",
              maxWidth: "100%",
              boxSizing: "border-box",
              minHeight: isTakeExam ? "100%" : undefined,
              flex: 1,
              ...(isTakeExam ? { px: 0, py: 0 } : SHELL_CONTENT_PADDING),
            }}
          >
            <ImpersonationBanner />
            {showMobileChrome && <StartedExamsAlert />}
            <PageContentFade contentKey={pathname ?? ""}>{children}</PageContentFade>
          </Box>
        </MainProgressProvider>
      </Box>

      {showMobileChrome && <MobileBottomNav />}
    </Box>
  );
}
