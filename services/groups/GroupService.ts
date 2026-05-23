/**
 * Group Service
 * Handles all group-related API calls
 */

import { ApiClient } from '../api/ApiClient';
import { ApiResponse } from '@/types';

export interface Group {
  id: number;
  name: string;
  description?: string;
  created_by: number;
  creator?: {
    id: number;
    name: string;
  };
  users?: Array<{
    id: number;
    name: string;
    phone_number: string;
    national_id?: string;
  }>;
  users_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGroupRequest {
  name: string;
  description?: string;
  user_ids?: number[];
}

export interface UpdateGroupRequest {
  name?: string;
  description?: string;
}

export class GroupService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get all groups
   */
  async getGroups(): Promise<ApiResponse<Group[]>> {
    return this.apiClient.get<Group[]>('/groups');
  }

  /**
   * Get a single group
   */
  async getGroup(id: number): Promise<ApiResponse<Group>> {
    return this.apiClient.get<Group>(`/groups/${id}`);
  }

  /**
   * Create a new group
   */
  async createGroup(data: CreateGroupRequest): Promise<ApiResponse<Group>> {
    return this.apiClient.post<Group>('/groups', data);
  }

  /**
   * Update a group
   */
  async updateGroup(id: number, data: UpdateGroupRequest): Promise<ApiResponse<Group>> {
    return this.apiClient.patch<Group>(`/groups/${id}`, data);
  }

  async getCreatorAccess(groupId: number): Promise<
    ApiResponse<Array<{ user_id: number; user?: { id: number; name: string; phone_number?: string }; can_attach_to_exams: boolean }>>
  > {
    return this.apiClient.get(`/groups/${groupId}/creator-access`);
  }

  async syncCreatorAccess(groupId: number, userIds: number[]): Promise<ApiResponse<unknown>> {
    return this.apiClient.put(`/groups/${groupId}/creator-access`, { user_ids: userIds });
  }

  async getAccessibleGroups(): Promise<ApiResponse<Group[]>> {
    return this.apiClient.get<Group[]>('/groups/accessible');
  }

  /**
   * Delete a group
   */
  async deleteGroup(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.delete<{ message: string }>(`/groups/${id}`);
  }

  /**
   * Add users to a group
   */
  async addUsersToGroup(groupId: number, userIds: number[]): Promise<ApiResponse<Group>> {
    return this.apiClient.post<Group>(`/groups/${groupId}/users`, { user_ids: userIds });
  }

  /**
   * Remove a user from a group
   */
  async removeUserFromGroup(groupId: number, userId: number): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.delete<{ message: string }>(`/groups/${groupId}/users/${userId}`);
  }

  /**
   * Import users from Excel file to a group
   */
  async importUsers(groupId: number, file: File): Promise<ApiResponse<{
    group: Group;
    imported: number;
    created: number;
    skipped: number;
    errors: string[];
  }>> {
    const formData = new FormData();
    formData.append('file', file);

    // Use direct fetch for file upload
    const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
    const token = this.apiClient.getToken();
    
    const response = await fetch(`${baseURL}/groups/${groupId}/import`, {
      method: 'POST',
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Accept': 'application/json',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
}
