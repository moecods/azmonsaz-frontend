/**
 * Hooks for notifications
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services';
import { queryKeys } from '@/lib/query-client';
import { useAuth } from './useAuth';

export function useNotifications(params?: { per_page?: number; page?: number }) {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.notifications(params),
    queryFn: async () => {
      const response = await notificationService.getNotifications(params);
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch notifications');
      }
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
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
    onSuccess: () => {
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
