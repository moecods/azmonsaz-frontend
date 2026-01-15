"use client";

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size' | 'color'> {
  /**
   * Button variant
   * @default 'contained'
   */
  variant?: 'contained' | 'outlined' | 'text' | 'icon';
  /**
   * Button size
   * @default 'medium'
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Button color
   * @default 'primary'
   */
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  /**
   * Show loading state
   * @default false
   */
  loading?: boolean;
  /**
   * Full width button
   * @default false
   */
  fullWidth?: boolean;
  /**
   * Button content
   */
  children: React.ReactNode;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== 'loading',
})<{ loading?: boolean }>(({ theme, loading }) => ({
  position: 'relative',
  '&:disabled': {
    opacity: 0.6,
  },
  ...(loading && {
    color: 'transparent',
    pointerEvents: 'none',
  }),
}));

const LoadingSpinner = styled(CircularProgress)(({ theme }) => ({
  position: 'absolute',
  left: '50%',
  top: '50%',
  marginLeft: '-12px',
  marginTop: '-12px',
}));

/**
 * Button component with loading state and consistent styling
 * 
 * @example
 * ```tsx
 * <Button variant="contained" color="primary" loading={isLoading}>
 *   Submit
 * </Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, loading = false, disabled, ...props }, ref) => {
    return (
      <StyledButton
        ref={ref}
        disabled={disabled || loading}
        loading={loading}
        {...props}
      >
        {loading && <LoadingSpinner size={24} />}
        {children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';

