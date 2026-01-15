"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Typography, Card } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component for catching React errors
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // TODO: Send error to error tracking service (e.g., Sentry)
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            p: 3,
          }}
        >
          <Card sx={{ maxWidth: 600, p: 4, textAlign: 'center' }}>
            <ErrorOutlineIcon
              sx={{ fontSize: 64, color: 'error.main', mb: 2 }}
            />
            <Typography variant="h5" gutterBottom>
              خطایی رخ داد
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              متأسفانه خطایی در برنامه رخ داده است. لطفاً صفحه را رفرش کنید یا
              دوباره تلاش کنید.
            </Typography>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'error.light',
                  borderRadius: 1,
                  mb: 3,
                  textAlign: 'left',
                }}
              >
                <Typography variant="caption" component="pre" sx={{ fontSize: 12 }}>
                  {this.state.error.toString()}
                  {this.state.error.stack}
                </Typography>
              </Box>
            )}
            <Button variant="contained" onClick={this.handleReset}>
              تلاش مجدد
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ ml: 2 }}
            >
              رفرش صفحه
            </Button>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

