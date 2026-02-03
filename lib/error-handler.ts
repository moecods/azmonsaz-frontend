/**
 * Centralized error handling utilities
 * Replaces console.error with proper error handling
 */

import { ApiError } from '@/services/api/ApiClient';

export interface ErrorDisplayOptions {
  /**
   * Whether to show error to user
   * @default true
   */
  showToUser?: boolean;
  /**
   * Custom error message for user
   */
  userMessage?: string;
  /**
   * Whether to log error to console (dev only)
   * @default true
   */
  logToConsole?: boolean;
  /**
   * Additional context for logging
   */
  context?: string;
}

/**
 * Extract user-friendly error message from error
 */
export function getErrorMessage(error: unknown, defaultMessage: string = 'خطایی رخ داد'): string {
  if (error instanceof ApiError) {
    // Handle validation errors
    if (error.errors) {
      const firstErrorKey = Object.keys(error.errors)[0];
      const firstErrorMessage = error.errors[firstErrorKey]?.[0];
      return firstErrorMessage || error.message || defaultMessage;
    }
    return error.message || defaultMessage;
  }

  if (error instanceof Error) {
    return error.message || defaultMessage;
  }

  return defaultMessage;
}

/**
 * Handle error with proper logging and user notification
 */
export function handleError(
  error: unknown,
  options: ErrorDisplayOptions = {}
): string {
  const {
    showToUser = true,
    userMessage,
    logToConsole = process.env.NODE_ENV === 'development',
    context,
  } = options;

  const message = userMessage || getErrorMessage(error);

  // Log to console in development
  if (logToConsole) {
    const logContext = context ? `[${context}]` : '';
    console.error(`${logContext} Error:`, error);
  }

  // TODO: Send to error tracking service (e.g., Sentry) in production
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: { context } });
  // }

  return message;
}

/**
 * Handle API error with validation error mapping
 */
export function handleApiError(
  error: unknown,
  setError?: (field: string, error: { type: string; message: string }) => void
): string {
  const message = handleError(error, { context: 'API' });

  // Map validation errors to form fields
  if (error instanceof ApiError && error.errors && setError) {
    Object.keys(error.errors).forEach((field) => {
      const errorMessage = Array.isArray(error.errors![field])
        ? error.errors![field][0]
        : error.errors![field];
      setError(field, { type: 'server', message: errorMessage });
    });
  }

  return message;
}

