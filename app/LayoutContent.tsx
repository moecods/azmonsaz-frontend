"use client";

import { Box, useTheme, useMediaQuery } from "@mui/material";
import { useAuth } from "@/hooks";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Navbar from '@/components/Navbar';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const [paddingTop, setPaddingTop] = useState('64px'); // Default to showing navbar padding
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
  const { isAuthenticated } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Update padding only after mount to prevent hydration mismatch
  useEffect(() => {
    if (mounted) {
      const shouldShowNavbar = !(isMobile && isAuthenticated && isUserLayoutPage);
      setPaddingTop(shouldShowNavbar ? '64px' : '0');
    }
  }, [mounted, isMobile, isAuthenticated, isUserLayoutPage]);

  // On mobile, hide navbar only for pages that use UserLayout (they have bottom nav)
  // Always show navbar for landing page and other public pages
  // Only check isMobile after component is mounted to avoid hydration mismatch
  const shouldShowNavbar = !(mounted && isMobile && isAuthenticated && isUserLayoutPage);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <Box component="main" sx={{ pt: paddingTop }}>{children}</Box>
    </>
  );
}

