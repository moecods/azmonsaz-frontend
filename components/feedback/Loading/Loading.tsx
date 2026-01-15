"use client";

import React from 'react';
import { Box, CircularProgress, Typography, Skeleton } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface LoadingProps {
  /**
   * Loading message
   */
  message?: string;
  /**
   * Size of the spinner
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Full screen loading
   * @default false
   */
  fullScreen?: boolean;
  /**
   * Show message
   * @default true
   */
  showMessage?: boolean;
}

const LoadingContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'fullScreen',
})<{ fullScreen?: boolean }>(({ theme, fullScreen }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  ...(fullScreen && {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 9999,
  }),
}));

const sizeMap = {
  small: 24,
  medium: 40,
  large: 56,
};

/**
 * Loading component with spinner and optional message
 * 
 * @example
 * ```tsx
 * <Loading message="در حال بارگذاری..." size="large" />
 * ```
 */
export const Loading: React.FC<LoadingProps> = ({
  message,
  size = 'medium',
  fullScreen = false,
  showMessage = true,
}) => {
  return (
    <LoadingContainer fullScreen={fullScreen}>
      <CircularProgress size={sizeMap[size]} />
      {showMessage && message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </LoadingContainer>
  );
};

/**
 * Skeleton loading component for content placeholders
 */
export interface SkeletonLoadingProps {
  /**
   * Number of skeleton lines
   * @default 3
   */
  lines?: number;
  /**
   * Show avatar skeleton
   * @default false
   */
  showAvatar?: boolean;
  /**
   * Width of skeleton (can be number or string)
   */
  width?: number | string;
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  lines = 3,
  showAvatar = false,
  width = '100%',
}) => {
  return (
    <Box sx={{ width }}>
      {showAvatar && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
      )}
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
          height={24}
          sx={{ mb: 1 }}
        />
      ))}
    </Box>
  );
};

