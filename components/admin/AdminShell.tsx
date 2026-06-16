"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { adminNavItems, isAdminNavActive } from '@/components/admin/admin-nav';

function AdminDesktopNav() {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: 240,
        flexShrink: 0,
        p: 1,
        alignSelf: 'flex-start',
        position: 'sticky',
        top: 88,
      }}
    >
      <Typography
        variant="overline"
        color="text.secondary"
        sx={{ px: 1.5, pt: 1, pb: 0.5, display: 'block' }}
      >
        بخش‌های مدیریت
      </Typography>
      <List dense disablePadding component="nav" aria-label="ناوبری پنل مدیریت">
        {adminNavItems.map((item) => {
          const active = isAdminNavActive(pathname, item);
          const Icon = item.icon;

          return (
            <ListItemButton
              key={item.path}
              component={Link}
              href={item.path}
              selected={active}
              aria-current={active ? 'page' : undefined}
              data-cy={item.dataCy}
              sx={{
                borderRadius: 1.5,
                mx: 0.5,
                mb: 0.25,
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                secondary={item.description}
                primaryTypographyProps={{ fontWeight: active ? 700 : 600, fontSize: '0.9rem' }}
                secondaryTypographyProps={{ fontSize: '0.72rem', noWrap: true }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );
}

function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        mb: 2,
      }}
    >
      <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
        بخش‌های مدیریت
      </Typography>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          overflowX: 'auto',
          pb: 0.5,
          flexWrap: 'nowrap',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        }}
      >
        {adminNavItems.map((item) => {
          const active = isAdminNavActive(pathname, item);
          const Icon = item.icon;

          return (
            <Button
              key={item.path}
              component={Link}
              href={item.path}
              size="small"
              variant={active ? 'contained' : 'outlined'}
              aria-current={active ? 'page' : undefined}
              startIcon={<Icon fontSize="small" />}
              data-cy={item.dataCy}
              sx={{
                flexShrink: 0,
                textTransform: 'none',
                fontWeight: active ? 700 : 600,
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
}

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={{ md: 3 }} alignItems="stretch">
      <AdminDesktopNav />

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <AdminMobileNav />
        {children}
      </Box>
    </Stack>
  );
}
