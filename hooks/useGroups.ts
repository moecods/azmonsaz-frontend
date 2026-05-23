/**
 * Custom hook for managing groups
 * Uses React Query for caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService, ApiError } from '@/services';
import type { Group, CreateGroupRequest, UpdateGroupRequest } from '@/services/groups/GroupService';

export function useGroups() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const response = await groupService.getGroups();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch groups');
      }
      return response.data;
    },
  });
}

export function useGroup(id: number | null) {
  return useQuery({
    queryKey: ['group', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await groupService.getGroup(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch group');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateGroupRequest) => {
      const response = await groupService.createGroup(data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to create group',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useUpdateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateGroupRequest }) => {
      const response = await groupService.updateGroup(id, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to update group',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.id] });
    },
  });
}

export function useDeleteGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await groupService.deleteGroup(id);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to delete group',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useAddUsersToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userIds }: { groupId: number; userIds: number[] }) => {
      const response = await groupService.addUsersToGroup(groupId, userIds);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to add users to group',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
    },
  });
}

export function useRemoveUserFromGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userId }: { groupId: number; userId: number }) => {
      const response = await groupService.removeUserFromGroup(groupId, userId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to remove user from group',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
    },
  });
}

export function useImportUsersToGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, file }: { groupId: number; file: File }) => {
      const response = await groupService.importUsers(groupId, file);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to import users',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.groupId] });
    },
  });
}

export { useGroupCreatorAccess, useSyncGroupCreatorAccess } from '@/hooks/useGroupCreatorAccess';
