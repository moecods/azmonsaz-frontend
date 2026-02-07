"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress, Alert, Container, Typography, Button, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '@/hooks';
import { hasPermission, type Permission, PERMISSION_TO_ROLE } from '@/lib/permissions';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import UserSidebar from '@/components/layout/UserSidebar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: Permission;
  requiredRole?: 'admin' | 'content_manager' | 'creator'; // Deprecated: use requiredPermission instead
}

export default function ProtectedRoute({ children, requiredPermission, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Determine required permission (use requiredPermission if provided, otherwise map from role)
  const permission: Permission | null = (() => {
    if (requiredPermission) {
      return requiredPermission;
    }
    if (requiredRole) {
      // Map role to a representative permission
      const roleToPermissionMap: Record<string, Permission> = {
        admin: 'manage users', // Admin has all permissions, use manage users as representative
        creator: 'view exams', // Creator can view exams
        content_manager: 'manage questions', // Content manager can manage questions
      };
      return roleToPermissionMap[requiredRole] || null;
    }
    return null;
  })();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  useEffect(() => {
    if (!mounted) return;
    
    // Only redirect if we're sure user is not authenticated (not just loading)
    // Add a delay to prevent race conditions with login redirect
    if (!isLoading && !isAuthenticated) {
      const timer = setTimeout(() => {
        // Double check authentication state before redirecting
        // Use replace to avoid adding to history stack
        if (!isAuthenticated) {
          router.replace('/login');
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading, router, mounted]);

  // Show loading during initial mount to prevent hydration mismatch
  if (!mounted || isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Show 403 error if user doesn't have required permission
  const hasAccess = permission 
    ? hasPermission(user?.permissions, permission)
    : true; // If no permission required, allow access

  if (permission && !hasAccess) {
    // Get permission display name
    const permissionNames: Record<Permission, string> = {
      'manage users': 'مدیریت کاربران',
      'assign roles': 'تعیین نقش',
      'deactivate users': 'غیرفعال کردن کاربران',
      'view exams': 'مشاهده آزمون‌ها',
      'create exams': 'ایجاد آزمون',
      'edit exams': 'ویرایش آزمون',
      'delete exams': 'حذف آزمون',
      'manage questions': 'مدیریت سوالات',
      'manage participants': 'مدیریت شرکت‌کنندگان',
      'grade exams': 'نمره‌دهی آزمون',
      'view exam reports': 'مشاهده گزارشات',
      'manage partners': 'مدیریت شرکا',
    };
    
    const permissionName = permissionNames[permission] || permission;
    
    // Use same layout structure as UserLayout
    const DRAWER_WIDTH = 280;
    const BOTTOM_NAV_HEIGHT = 64;
    const TOOLBAR_HEIGHT = 0;
    
    return (
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
            pt: { md: `${TOOLBAR_HEIGHT}px` },
            pb: { xs: `${BOTTOM_NAV_HEIGHT}px`, md: 0 },
          }}
        >
          <Box sx={{ p: { xs: 2, md: 3 } }}>
            <Container maxWidth="md" sx={{ py: 8 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  gap: 3,
                }}
              >
                <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
                <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                  دسترسی محدود شده است
                </Typography>
                <Alert severity="error" sx={{ width: '100%', maxWidth: 600 }}>
                  <Typography variant="body1" gutterBottom>
                    شما دسترسی به این صفحه را ندارید.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    این صفحه نیاز به دسترسی <strong>"{permissionName}"</strong> دارد.
                  </Typography>
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => router.push('/dashboard')}
                  sx={{ mt: 2 }}
                >
                  بازگشت به داشبورد
                </Button>
              </Box>
            </Container>
          </Box>
        </Box>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onMenuClick={handleDrawerToggle} />
      </Box>
    );
  }

  return <>{children}</>;
}

