// API integration layer for Azmoon-Saz frontend

import { 
  Exam, 
  Question, 
  QuestionCategory, 
  Partner, 
  User,
  CreateExamRequest,
  UpdateExamRequest,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ApiResponse,
  PaginatedResponse,
  AuthUser,
  LoginCredentials,
  LoginResponse
} from '@/types';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

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

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    
    const config: RequestInit = {
      headers,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - token might be invalid
      if (response.status === 401) {
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized');
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle Laravel validation errors (422 status)
        if (response.status === 422 && errorData.errors) {
          const validationError = new Error(errorData.message || 'Validation failed');
          (validationError as any).errors = errorData.errors;
          (validationError as any).status = 422;
          throw validationError;
        }
        
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      // Re-throw error - let caller handle it
      throw error;
    }
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<LoginResponse>> {
    const response = await this.request<LoginResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store token if login successful
    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.request<void>('/logout', {
      method: 'POST',
    });
    
    // Clear token on logout
    this.setToken(null);
    
    return response;
  }

  async getMe(): Promise<ApiResponse<AuthUser>> {
    return this.request<AuthUser>('/me');
  }

  // Exam endpoints
  async createExam(data: CreateExamRequest): Promise<ApiResponse<Exam>> {
    return this.request<Exam>('/exams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getExam(id: number): Promise<ApiResponse<Exam>> {
    return this.request<Exam>(`/exams/${id}`);
  }

  async getExamBySignedUrl(signedUrl: string): Promise<ApiResponse<Exam>> {
    // Use the signed URL directly - it's a full URL with signature
    try {
      const response = await fetch(signedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies if needed
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return {
        success: data.success ?? true,
        data: data.data,
        message: data.message,
      };
    } catch (error) {
      // Handle network errors (CORS, connection issues, etc.)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('خطا در اتصال به سرور. لطفاً اتصال اینترنت و تنظیمات CORS را بررسی کنید.');
      }
      throw error;
    }
  }

  async updateExam(id: number, data: UpdateExamRequest): Promise<ApiResponse<Exam>> {
    return this.request<Exam>(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async completeExam(id: number): Promise<ApiResponse<{ callback_url: string; pdf_url: string }>> {
    return this.request<{ callback_url: string; pdf_url: string }>(`/exams/${id}/complete`, {
      method: 'POST',
    });
  }

  // Question endpoints
  async getQuestions(params?: {
    category_id?: number;
    difficulty?: string;
    search?: string;
    type?: string;
    tags?: string[];
    sort?: 'newest' | 'oldest';
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Question>>> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'tags' && Array.isArray(value) && value.length > 0) {
            // Handle tags array
            value.forEach(tag => searchParams.append('tags[]', tag));
          } else if (key !== 'tags') {
            searchParams.append(key, value.toString());
          }
        }
      });
    }
    
    const queryString = searchParams.toString();
    return this.request<PaginatedResponse<Question>>(`/questions${queryString ? `?${queryString}` : ''}`);
  }

  async getQuestion(id: number): Promise<ApiResponse<Question>> {
    return this.request<Question>(`/questions/${id}`);
  }

  async createQuestion(data: CreateQuestionRequest): Promise<ApiResponse<Question>> {
    return this.request<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateQuestion(id: number, data: UpdateQuestionRequest): Promise<ApiResponse<Question>> {
    return this.request<Question>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteQuestion(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  // Question Category endpoints
  async getCategories(): Promise<ApiResponse<QuestionCategory[]>> {
    return this.request<QuestionCategory[]>('/question-categories');
  }

  async createCategory(data: { name: string; description?: string }): Promise<ApiResponse<QuestionCategory>> {
    return this.request<QuestionCategory>('/question-categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Partner endpoints (Admin only)
  async getPartners(params?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<Partner>>> {
    // Backend returns { success: true, data: [...], meta: {...} }
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      searchParams.append('per_page', params.per_page.toString());
    }
    
    const queryString = searchParams.toString();
    const response = await this.request<{ data: Partner[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>(`/partners${queryString ? `?${queryString}` : ''}`);
    
    // Transform to match PaginatedResponse structure
    return {
      success: response.success ?? true,
      data: {
        data: response.data || [],
        meta: response.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      },
    };
  }

  async getPartner(id: number): Promise<ApiResponse<Partner>> {
    // Backend returns { success: true, data: {...} }
    return this.request<Partner>(`/partners/${id}`);
  }

  async createPartner(data: {
    name: string;
    website_url?: string | null;
    callback_url: string;
  }): Promise<ApiResponse<Partner>> {
    // Backend returns { success: true, message: "...", data: {...} }
    return this.request<Partner>('/partners', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePartner(id: number, data: {
    name?: string;
    website_url?: string | null;
    callback_url?: string;
  }): Promise<ApiResponse<Partner>> {
    // Backend returns { success: true, message: "...", data: {...} }
    return this.request<Partner>(`/partners/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async togglePartnerActive(id: number): Promise<ApiResponse<Partner>> {
    // Backend returns { success: true, message: "...", data: {...} }
    return this.request<Partner>(`/partners/${id}/toggle-active`, {
      method: 'POST',
    });
  }

  // User management endpoints (Admin only)
  async getUsers(params?: {
    page?: number;
    per_page?: number;
  }): Promise<ApiResponse<PaginatedResponse<User>>> {
    // Backend returns { success: true, data: [...], meta: {...} }
    const searchParams = new URLSearchParams();
    if (params?.page) {
      searchParams.append('page', params.page.toString());
    }
    if (params?.per_page) {
      searchParams.append('per_page', params.per_page.toString());
    }
    
    const queryString = searchParams.toString();
    const response = await this.request<{ data: User[]; meta: { current_page: number; last_page: number; per_page: number; total: number } }>(`/users${queryString ? `?${queryString}` : ''}`);
    
    // Transform to match PaginatedResponse structure
    return {
      success: response.success ?? true,
      data: {
        data: response.data || [],
        meta: response.meta || { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      },
    };
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    // Backend returns { success: true, data: {...} }
    return this.request<User>(`/users/${id}`);
  }

  async createUser(data: {
    name: string;
    phone_number: string;
    email?: string | null;
    password: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    // Backend returns { success: true, message: "...", data: {...} }
    return this.request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: {
    name?: string;
    phone_number?: string;
    email?: string | null;
    password?: string;
    role?: string;
  }): Promise<ApiResponse<User>> {
    // Backend returns { success: true, message: "...", data: {...} }
    return this.request<User>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async toggleUserActive(id: number): Promise<ApiResponse<User>> {
    // Backend returns { success: true, message: "...", data: {...} }
    return this.request<User>(`/users/${id}/toggle-active`, {
      method: 'POST',
    });
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_BASE_URL);
