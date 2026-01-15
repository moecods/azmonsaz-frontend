"use client";

import React from 'react';
import {
  Skeleton as MuiSkeleton,
  SkeletonProps as MuiSkeletonProps,
  Box,
  Stack,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface SkeletonProps extends MuiSkeletonProps {
  /**
   * Skeleton variant
   * @default 'text'
   */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /**
   * Animation
   * @default 'pulse'
   */
  animation?: 'pulse' | 'wave' | false;
  /**
   * Width (number or string)
   */
  width?: number | string;
  /**
   * Height (number or string)
   */
  height?: number | string;
}

const StyledSkeleton = styled(MuiSkeleton)(({ theme }) => ({
  borderRadius: 8,
}));

/**
 * Skeleton component for loading placeholders
 * 
 * @example
 * ```tsx
 * <Skeleton variant="text" width="100%" height={24} />
 * <Skeleton variant="circular" width={40} height={40} />
 * ```
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      animation = 'pulse',
      width,
      height,
      ...props
    },
    ref
  ) => {
    return (
      <StyledSkeleton
        ref={ref}
        variant={variant}
        animation={animation}
        width={width}
        height={height}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

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
  /**
   * Avatar size
   * @default 'medium'
   */
  avatarSize?: 'small' | 'medium' | 'large';
}

export const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  lines = 3,
  showAvatar = false,
  width = '100%',
  avatarSize = 'medium',
}) => {
  const avatarSizeMap = {
    small: 40,
    medium: 56,
    large: 80,
  };

  return (
    <Box sx={{ width }}>
      {showAvatar && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Skeleton
            variant="circular"
            width={avatarSizeMap[avatarSize]}
            height={avatarSizeMap[avatarSize]}
          />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Box>
        </Box>
      )}
      <Stack spacing={1}>
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton
            key={index}
            variant="text"
            width={index === lines - 1 ? '80%' : '100%'}
            height={24}
          />
        ))}
      </Stack>
    </Box>
  );
};

