"use client";

import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useIsAuthenticated } from "@/hooks";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Navbar from '@/components/Navbar';

/**
 * Pages that use UserLayout (should hide navbar on mobile, they have bottom nav)
 */
const USER_LAYOUT_PAGES = [
  '/dashboard',
  '/profile',
  '/exams',
  '/exams/available',
  '/questions',
  '/admin',
] as const;

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [paddingTop, setPaddingTop] = useState('64px'); // Default to showing navbar padding
  const [shouldShowNavbar, setShouldShowNavbar] = useState(true); // Default to showing navbar
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const pathname = usePathname();
  
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
  const isAuthenticated = isPublicPage ? false : useIsAuthenticated();

  /**
   * Check if current page uses UserLayout
   * Uses useMemo for performance optimization
   */
  const isUserLayoutPage = useMemo(() => {
    if (!pathname) return false;
    return USER_LAYOUT_PAGES.some(page => 
      pathname === page || pathname.startsWith(page + '/')
    );
  }, [pathname]);

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
    const show = !(isMobile && isAuthenticated && isUserLayoutPage);
    return {
      show,
      padding: show ? '64px' : '0',
    };
  }, [mounted, isMobile, isAuthenticated, isUserLayoutPage]);

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

