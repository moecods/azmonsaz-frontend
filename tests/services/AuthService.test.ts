/**
 * Tests for AuthService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '@/services/auth/AuthService';
import { ApiClient } from '@/services/api/ApiClient';

describe('AuthService', () => {
  let authService: AuthService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      post: vi.fn(),
      get: vi.fn(),
      setToken: vi.fn(),
      getToken: vi.fn(),
    };
    authService = new AuthService(mockApiClient as unknown as ApiClient);
  });

  describe('login', () => {
    it('should login and store token', async () => {
      const credentials = { phone_number: '09123456789', password: 'password' };
      const mockResponse = {
        success: true,
        data: {
          user: { id: 1, name: 'Test User' },
          token: 'test-token',
        },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(mockApiClient.post).toHaveBeenCalledWith('/login', credentials);
      expect(mockApiClient.setToken).toHaveBeenCalledWith('test-token');
      expect(result).toEqual(mockResponse);
    });

    it('should not store token if login fails', async () => {
      const credentials = { phone_number: '09123456789', password: 'wrong' };
      const mockResponse = {
        success: false,
        message: 'Invalid credentials',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login(credentials);

      expect(mockApiClient.setToken).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('should clear token on logout', async () => {
      mockApiClient.post.mockResolvedValue({ success: true });

      await authService.logout();

      expect(mockApiClient.setToken).toHaveBeenCalledWith(null);
    });

    it('should clear token even if API call fails', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      await authService.logout();

      expect(mockApiClient.setToken).toHaveBeenCalledWith(null);
    });
  });

  describe('getMe', () => {
    it('should fetch current user', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, name: 'Test User' },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await authService.getMe();

      expect(mockApiClient.get).toHaveBeenCalledWith('/me');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when token exists', () => {
      mockApiClient.getToken.mockReturnValue('test-token');

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('should return false when token is null', () => {
      mockApiClient.getToken.mockReturnValue(null);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });
});

