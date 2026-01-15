"use client";

import React from 'react';
import {
  Avatar as MuiAvatar,
  AvatarProps as MuiAvatarProps,
  styled,
} from '@mui/material';

export interface AvatarProps extends MuiAvatarProps {
  /**
   * Avatar size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Avatar variant
   * @default 'circular'
   */
  variant?: 'circular' | 'rounded' | 'square';
  /**
   * Avatar source (image URL)
   */
  src?: string;
  /**
   * Avatar alt text
   */
  alt?: string;
  /**
   * Avatar initials (if no image)
   */
  children?: React.ReactNode;
  /**
   * Show online status indicator
   * @default false
   */
  showOnline?: boolean;
  /**
   * Online status
   * @default false
   */
  online?: boolean;
}

const sizeMap = {
  small: 32,
  medium: 40,
  large: 56,
};

const StyledAvatar = styled(MuiAvatar, {
  shouldForwardProp: (prop) => prop !== 'size' && prop !== 'showOnline',
})<{ size?: 'small' | 'medium' | 'large'; showOnline?: boolean }>(
  ({ theme, size = 'medium', showOnline }) => ({
    width: sizeMap[size],
    height: sizeMap[size],
    fontSize: size === 'small' ? '0.875rem' : size === 'large' ? '1.5rem' : '1rem',
    fontWeight: 500,
    ...(showOnline && {
      position: 'relative',
      '&::after': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: size === 'small' ? 8 : size === 'large' ? 14 : 10,
        height: size === 'small' ? 8 : size === 'large' ? 14 : 10,
        borderRadius: '50%',
        border: `2px solid ${theme.palette.background.paper}`,
        backgroundColor: theme.palette.success.main,
      },
    }),
  })
);

/**
 * Avatar component for displaying user profile pictures or initials
 * 
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="User" size="large" showOnline online />
 * <Avatar>JD</Avatar>
 * ```
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = 'medium',
      variant = 'circular',
      src,
      alt,
      children,
      showOnline = false,
      online = false,
      ...props
    },
    ref
  ) => {
    return (
      <StyledAvatar
        ref={ref}
        size={size}
        variant={variant}
        src={src}
        alt={alt}
        showOnline={showOnline && online}
        {...props}
      >
        {children}
      </StyledAvatar>
    );
  }
);

Avatar.displayName = 'Avatar';

