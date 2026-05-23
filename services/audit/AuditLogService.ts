import { ApiClient } from '../api/ApiClient';
import { ApiResponse } from '@/types';

export interface AuditLogItem {
  id: number;
  event: string;
  subject_type: string;
  subject_id: number;
  actor: { id: number; name: string } | null;
  properties: Record<string, unknown> | null;
  created_at: string | null;
}

export class AuditLogService {
  constructor(private apiClient: ApiClient) {}

  async getAuditLogs(params?: {
    per_page?: number;
    page?: number;
    event?: string;
    subject_type?: string;
    subject_id?: number;
    actor_id?: number;
    from?: string;
    to?: string;
  }): Promise<
    ApiResponse<{
      data: AuditLogItem[];
      meta: { current_page: number; last_page: number; per_page: number; total: number };
    }>
  > {
    return this.apiClient.get('/audit-logs', params as Record<string, unknown>);
  }
}
