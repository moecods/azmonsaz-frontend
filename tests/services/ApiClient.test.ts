/**
 * Tests for ApiClient
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient, ApiError } from '@/services/api/ApiClient';

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const baseURL = 'http://localhost:8000/api';

  beforeEach(() => {
    apiClient = new ApiClient(baseURL);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Token Management', () => {
    it('should set and get token', () => {
      apiClient.setToken('test-token');
      expect(apiClient.getToken()).toBe('test-token');
    });

    it('should clear token when set to null', () => {
      apiClient.setToken('test-token');
      apiClient.setToken(null);
      expect(apiClient.getToken()).toBeNull();
    });
  });

  describe('GET requests', () => {
    it('should make GET request successfully', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should include query parameters', async () => {
      const mockResponse = { success: true, data: [] };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await apiClient.get('/test', { page: 1, per_page: 10 });

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test?page=1&per_page=10`,
        expect.any(Object)
      );
    });

    it('should include authorization header when token is set', async () => {
      apiClient.setToken('test-token');
      const mockResponse = { success: true, data: {} };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      await apiClient.get('/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('POST requests', () => {
    it('should make POST request with data', async () => {
      const mockResponse = { success: true, data: { id: 1 } };
      const requestData = { name: 'Test' };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await apiClient.post('/test', requestData);

      expect(global.fetch).toHaveBeenCalledWith(
        `${baseURL}/test`,
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Error Handling', () => {
    it('should throw ApiError on 401 Unauthorized', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'Unauthorized' }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });

    it('should throw ApiError with validation errors on 422', async () => {
      const errorData = {
        message: 'Validation failed',
        errors: {
          name: ['The name field is required'],
          email: ['The email must be a valid email address'],
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => errorData,
      });

      try {
        await apiClient.get('/test');
        expect.fail('Should have thrown ApiError');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).status).toBe(422);
        expect((error as ApiError).errors).toEqual(errorData.errors);
      }
    });

    it('should throw ApiError on network errors', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Network error'));

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
    });

    it('should handle timeout', async () => {
      vi.useFakeTimers();
      global.fetch = vi.fn().mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                ok: true,
                status: 200,
                json: async () => ({}),
              });
            }, 40000);
          })
      );

      const requestPromise = apiClient.get('/test', undefined, { timeout: 1000 });

      vi.advanceTimersByTime(1000);

      await expect(requestPromise).rejects.toThrow(ApiError);
      vi.useRealTimers();
    });
  });

  describe('Retry Logic', () => {
    it('should retry on network errors', async () => {
      let callCount = 0;
      global.fetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true, data: {} }),
        });
      });

      const result = await apiClient.get('/test', undefined, { retries: 3 });

      expect(callCount).toBe(3);
      expect(result.success).toBe(true);
    });

    it('should not retry on 4xx errors', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ message: 'Bad Request' }),
      });

      await expect(apiClient.get('/test')).rejects.toThrow(ApiError);
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
  });
});

