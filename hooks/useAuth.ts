/**
 * Custom hook for authentication
 * Uses React Query for caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, ApiError } from '@/services';
import { LoginCredentials, AuthUser } from '@/types';
import { queryKeys } from '@/lib/query-client';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me(),
    queryFn: async () => {
      const response = await authService.getMe();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user');
      }
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
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
      // Set user data in cache
      queryClient.setQueryData(queryKeys.me(), data.user);
    },
  });
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
 * Main authentication hook that combines all auth functionality
 * @returns Object with authentication state and methods
 */
export function useAuth() {
  const { data: user, isLoading, error } = useMe();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  return {
    user,
    isLoading,
    error,
    isAuthenticated: !!user && !error,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout: logoutMutation.mutate,
    logoutAsync: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
}
