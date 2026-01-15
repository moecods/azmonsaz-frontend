/**
 * Authentication Service
 * Handles login, logout, and user authentication
 */

import { ApiClient } from '../api/ApiClient';
import { AuthUser, LoginCredentials, LoginResponse, ApiResponse } from '@/types';

export class AuthService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await this.apiClient.post<LoginResponse>('/login', credentials);

    // Store token if login successful
    if (response.success && response.data?.token) {
      this.apiClient.setToken(response.data.token);
    }

    return response;
  }

  /**
   * Logout user
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      await this.apiClient.post<void>('/logout');
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      // Clear token on logout
      this.apiClient.setToken(null);
    }

    return {
      success: true,
      data: undefined,
      message: 'Logged out successfully',
    };
  }

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<ApiResponse<AuthUser>> {
    return this.apiClient.get<AuthUser>('/me');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.apiClient.getToken() !== null;
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.apiClient.getToken();
  }
}

