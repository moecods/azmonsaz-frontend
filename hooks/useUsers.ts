/**
 * Custom hook for managing users (Admin only)
 * Uses React Query for caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService, ApiError } from '@/services';
import { User, UserFilters, CreateUserData, UpdateUserData } from '@/services/users';
import { queryKeys } from '@/lib/query-client';

export function useUsers(filters?: UserFilters) {
  return useQuery({
    queryKey: queryKeys.users(filters),
    queryFn: async () => {
      const response = await userService.getUsers(filters);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }
      return response.data;
    },
  });
}

export function useUser(id: number | null) {
  return useQuery({
    queryKey: queryKeys.user(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await userService.getUser(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch user');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await userService.createUser(data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to create user',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserData }) => {
      const response = await userService.updateUser(id, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to update user',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.user(variables.id), data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await userService.toggleActive(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to toggle user active status');
      }
      return response.data;
    },
    onSuccess: (data, id) => {
      // Update user in cache
      queryClient.setQueryData(queryKeys.user(id), data);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

