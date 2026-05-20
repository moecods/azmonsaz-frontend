/**
 * Custom hook for authentication
 * Uses React Query for caching and state management
 */

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, getApiClient, ApiError } from '@/services';
import {
  LoginCredentials,
  RegisterCredentials,
  OtpLoginRequest,
  OtpLoginVerify,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@/types';
import { queryKeys } from '@/lib/query-client';


function getClientAuthGate() {
  if (typeof window === 'undefined') {
    return { mounted: false, hasToken: false };
  }
  return { mounted: true, hasToken: authService.isAuthenticated() };
}

export function useMe() {
  const [{ mounted, hasToken }] = useState(getClientAuthGate);
  
  // Check if we're on a public page
  const isPublicPage = typeof window !== 'undefined' && (
    window.location.pathname === '/login' ||
    window.location.pathname === '/register' ||
    window.location.pathname.startsWith('/reset-password')
  );
  
  return useQuery({
    queryKey: queryKeys.me(),
    // Only enable if token exists AND not on public page AND component is mounted
    // This prevents /me requests on landing page for guests and public pages
    enabled: mounted && hasToken && !isPublicPage,
    queryFn: async () => {
      // Double check token before making request
      if (!authService.isAuthenticated() || isPublicPage) {
        return null;
      }
      const response = await authService.getMe();
      return response.success ? response.data : null;
    },
    retry: false, // Never retry
    retryOnMount: false, // Don't retry on mount
    refetchOnMount: false, // Don't refetch on mount
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    refetchOnReconnect: false, // Don't refetch on reconnect
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    // Ignore 401 errors (unauthorized) - this is expected when user is not logged in
    throwOnError: (error: any) => {
      // Don't throw if it's a 401 error (user not authenticated)
      // This prevents unnecessary error states on login/register pages
      return error?.status !== 401;
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to login',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Set user data in cache and refetch to ensure consistency
      queryClient.setQueryData(queryKeys.me(), data.user);
      // Invalidate to trigger a refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.me() });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await authService.register(credentials);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to register',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Set user data in cache
      queryClient.setQueryData(queryKeys.me(), data.user);
    },
  });
}

export function useOtpLogin() {
  const queryClient = useQueryClient();

  const requestOtp = useMutation({
    mutationFn: async (request: OtpLoginRequest) => {
      const response = await authService.requestOtpLogin(request);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to request OTP',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
  });

  const verifyOtp = useMutation({
    mutationFn: async (verify: OtpLoginVerify) => {
      const response = await authService.verifyOtpLogin(verify);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to verify OTP',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Set user data in cache and refetch to ensure consistency
      queryClient.setQueryData(queryKeys.me(), data.user);
      // Invalidate to trigger a refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.me() });
    },
  });

  return {
    requestOtp: requestOtp.mutate,
    requestOtpAsync: requestOtp.mutateAsync,
    verifyOtp: verifyOtp.mutate,
    verifyOtpAsync: verifyOtp.mutateAsync,
    isRequestingOtp: requestOtp.isPending,
    isVerifyingOtp: verifyOtp.isPending,
  };
}

export function useForgotPassword() {
  const requestOtp = useMutation({
    mutationFn: async (request: ForgotPasswordRequest) => {
      const response = await authService.forgotPassword(request);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to request password reset',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
  });

  const resetPassword = useMutation({
    mutationFn: async (request: ResetPasswordRequest) => {
      const response = await authService.resetPassword(request);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to reset password',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
  });

  return {
    requestOtp: requestOtp.mutate,
    requestOtpAsync: requestOtp.mutateAsync,
    resetPassword: resetPassword.mutate,
    resetPasswordAsync: resetPassword.mutateAsync,
    isRequestingOtp: requestOtp.isPending,
    isResettingPassword: resetPassword.isPending,
  };
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await authService.logout();
    },
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
    },
  });
}

export function useIsAuthenticated() {
  return authService.isAuthenticated();
}

/**
 * Auth token for UI that must match server HTML on hydration.
 * Server + first client paint: false. After hydrate: reads localStorage.
 */
export function useHasAuthTokenHydrated(): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') {
        return () => {};
      }
      const notify = () => onStoreChange();
      window.addEventListener('storage', notify);
      window.addEventListener('auth-token-changed', notify);
      return () => {
        window.removeEventListener('storage', notify);
        window.removeEventListener('auth-token-changed', notify);
      };
    },
    () => authService.isAuthenticated(),
    () => false
  );
}

/**
 * Main authentication hook that combines all auth functionality
 * @returns Object with authentication state and methods
 */
export function useAuth() {
  const queryClient = useQueryClient();
  // useMe automatically checks for token before making request
  const { data: user, isLoading, error } = useMe();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const setToken = (token: string | null) => {
    getApiClient().setToken(token);
    queryClient.invalidateQueries({ queryKey: queryKeys.me() });
  };

  const hasToken = authService.isAuthenticated();

  return {
    user,
    isLoading,
    error,
    // Token means logged in; user profile may load from cache while navigating
    isAuthenticated: hasToken && (!!user || isLoading) && !error,
    setToken,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
