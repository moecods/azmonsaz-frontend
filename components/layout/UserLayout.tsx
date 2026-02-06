"use client";

import { useState, ReactNode } from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import UserSidebar from './UserSidebar';
import MobileBottomNav from './MobileBottomNav';
import ProtectedRoute from '@/components/ProtectedRoute';

interface UserLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'content_manager' | 'creator';
}

const DRAWER_WIDTH = 280;
const BOTTOM_NAV_HEIGHT = 64; // Height of bottom navigation
const TOOLBAR_HEIGHT = 0; // Navbar height

export default function UserLayout({ children, requiredRole }: UserLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <ProtectedRoute requiredRole={requiredRole}>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <UserSidebar
        open={mobileOpen}
        onClose={handleDrawerToggle}
        variant={isMobile ? 'temporary' : 'permanent'}
      />

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          pt: { md: `${TOOLBAR_HEIGHT}px` }, // Padding top for navbar on desktop
          pb: { xs: `${BOTTOM_NAV_HEIGHT}px`, md: 0 }, // Padding bottom for mobile bottom nav
        }}
      >
        <Box sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onMenuClick={handleDrawerToggle} />
    </Box>
    </ProtectedRoute>
  );
}

