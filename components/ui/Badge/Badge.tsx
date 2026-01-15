"use client";

import React from 'react';
import {
  Badge as MuiBadge,
  BadgeProps as MuiBadgeProps,
  styled,
} from '@mui/material';

export interface BadgeProps extends Omit<MuiBadgeProps, 'variant'> {
  /**
   * Badge variant
   * @default 'standard'
   */
  variant?: 'standard' | 'dot';
  /**
   * Badge color
   * @default 'primary'
   */
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  /**
   * Badge content (number or text)
   */
  badgeContent?: React.ReactNode;
  /**
   * Show badge even when badgeContent is 0
   * @default false
   */
  showZero?: boolean;
  /**
   * Maximum number to show (for numbers)
   */
  max?: number;
  /**
   * Badge anchor origin
   */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'right';
  };
  /**
   * Children to wrap with badge
   */
  children?: React.ReactNode;
}

const StyledBadge = styled(MuiBadge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    borderRadius: 12,
    fontSize: '0.75rem',
    fontWeight: 500,
    padding: '0 6px',
    minWidth: 20,
    height: 20,
  },
  '& .MuiBadge-dot': {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
}));

/**
 * Badge component for displaying notifications, counts, or status indicators
 * 
 * @example
 * ```tsx
 * <Badge badgeContent={4} color="error">
 *   <IconButton>
 *     <NotificationsIcon />
 *   </IconButton>
 * </Badge>
 * ```
 */
export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = 'standard',
      color = 'primary',
      badgeContent,
      showZero = false,
      max = 99,
      anchorOrigin = { vertical: 'top', horizontal: 'right' },
      children,
      ...props
    },
    ref
  ) => {
    return (
      <StyledBadge
        ref={ref}
        variant={variant}
        color={color}
        badgeContent={badgeContent}
        showZero={showZero}
        max={max}
        anchorOrigin={anchorOrigin}
        {...props}
      >
        {children}
      </StyledBadge>
    );
  }
);

Badge.displayName = 'Badge';

