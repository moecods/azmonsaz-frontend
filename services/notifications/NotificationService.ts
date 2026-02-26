/**
 * Notification Service
 * Handles in-app notifications
 */

import { ApiClient } from '../api/ApiClient';

export interface Notification {
  id: string;
  type: string;
  data: {
    exam_id?: number;
    notification_type?: string;
    title?: string;
    message?: string;
    exam_title?: string;
    exam_start_at?: string;
    sent_by?: number;
    sent_by_name?: string;
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: Notification[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export class NotificationService {
  constructor(private apiClient: ApiClient) {}

  async getNotifications(params?: { per_page?: number; page?: number }): Promise<ApiResponse<NotificationsResponse>> {
    const searchParams = new URLSearchParams();
    if (params?.per_page) searchParams.set('per_page', String(params.per_page));
    if (params?.page) searchParams.set('page', String(params.page));
    const query = searchParams.toString();
    const url = query ? `/notifications?${query}` : '/notifications';
    return this.apiClient.get<NotificationsResponse>(url);
  }

  async markAsRead(id: string): Promise<ApiResponse<void>> {
    return this.apiClient.patch<void>(`/notifications/${id}/read`);
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    return this.apiClient.patch<void>('/notifications/read-all');
  }

  async getExamNotifications(examId: number): Promise<ApiResponse<ExamNotificationLog[]>> {
    return this.apiClient.get<ExamNotificationLog[]>(`/exams/${examId}/notifications`);
  }

  async sendExamNotification(
    examId: number,
    data: { message: string; recipient_ids?: number[]; send_to_all?: boolean }
  ): Promise<ApiResponse<{ sent_count: number }>> {
    return this.apiClient.post<{ sent_count: number }>(`/exams/${examId}/notifications`, data);
  }
}

export interface ExamNotificationLog {
  id: number;
  notification_type: string;
  sent_at: string;
  recipient_count: number;
  message: string | null;
  sent_by: { id: number; name: string } | null;
  recipients: Array<{ user_id: number; read_at: string | null }>;
}
