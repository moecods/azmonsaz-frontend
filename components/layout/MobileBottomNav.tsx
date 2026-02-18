"use client";

import { useState, MouseEvent } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useTheme,
  useMediaQuery,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Typography,
  Divider,
  Stack,
  Chip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '@/hooks';

interface MobileBottomNavProps {
  onMenuClick: () => void;
}

export default function MobileBottomNav({ onMenuClick }: MobileBottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (!isMobile) {
    return null;
  }

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const handleAvatarClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    router.push('/');
  };

  const handleMenuNavigation = (path: string) => {
    handleMenuClose();
    router.push(path);
  };

  // Determine active tab based on pathname
  const getActiveTab = () => {
    if (pathname === '/dashboard') return 0;
    if (pathname === '/exams/available') return 1;
    if (pathname?.startsWith('/exams') && pathname !== '/exams/available') {
      if (user?.roles?.includes('admin') || user?.roles?.includes('content_manager') || user?.roles?.includes('creator')) {
        return 2;
      }
    }
    if (pathname === '/questions') return 3;
    // Profile tab is now UserMenu, so we don't track it as active tab
    return -1;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدیر';
      case 'content_manager':
        return 'مدیر محتوا';
      case 'creator':
        return 'سازنده';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'content_manager':
        return 'primary';
      case 'creator':
        return 'success';
      default:
        return 'default';
    }
  };

  const isCreator = user?.roles?.includes('admin') || 
                   user?.roles?.includes('content_manager') || 
                   user?.roles?.includes('creator');

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderTop: 1,
        borderColor: 'divider',
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getActiveTab()}
        sx={{
          bgcolor: 'background.paper',
          '& .MuiBottomNavigationAction-root': {
            minWidth: 0,
            maxWidth: 'none',
            padding: '6px 12px',
          },
        }}
      >
        <BottomNavigationAction
          label="منو"
          icon={<MenuIcon />}
          onClick={onMenuClick}
        />
        <BottomNavigationAction
          label="داشبورد"
          icon={<DashboardIcon />}
          onClick={() => handleNavigation('/dashboard')}
        />
        <BottomNavigationAction
          label="آزمون‌ها"
          icon={<SchoolIcon />}
          onClick={() => handleNavigation('/exams/available')}
        />
        {isCreator && (
          <BottomNavigationAction
            label="سوالات"
            icon={<QuizIcon />}
            onClick={() => handleNavigation('/questions')}
          />
        )}
        <BottomNavigationAction
          label="پروفایل"
          icon={
            <Avatar
              onClick={handleAvatarClick}
              sx={{
                width: 24,
                height: 24,
                bgcolor: 'primary.main',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              {user ? getInitials(user.name) : ''}
            </Avatar>
          }
          onClick={handleAvatarClick}
        />
      </BottomNavigation>
      
      {/* User Menu Dropdown */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        transformOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: -1,
            mb: 8,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        {/* User Info */}
        {user && (
          <>
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold" noWrap>
                {user.name}
              </Typography>
              {user.email && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
              )}
              {user.roles && user.roles.length > 0 && (
                <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                  {user.roles.map((role) => (
                    <Chip
                      key={role}
                      label={getRoleLabel(role)}
                      size="small"
                      color={getRoleColor(role)}
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
            <Divider />
            <MenuItem onClick={() => handleMenuNavigation('/dashboard')}>
              <DashboardIcon sx={{ mr: 2, fontSize: 20 }} />
              داشبورد
            </MenuItem>
            <MenuItem onClick={() => handleMenuNavigation('/profile')}>
              <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
              پروفایل
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }} data-cy="logout-button">
              <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
              خروج
            </MenuItem>
          </>
        )}
      </Menu>
    </Paper>
  );
}

