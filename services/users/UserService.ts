/**
 * User Service
 * Handles all user management API calls (Admin only)
 */

import { ApiClient } from '../api/ApiClient';
import { User, ApiResponse, PaginatedResponse } from '@/types';

export interface UserFilters {
  page?: number;
  per_page?: number;
  search?: string;
}

export interface CreateUserData {
  name: string;
  phone_number: string;
  email?: string | null;
  password: string;
  role?: string;
  roles?: string[];
}

export interface UpdateUserData {
  name?: string;
  phone_number?: string;
  email?: string | null;
  password?: string;
  role?: string;
  roles?: string[];
}

export class UserService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get users with pagination
   */
  async getUsers(
    filters?: UserFilters
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    const response = await this.apiClient.get<{
      data: User[];
      meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
      };
    }>('/users', filters as Record<string, unknown>);

    // Transform to match PaginatedResponse structure
    return {
      success: response.success ?? true,
      data: {
        data: response.data?.data || [],
        meta: response.data?.meta || {
          current_page: 1,
          last_page: 1,
          per_page: 15,
          total: 0,
        },
      },
    };
  }

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<ApiResponse<User>> {
    return this.apiClient.get<User>(`/users/${id}`);
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<ApiResponse<User>> {
    return this.apiClient.post<User>('/users', data);
  }

  /**
   * Update user
   */
  async updateUser(
    id: number,
    data: UpdateUserData
  ): Promise<ApiResponse<User>> {
    return this.apiClient.patch<User>(`/users/${id}`, data);
  }

  /**
   * Toggle user active status
   */
  async toggleActive(id: number): Promise<ApiResponse<User>> {
    return this.apiClient.post<User>(`/users/${id}/toggle-active`);
  }

  /**
   * Impersonate a user (Admin only)
   */
  async impersonate(id: number): Promise<
    ApiResponse<{
      token: string;
      user: User;
      impersonation?: { active: boolean; admin_id: number; admin_name: string };
    }>
  > {
    return this.apiClient.post(`/users/${id}/impersonate`);
  }

  async stopImpersonating(): Promise<ApiResponse<null>> {
    return this.apiClient.post('/users/stop-impersonating');
  }

  /**
   * Search users by phone number or national ID
   */
  async searchUsers(params: { query: string; type?: 'phone' | 'national_id' | 'both' }): Promise<ApiResponse<User[]>> {
    return this.apiClient.get<User[]>('/users/search', params);
  }
}

