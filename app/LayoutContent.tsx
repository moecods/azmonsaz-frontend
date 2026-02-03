"use client";

import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import Navbar from '@/components/Navbar';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  // Pages that use UserLayout (should hide navbar on mobile, they have bottom nav)
  const userLayoutPages = [
    '/dashboard',
    '/profile',
    '/exams',
    '/exams/available',
    '/questions',
    '/admin',
  ];

  const isUserLayoutPage = userLayoutPages.some(page => 
    pathname === page || pathname?.startsWith(page + '/')
  );

  // On mobile, hide navbar only for pages that use UserLayout (they have bottom nav)
  // Always show navbar for landing page and other public pages
  const shouldShowNavbar = !(isMobile && isAuthenticated && isUserLayoutPage);
  const paddingTop = shouldShowNavbar ? '64px' : 0;

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Box component="main" sx={{ pt: paddingTop }}>{children}</Box>
    </>
  );
}

