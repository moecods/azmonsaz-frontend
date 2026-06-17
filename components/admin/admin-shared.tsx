"use client";

import type { ReactNode } from 'react';
import {
  Box,
  Button,
  Grow,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { Theme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { SkeletonLoading } from '@/components/feedback/Loading/Loading';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motionTransition } from '@/theme/motion';

export function adminTableHeadSx(theme: Theme): SxProps<Theme> {
  return {
    bgcolor: alpha(theme.palette.primary.main, 0.04),
    '& .MuiTableCell-head': {
      fontWeight: 700,
      color: 'text.secondary',
      borderBottomColor: 'divider',
      py: 1.5,
      whiteSpace: 'nowrap',
    },
  };
}

export function adminTableRowSx(theme: Theme, index: number, reducedMotion?: boolean): SxProps<Theme> {
  return {
    transition: motionTransition('background-color', 'fast', reducedMotion),
    '&:last-child td': { borderBottom: 0 },
    '&:hover': {
      bgcolor: alpha(theme.palette.primary.main, 0.03),
    },
    ...(index % 2 === 1 && {
      bgcolor: alpha(theme.palette.action.hover, 0.03),
    }),
  };
}

interface AdminSectionHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  count?: number;
  action?: ReactNode;
}

export function AdminSectionHeader({
  icon,
  title,
  subtitle,
  count,
  action,
}: AdminSectionHeaderProps) {
  const theme = useTheme();

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'center' }}
      spacing={2}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
              {typeof count === 'number' ? ` · ${count.toLocaleString('fa-IR')} مورد` : ''}
            </Typography>
          ) : typeof count === 'number' ? (
            <Typography variant="caption" color="text.secondary">
              {count.toLocaleString('fa-IR')} مورد
            </Typography>
          ) : null}
        </Box>
      </Stack>
      {action}
    </Stack>
  );
}

interface AdminFilterPanelProps {
  children: ReactNode;
  onReset?: () => void;
  showReset?: boolean;
}

export function AdminFilterPanel({ children, onReset, showReset }: AdminFilterPanelProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', md: 'flex-end' }}
          flexWrap="wrap"
          useFlexGap
        >
          {children}
        </Stack>
        {showReset && onReset ? (
          <Box>
            <Button size="small" onClick={onReset}>
              پاک کردن فیلترها
            </Button>
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}

interface AdminEmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function AdminEmptyState({ icon, title, description }: AdminEmptyStateProps) {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();

  return (
    <Grow in appear={!reducedMotion} timeout={reducedMotion ? 0 : undefined}>
      <Paper
        variant="outlined"
        sx={{
          py: 6,
          px: 3,
          textAlign: 'center',
          bgcolor: alpha(theme.palette.action.hover, 0.04),
        }}
      >
        <Box sx={{ color: 'text.disabled', mb: 1, '& svg': { fontSize: 40 } }}>{icon}</Box>
        <Typography variant="subtitle1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      </Paper>
    </Grow>
  );
}

interface AdminTableShellProps {
  children: ReactNode;
}

export function AdminTableShell({ children }: AdminTableShellProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'hidden' }}>
      {children}
    </TableContainer>
  );
}

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <AdminTableShell>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={6}>
              <SkeletonLoading lines={1} width="30%" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i}>
              <TableCell colSpan={6}>
                <SkeletonLoading showAvatar lines={1} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </AdminTableShell>
  );
}
