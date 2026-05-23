import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { groupService, ApiError } from '@/services';

export interface GroupCreatorAccessRow {
  user_id: number;
  user?: { id: number; name: string; phone_number?: string | null };
  can_attach_to_exams: boolean;
}

export function useGroupCreatorAccess(groupId: number | null, enabled = true) {
  return useQuery({
    queryKey: ['groups', groupId, 'creator-access'],
    queryFn: async () => {
      if (!groupId) return [];
      const response = await groupService.getCreatorAccess(groupId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to load creator access');
      }
      const raw = response.data;
      if (Array.isArray(raw)) {
        return raw as GroupCreatorAccessRow[];
      }
      return [];
    },
    enabled: enabled && !!groupId,
  });
}

export function useSyncGroupCreatorAccess() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId, userIds }: { groupId: number; userIds: number[] }) => {
      const response = await groupService.syncCreatorAccess(groupId, userIds);
      if (!response.success) {
        throw new ApiError(response.message || 'Failed to sync creator access');
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({
        queryKey: ['groups', variables.groupId, 'creator-access'],
      });
    },
  });
}
