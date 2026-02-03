"use client";

import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Divider,
  Avatar,
  Chip,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useAuth } from '@/hooks';

const DRAWER_WIDTH = 280;

interface UserSidebarProps {
  open: boolean;
  onClose: () => void;
  variant?: 'permanent' | 'temporary';
}

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles?: string[];
}

const menuItems: MenuItem[] = [
  {
    label: 'داشبورد',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    label: 'آزمون‌های من',
    icon: <SchoolIcon />,
    path: '/exams/available',
  },
  {
    label: 'مدیریت آزمون‌ها',
    icon: <ListAltIcon />,
    path: '/exams',
    roles: ['admin', 'content_manager', 'creator'],
  },
  {
    label: 'ایجاد آزمون',
    icon: <SchoolIcon />,
    path: '/exams/create',
    roles: ['admin', 'content_manager', 'creator'],
  },
  {
    label: 'بانک سوالات',
    icon: <QuizIcon />,
    path: '/questions',
    roles: ['admin', 'content_manager', 'creator'],
  },
  {
    label: 'پروفایل',
    icon: <PersonIcon />,
    path: '/profile',
  },
  {
    label: 'پنل مدیریت',
    icon: <AdminPanelSettingsIcon />,
    path: '/admin',
    roles: ['admin', 'content_manager'],
  },
];

export default function UserSidebar({ open, onClose, variant = 'temporary' }: UserSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const filteredMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true;
    return item.roles.some((role) => user?.roles?.includes(role));
  });

  const handleNavigation = (path: string) => {
    router.push(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* User Profile Section */}
      <Box
        sx={{
          p: 3,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: 'primary.light',
              width: 56,
              height: 56,
              fontSize: '1.25rem',
              fontWeight: 'bold',
            }}
          >
            {user?.name ? getInitials(user.name) : 'U'}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold" noWrap>
              {user?.name || 'کاربر'}
            </Typography>
            {user?.email && (
              <Typography variant="caption" sx={{ opacity: 0.9 }} noWrap>
                {user.email}
              </Typography>
            )}
            {user?.roles && user.roles.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mt: 1 }} flexWrap="wrap">
                {user.roles.map((role) => (
                  <Chip
                    key={role}
                    label={getRoleLabel(role)}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      bgcolor: 'rgba(255, 255, 255, 0.2)',
                      color: 'inherit',
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Navigation Menu */}
      <List sx={{ flexGrow: 1, pt: 2 }}>
        {filteredMenuItems.map((item, index) => {
          // Find the most specific matching menu item
          // First, check for exact matches
          const exactMatch = filteredMenuItems.find(otherItem => pathname === otherItem.path);
          
          let isActive = false;
          
          if (exactMatch) {
            // If there's an exact match, only that item should be active
            isActive = item.path === exactMatch.path;
          } else {
            // If no exact match, find the most specific path that matches
            // Sort by path length (longer = more specific) and find the first match
            const matchingItems = filteredMenuItems
              .filter(otherItem => {
                if (pathname === otherItem.path) return true;
                const pathWithSlash = otherItem.path + '/';
                return pathname?.startsWith(pathWithSlash);
              })
              .sort((a, b) => b.path.length - a.path.length); // Sort by length, longest first
            
            // The most specific match is the first one (longest path)
            const mostSpecificMatch = matchingItems[0];
            isActive = mostSpecificMatch && item.path === mostSpecificMatch.path;
          }
          
          return (
            <ListItem key={`${item.path}-${index}`} disablePadding>
              <ListItemButton
                onClick={() => handleNavigation(item.path)}
                selected={isActive}
                sx={{
                  mx: 1,
                  mb: 0.5,
                  borderRadius: 1,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'primary.contrastText',
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'primary.contrastText' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 'bold' : 'normal',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  const TOOLBAR_HEIGHT = 64; // Standard MUI Toolbar height
  const SIDEBAR_MARGIN = 4; // Margin top and bottom for better visual separation

  if (variant === 'permanent') {
    return (
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            borderRight: 1,
            borderColor: 'divider',
            top: `${TOOLBAR_HEIGHT + SIDEBAR_MARGIN}px`,
            height: `calc(100% - ${TOOLBAR_HEIGHT + SIDEBAR_MARGIN * 2}px)`,
            mt: `${SIDEBAR_MARGIN}px`,
            mb: `${SIDEBAR_MARGIN}px`,
            borderRadius: 2,
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

