"use client";

import React from 'react';
import { Alert as MuiAlert, AlertProps as MuiAlertProps, AlertTitle, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface AlertProps extends Omit<MuiAlertProps, 'severity'> {
  /**
   * Alert severity
   * @default 'info'
   */
  severity?: 'success' | 'error' | 'warning' | 'info';
  /**
   * Alert title
   */
  title?: React.ReactNode;
  /**
   * Show close button
   * @default false
   */
  closable?: boolean;
  /**
   * Alert content
   */
  children: React.ReactNode;
}

const StyledAlert = styled(MuiAlert)(({ theme }) => ({
  borderRadius: 8,
  '& .MuiAlert-icon': {
    fontSize: '1.5rem',
  },
}));

/**
 * Alert component for displaying messages to users
 * 
 * @example
 * ```tsx
 * <Alert severity="success" title="موفق" closable>
 *   عملیات با موفقیت انجام شد
 * </Alert>
 * ```
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ title, children, closable = false, ...props }, ref) => {
    return (
      <StyledAlert ref={ref} {...props}>
        {title && <AlertTitle>{title}</AlertTitle>}
        {children}
      </StyledAlert>
    );
  }
);

Alert.displayName = 'Alert';

/**
 * Toast notification component
 */
export interface ToastProps {
  /**
   * Toast message
   */
  message: string;
  /**
   * Toast severity
   * @default 'info'
   */
  severity?: 'success' | 'error' | 'warning' | 'info';
  /**
   * Open state
   */
  open: boolean;
  /**
   * Close handler
   */
  onClose: () => void;
  /**
   * Auto hide duration in milliseconds
   * @default 6000
   */
  autoHideDuration?: number;
  /**
   * Toast position
   * @default { vertical: 'top', horizontal: 'center' }
   */
  anchorOrigin?: {
    vertical: 'top' | 'bottom';
    horizontal: 'left' | 'center' | 'right';
  };
}

export const Toast: React.FC<ToastProps> = ({
  message,
  severity = 'info',
  open,
  onClose,
  autoHideDuration = 6000,
  anchorOrigin = { vertical: 'top', horizontal: 'center' },
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

