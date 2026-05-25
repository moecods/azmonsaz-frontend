"use client";

import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useIsAuthenticated } from "@/hooks";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Navbar from '@/components/Navbar';
import { isAuthenticatedShellPath } from '@/lib/authenticated-layout';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [shouldShowNavbar, setShouldShowNavbar] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === '/';


  /**
   * Check if current page is a public page (login, register, etc.)
   */
  const isPublicPage = useMemo(() => {
    if (!pathname) return false;
    const publicPages = ['/login', '/register', '/reset-password'];
    return publicPages.some(page => pathname === page || pathname.startsWith(page + '/'));
  }, [pathname]);
  
  // Only check authentication if not on a public page to prevent unnecessary /me calls
  // useIsAuthenticated only checks token, doesn't call API
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const isAuthenticated = isPublicPage ? false : useIsAuthenticated();

  const isNoNavbarPage = useMemo(() => {
    if (!pathname) return false;
    const publicPages =['/login', '/register', '/'];
    return publicPages.some(page => pathname === page || pathname.startsWith(page + '/'));
  }, [pathname]);

  /**
   * Check if current page uses UserLayout
   * Uses useMemo for performance optimization
   */
  const isUserLayoutPage = useMemo(
    () => isAuthenticatedShellPath(pathname),
    [pathname]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Calculate navbar visibility and padding
   * Uses useMemo for performance and to prevent unnecessary re-renders
   */
  const navbarConfig = useMemo(() => {
    if (!mounted) {
      return { show: true };
    }

    // Authenticated shell uses sidebar + ShellChrome (no global Navbar).
    const shellOwnsNavbar = isAuthenticated && isUserLayoutPage;

    const show = !isLandingPage && !isNoNavbarPage && !shellOwnsNavbar;

    return { show };
  }, [mounted, isAuthenticated, isUserLayoutPage, isLandingPage, isNoNavbarPage]);

  useEffect(() => {
    setShouldShowNavbar(navbarConfig.show);
  }, [navbarConfig]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
      }}
    >
      {shouldShowNavbar && <Navbar />}
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          minWidth: 0,
          width: '100%',
          maxWidth: '100vw',
          overflow: 'hidden',
        }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </Box>
  );
}

