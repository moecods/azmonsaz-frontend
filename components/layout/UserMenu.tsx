"use client";

import { useState, MouseEvent } from 'react';
import {
  IconButton,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  Box,
  Stack,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import ListAltIcon from '@mui/icons-material/ListAlt';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks';

export default function UserMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await logout();
    router.push('/');
  };

  const handleNavigation = (path: string) => {
    handleClose();
    router.push(path);
  };

  const isCreator = user?.roles?.includes('admin') || 
                   user?.roles?.includes('content_manager') || 
                   user?.roles?.includes('creator');

  // Menu items for mobile (similar to sidebar)
  const mobileMenuItems = [
    { label: 'داشبورد', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'آزمون‌های من', icon: <SchoolIcon />, path: '/exams/available' },
    ...(isCreator ? [
      { label: 'مدیریت آزمون‌ها', icon: <ListAltIcon />, path: '/exams' },
      { label: 'ایجاد آزمون', icon: <SchoolIcon />, path: '/exams/create' },
      { label: 'بانک سوالات', icon: <QuizIcon />, path: '/questions' },
    ] : []),
    { label: 'پروفایل', icon: <PersonIcon />, path: '/profile' },
    ...((user?.roles?.includes('admin') || user?.roles?.includes('content_manager')) ? [
      { label: 'پنل مدیریت', icon: <AdminPanelSettingsIcon />, path: '/admin' },
    ] : []),
  ];

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

  if (!user) return null;

  return (
    <>
      {isMobile ? (
      <IconButton
        onClick={handleClick}
        size="small"
        sx={{ ml: 2 }}
        aria-controls={open ? 'user-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
        data-cy="user-menu-button"
      >
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            fontSize: '0.875rem',
          }}
        >
          {getInitials(user.name)}
        </Avatar>
      </IconButton>
      ) : (
        <Button
          onClick={handleClick}
          sx={{
            ml: 2,
            textTransform: 'none',
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          aria-controls={open ? 'user-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          data-cy="user-menu-button"
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Typography variant="body2" fontWeight="medium" noWrap>
              {user.name}
            </Typography>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
              }}
            >
              {getInitials(user.name)}
            </Avatar>
          </Stack>
        </Button>
      )}
      <Menu
        anchorEl={anchorEl}
        id="user-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 200,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
            },
          },
        }}
      >
        {/* User Info */}
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
        <MenuItem onClick={() => handleNavigation('/dashboard')}>
          <DashboardIcon sx={{ mr: 2, fontSize: 20 }} />
          داشبورد
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/profile')}>
          <PersonIcon sx={{ mr: 2, fontSize: 20 }} />
          پروفایل
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }} data-cy="logout-button">
          <LogoutIcon sx={{ mr: 2, fontSize: 20 }} />
          خروج
        </MenuItem>
      </Menu>
    </>
  );
}

