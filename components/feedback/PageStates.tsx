"use client";

import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import { Loading } from './Loading/Loading';
import { Alert } from './Alert/Alert';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InboxIcon from '@mui/icons-material/Inbox';

export interface PageLoadingProps {
  message?: string;
  fullScreen?: boolean;
}

/**
 * Standardized page loading state
 */
export function PageLoading({ message = 'در حال بارگذاری...', fullScreen = false }: PageLoadingProps) {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="center" p={3}>
        <Loading message={message} size="large" fullScreen={fullScreen} />
      </Box>
    </Container>
  );
}

export interface PageErrorProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
}

/**
 * Standardized page error state
 */
export function PageError({ error, onRetry, title = 'خطایی رخ داد' }: PageErrorProps) {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="center" p={3}>
        <Stack spacing={2} alignItems="center" sx={{ maxWidth: 600 }}>
          <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
          <Typography variant="h5" gutterBottom>
            {title}
          </Typography>
          <Alert severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
          {onRetry && (
            <Button variant="contained" onClick={onRetry}>
              تلاش مجدد
            </Button>
          )}
        </Stack>
      </Box>
    </Container>
  );
}

export interface EmptyStateProps {
  title?: string;
  message?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

/**
 * Standardized empty state component
 */
export function EmptyState({
  title = 'داده‌ای یافت نشد',
  message = 'در حال حاضر هیچ داده‌ای برای نمایش وجود ندارد.',
  action,
  icon,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      {icon || <InboxIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />}
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {message}
      </Typography>
      {action}
    </Box>
  );
}

