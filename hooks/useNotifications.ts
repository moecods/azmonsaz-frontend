/**
 * Hooks for notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services';
import type { Notification } from '@/services/notifications/NotificationService';
import { queryKeys } from '@/lib/query-client';
import { useIsAuthenticated } from './useAuth';

export function useNotifications(
  params?: { per_page?: number; page?: number; unread_only?: boolean },
  options?: { enabled?: boolean }
) {
  const hasToken = useIsAuthenticated();

  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: async () => {
      const response = await notificationService.getNotifications(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
      return response.data;
    },
    enabled: hasToken && (options?.enabled ?? true),
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await notificationService.markAsRead(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to mark as read');
      }
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const snapshots = queryClient.getQueriesData<{ data: Notification[]; meta: unknown }>({
        queryKey: ['notifications'],
      });
      snapshots.forEach(([key, data]) => {
        if (!data?.data) return;
        queryClient.setQueryData(key, {
          ...data,
          data: data.data.map((n) =>
            n.id === id ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n
          ),
        });
      });
      return { snapshots };
    },
    onError: (_err, _id, context) => {
      context?.snapshots.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useExamNotifications(examId: number | null) {
  return useQuery({
    queryKey: queryKeys.examNotifications(examId!),
    queryFn: async () => {
      if (!examId) return [];
      const response = await notificationService.getExamNotifications(examId);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch exam notifications');
      }
      return response.data;
    },
    enabled: !!examId,
  });
}

export function useSendExamNotification(examId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { message: string; recipient_ids?: number[]; send_to_all?: boolean }) => {
      if (!examId) throw new Error('Exam ID required');
      const response = await notificationService.sendExamNotification(examId, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to send notification');
      }
      return response.data;
    },
    onSuccess: () => {
      if (examId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.examNotifications(examId) });
      }
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await notificationService.markAllAsRead();
      if (!response.success) {
        throw new Error(response.message || 'Failed to mark all as read');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSendAdminBroadcast() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof notificationService.sendAdminBroadcast>[0]) => {
      const response = await notificationService.sendAdminBroadcast(data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to send notification');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useSendGroupMessage(groupId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof notificationService.sendGroupMessage>[1]) => {
      if (!groupId) throw new Error('Group ID required');
      const response = await notificationService.sendGroupMessage(groupId, data);
      if (!response.success) {
        throw new Error(response.message || 'Failed to send notification');
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
