/**
 * Authentication Service
 * Handles login, logout, and user authentication
 */

import { ApiClient } from '../api/ApiClient';
import {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
  OtpLoginRequest,
  OtpLoginVerify,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  LoginResponse,
  OtpRequestResponse,
  ApiResponse,
} from '@/types';

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

  /**
   * Register a new user
   */
  async register(credentials: RegisterCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await this.apiClient.post<LoginResponse>('/register', credentials);

    // Store token if registration successful
    if (response.success && response.data?.token) {
      this.apiClient.setToken(response.data.token);
    }

    return response;
  }

  /**
   * Request OTP for login
   */
  async requestOtpLogin(request: OtpLoginRequest): Promise<ApiResponse<OtpRequestResponse>> {
    return this.apiClient.post<OtpRequestResponse>('/login/otp/request', request);
  }

  /**
   * Verify OTP and login
   */
  async verifyOtpLogin(verify: OtpLoginVerify): Promise<ApiResponse<LoginResponse>> {
    const response = await this.apiClient.post<LoginResponse>('/login/otp/verify', verify);

    // Store token if login successful
    if (response.success && response.data?.token) {
      this.apiClient.setToken(response.data.token);
    }

    return response;
  }

  /**
   * Request OTP for password reset
   */
  async forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse<OtpRequestResponse>> {
    return this.apiClient.post<OtpRequestResponse>('/password/forgot', request);
  }

  /**
   * Reset password using OTP
   */
  async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<{ message: string }>> {
    return this.apiClient.post<{ message: string }>('/password/reset', request);
  }
}

