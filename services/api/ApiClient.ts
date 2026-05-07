/**
 * Base API Client with error handling, retry logic, and interceptors
 */

import { ApiResponse } from '@/types';

export interface RequestConfig extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public errors?: Record<string, string[]>,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private defaultRetries = 3;
  private defaultRetryDelay = 1000; // 1 second
  private defaultTimeout = 30000; // 30 seconds

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  /**
   * Set authentication token
   */
  setToken(token: string | null): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Create timeout promise
   */
  private createTimeoutPromise(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new ApiError('Request timeout', 408));
      }, timeout);
    });
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry request with exponential backoff
   */
  private async retryRequest<T>(
    endpoint: string,
    config: RequestConfig,
    retries: number
  ): Promise<ApiResponse<T>> {
    try {
      return await this.request<T>(endpoint, { ...config, retries: 0 });
    } catch (error) {
      if (retries > 0 && this.isRetryableError(error)) {
        const delay = this.calculateRetryDelay(
          this.defaultRetries - retries,
          config.retryDelay || this.defaultRetryDelay
        );
        await this.sleep(delay);
        return this.retryRequest<T>(endpoint, config, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: unknown): boolean {
    if (error instanceof ApiError) {
      // Retry on network errors and 5xx errors
      return !error.status || (error.status >= 500 && error.status < 600);
    }
    // Retry on network errors
    return error instanceof TypeError;
  }

  /**
   * Calculate retry delay with exponential backoff
   */
  private calculateRetryDelay(attempt: number, baseDelay: number): number {
    return baseDelay * Math.pow(2, attempt);
  }

  /**
   * Build query string from params
   */
  private buildQueryString(params?: Record<string, unknown>): string {
    if (!params) return '';

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item) => searchParams.append(`${key}[]`, String(item)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
  }

  /**
   * Main request method with error handling and retry logic
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      retries = this.defaultRetries,
      timeout = this.defaultTimeout,
      ...fetchConfig
    } = config;

    // Build full URL
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint}`;

    // Build headers. When the body is FormData / Blob / etc., let the browser
    // set the correct multipart boundary itself — explicit `Content-Type:
    // application/json` would corrupt the request.
    const isFormData =
      typeof FormData !== 'undefined' && fetchConfig.body instanceof FormData;
    const headers: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Accept': 'application/json',
      ...(fetchConfig.headers as Record<string, string> || {}),
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const requestConfig: RequestInit = {
      ...fetchConfig,
      headers,
    };

    try {
      // Create timeout and fetch promises
      const timeoutPromise = this.createTimeoutPromise(timeout);
      const fetchPromise = fetch(url, requestConfig);

      // Race between timeout and fetch
      const response = await Promise.race([fetchPromise, timeoutPromise]);

      // Handle 401 Unauthorized - token might be invalid
      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new ApiError('Unauthorized', 401);
      }

      // Handle non-ok responses
      if (!response.ok) {
        // status 0 = CORS/network (opaque response); avoid reading body
        if (response.status === 0) {
          throw new ApiError(
            'اتصال به سرور برقرار نشد. آدرس API و تنظیمات CORS سرور را بررسی کنید.',
            0
          );
        }
        const errorData = await response.json().catch(() => ({}));

        // Handle Laravel validation errors (422 status)
        if (response.status === 422 && errorData.errors) {
          throw new ApiError(
            errorData.message || 'Validation failed',
            422,
            errorData.errors
          );
        }

        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // If it's already an ApiError, throw it
      if (error instanceof ApiError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        const networkError = new ApiError(
          'خطا در اتصال به سرور. لطفاً اتصال اینترنت را بررسی کنید.',
          0,
          undefined,
          error
        );

        // Retry network errors if retries > 0
        if (retries > 0) {
          return this.retryRequest<T>(endpoint, config, retries);
        }

        throw networkError;
      }

      // Re-throw unknown errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * GET request
   */
  async get<T>(
    endpoint: string,
    params?: Record<string, unknown>,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const queryString = this.buildQueryString(params);
    return this.request<T>(`${endpoint}${queryString}`, {
      ...config,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'DELETE',
    });
  }

  /**
   * Multipart upload via XHR so callers can observe upload progress.
   *
   * Native `fetch` doesn't expose progress events, and image uploads are the
   * one place we genuinely need them (large blobs over slow connections).
   * The response shape is the same `ApiResponse<T>` the JSON path returns.
   */
  upload<T>(
    endpoint: string,
    formData: FormData,
    options: {
      method?: 'POST' | 'PUT' | 'PATCH';
      onProgress?: (loaded: number, total: number) => void;
      signal?: AbortSignal;
      timeout?: number;
    } = {},
  ): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.baseURL}${endpoint}`;
    const method = options.method ?? 'POST';
    const timeout = options.timeout ?? this.defaultTimeout;

    return new Promise<ApiResponse<T>>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(method, url, true);
      xhr.responseType = 'json';
      xhr.timeout = timeout;
      xhr.setRequestHeader('Accept', 'application/json');
      if (this.token) {
        xhr.setRequestHeader('Authorization', `Bearer ${this.token}`);
      }

      if (xhr.upload && options.onProgress) {
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) options.onProgress!(e.loaded, e.total);
        };
      }

      xhr.onload = () => {
        const status = xhr.status;
        const body = (xhr.response ?? null) as
          | (ApiResponse<T> & { errors?: Record<string, string[]>; message?: string })
          | null;

        if (status === 401) {
          this.setToken(null);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          reject(new ApiError('Unauthorized', 401));
          return;
        }

        if (status >= 200 && status < 300 && body) {
          resolve(body as ApiResponse<T>);
          return;
        }

        if (status === 422 && body?.errors) {
          reject(new ApiError(body.message || 'Validation failed', 422, body.errors));
          return;
        }

        reject(
          new ApiError(
            body?.message || `HTTP error! status: ${status}`,
            status || undefined,
          ),
        );
      };

      xhr.onerror = () => {
        reject(
          new ApiError(
            'خطا در اتصال به سرور. لطفاً اتصال اینترنت را بررسی کنید.',
            0,
          ),
        );
      };

      xhr.ontimeout = () => reject(new ApiError('Request timeout', 408));
      xhr.onabort = () => reject(new ApiError('Request aborted', 0));

      if (options.signal) {
        if (options.signal.aborted) {
          xhr.abort();
          return;
        }
        options.signal.addEventListener('abort', () => xhr.abort(), {
          once: true,
        });
      }

      xhr.send(formData);
    });
  }
}

