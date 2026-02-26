"use client";

import { AppBar, Toolbar, Typography, Button, Box, useTheme, useMediaQuery } from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks";
import { useState, useEffect, useMemo } from "react";
import LoginIcon from "@mui/icons-material/Login";
import SchoolIcon from "@mui/icons-material/School";
import UserMenu from "./layout/UserMenu";
import NotificationBell from "./notifications/NotificationBell";

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

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const [mounted, setMounted] = useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });

  useEffect(() => {
    setMounted(true);
  }, []);

  /**
   * Check if current page is a UserLayout page
   * Uses useMemo for performance optimization
   */
  const isUserLayoutPage = useMemo(() => {
    if (!pathname) return false;
    return USER_LAYOUT_PAGES.some(page => 
      pathname === page || pathname.startsWith(page + '/')
    );
  }, [pathname]);

  /**
   * Determine if navbar should be hidden
   * Hidden on login page or on mobile for authenticated users on UserLayout pages
   */
  const shouldHideNavbar = useMemo(() => {
    if (pathname === '/login') return true;
    if (mounted && isMobile && isAuthenticated && isUserLayoutPage) return true;
    return false;
  }, [pathname, mounted, isMobile, isAuthenticated, isUserLayoutPage]);

  if (shouldHideNavbar) {
    return null;
  }

  return (
    <AppBar 
      position="fixed" 
      color="transparent" 
      elevation={0}
      sx={{ 
        borderBottom: 1, 
        borderColor: "divider",
        bgcolor: 'background.paper',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        <Box
          sx={{ 
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
          }}
          onClick={() => router.push('/')}
        >
          <SchoolIcon sx={{ color: 'primary.main' }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: 'text.primary',
            }}
        >
          آزمون‌ساز
        </Typography>
        </Box>
        
        <Box sx={{ flexGrow: 1 }} />
        
        <Box display="flex" alignItems="center" gap={2}>
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <UserMenu />
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<LoginIcon />}
              onClick={() => router.push('/login')}
            >
              ورود
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}

