"use client";

import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useIsAuthenticated } from "@/hooks";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Navbar from '@/components/Navbar';
import { isAuthenticatedShellPath } from '@/lib/authenticated-layout';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [paddingTop, setPaddingTop] = useState('0'); // Default to showing navbar padding
  const [shouldShowNavbar, setShouldShowNavbar] = useState(false); // Default to showing navbar
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
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
      return { show: true, padding: '64px' };
    }

    const isUserLayoutMobile = isMobile && isAuthenticated && isUserLayoutPage;

    const show = !isLandingPage && !isUserLayoutMobile && !isNoNavbarPage;

    return {
      show,
      padding: show ? '64px' : '0',
    };
  }, [mounted, isMobile, isAuthenticated, isUserLayoutPage, isLandingPage, isNoNavbarPage]);

  // Update state when config changes
  useEffect(() => {
    setShouldShowNavbar(navbarConfig.show);
    setPaddingTop(navbarConfig.padding);
  }, [navbarConfig]);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Box
        component="main"
        sx={{ pt: paddingTop }}
        suppressHydrationWarning
      >
        {children}
      </Box>
    </>
  );
}

