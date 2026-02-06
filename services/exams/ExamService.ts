/**
 * Exam Service
 * Handles all exam-related API calls
 */

import { ApiClient } from '../api/ApiClient';
import {
  Exam,
  CreateExamRequest,
  UpdateExamRequest,
  ApiResponse,
} from '@/types';

export class ExamService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Create new exam
   */
  async createExam(data: CreateExamRequest): Promise<ApiResponse<Exam>> {
    return this.apiClient.post<Exam>('/exams', data);
  }

  /**
   * Get exam by ID
   */
  async getExam(id: number): Promise<ApiResponse<Exam>> {
    return this.apiClient.get<Exam>(`/exams/${id}`);
  }

  /**
   * Get exam for editing (for creator/admin - no signed URL required)
   */
  async getExamForEdit(id: number): Promise<ApiResponse<Exam>> {
    return this.apiClient.get<Exam>(`/exams/${id}/edit-data`);
  }

  /**
   * Get exam by signed URL (for public access)
   */
  async getExamBySignedUrl(signedUrl: string): Promise<ApiResponse<Exam>> {
    // Use the signed URL directly - it's a full URL with signature
    try {
      const response = await fetch(signedUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
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
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'خطا در اتصال به سرور. لطفاً اتصال اینترنت و تنظیمات CORS را بررسی کنید.'
        );
      }
      throw error;
    }
  }

  /**
   * Update exam
   */
  async updateExam(
    id: number,
    data: UpdateExamRequest
  ): Promise<ApiResponse<Exam>> {
    return this.apiClient.put<Exam>(`/exams/${id}`, data);
  }

  /**
   * Complete exam (mark as completed)
   */
  async completeExam(
    id: number
  ): Promise<ApiResponse<{ callback_url: string; pdf_url: string }>> {
    return this.apiClient.post<{ callback_url: string; pdf_url: string }>(
      `/exams/${id}/complete`
    );
  }

  /**
   * Publish exam (change status to published)
   */
  async publishExam(id: number): Promise<ApiResponse<{ id: number; status: string; is_active: boolean }>> {
    return this.apiClient.post<{ id: number; status: string; is_active: boolean }>(
      `/exams/${id}/publish`
    );
  }

  /**
   * Unpublish exam (change status to draft)
   */
  async unpublishExam(id: number): Promise<ApiResponse<{ id: number; status: string; is_active: boolean }>> {
    return this.apiClient.post<{ id: number; status: string; is_active: boolean }>(
      `/exams/${id}/unpublish`
    );
  }

  /**
   * Activate exam (set is_active to true)
   */
  async activateExam(id: number): Promise<ApiResponse<{ id: number; status: string; is_active: boolean }>> {
    return this.apiClient.post<{ id: number; status: string; is_active: boolean }>(
      `/exams/${id}/activate`
    );
  }

  /**
   * Deactivate exam (set is_active to false)
   */
  async deactivateExam(id: number): Promise<ApiResponse<{ id: number; status: string; is_active: boolean }>> {
    return this.apiClient.post<{ id: number; status: string; is_active: boolean }>(
      `/exams/${id}/deactivate`
    );
  }

  /**
   * Add question to exam
   */
  async addQuestionToExam(
    examId: number,
    data: {
      question_id?: number;
      payload?: Record<string, unknown>;
    }
  ): Promise<ApiResponse<unknown>> {
    return this.apiClient.post(`/exams/${examId}/questions`, data);
  }

  /**
   * Update exam question
   */
  async updateExamQuestion(
    examId: number,
    questionId: number,
    data: { payload: Record<string, unknown> }
  ): Promise<ApiResponse<unknown>> {
    return this.apiClient.patch(
      `/exams/${examId}/questions/${questionId}`,
      data
    );
  }

  /**
   * Delete exam question
   */
  async deleteExamQuestion(
    examId: number,
    questionId: number
  ): Promise<ApiResponse<void>> {
    return this.apiClient.delete(`/exams/${examId}/questions/${questionId}`);
  }

  /**
   * Get list of exams (filtered by user role)
   */
  async getExams(params?: {
    per_page?: number;
    status?: 'published' | 'draft';
    type?: 'online' | 'offline';
    search?: string;
    page?: number;
  }): Promise<ApiResponse<{
    data: ExamListItem[];
    meta: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());

    const url = `/exams${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.apiClient.get(url);
  }

  /**
   * Get exam details with participants (for creator/admin)
   */
  async getExamWithParticipants(id: number): Promise<ApiResponse<ExamWithParticipants>> {
    return this.apiClient.get<ExamWithParticipants>(`/exams/${id}/manage`);
  }

  /**
   * Get available exams for logged-in user (exams they are registered for)
   */
  async getAvailableExams(): Promise<ApiResponse<{ data: AvailableExam[] }>> {
    return this.apiClient.get<{ data: AvailableExam[] }>('/exams/available');
  }

  /**
   * Get exam info by participation link (public access)
   */
  async getExamInfo(id: number): Promise<ApiResponse<ExamInfo>> {
    return this.apiClient.get<ExamInfo>(`/exams/${id}/info`);
  }

  /**
   * Register user for exam
   */
  async registerForExam(id: number): Promise<ApiResponse<ExamRegistration>> {
    return this.apiClient.post<ExamRegistration>(`/exams/${id}/register`);
  }

  /**
   * Start exam (begin taking the exam)
   */
  async startExam(id: number): Promise<ApiResponse<ExamStartResponse>> {
    return this.apiClient.post<ExamStartResponse>(`/exams/${id}/start`);
  }

  /**
   * Save answer during exam
   */
  async saveAnswer(id: number, data: { exam_question_id: number; answer: any }): Promise<ApiResponse<{ saved: boolean }>> {
    return this.apiClient.post<{ saved: boolean }>(`/exams/${id}/save-answer`, data);
  }

  /**
   * Submit exam (complete the exam)
   */
  async submitExam(id: number): Promise<ApiResponse<ExamSubmissionResult>> {
    return this.apiClient.post<ExamSubmissionResult>(`/exams/${id}/submit`);
  }

  /**
   * Get user's exam result with detailed answers and ranking
   */
  async getMyExamResult(id: number): Promise<ApiResponse<ExamResultDetail>> {
    return this.apiClient.get<ExamResultDetail>(`/exams/${id}/my-result`);
  }
}

export interface ExamListItem {
  id: number;
  title: string;
  type: 'online' | 'offline';
  meta?: Record<string, unknown>;
  partner_id: number | null;
  partner?: {
    id: number;
    name: string;
  } | null;
  created_by: number | null;
  creator?: {
    id: number;
    name: string;
  } | null;
  status: 'published' | 'draft';
  is_active: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  questions_count: number;
  participants_count: number;
  completed_participants_count: number;
}

export interface ExamParticipant {
  id: number;
  user_id: number | null;
  user: {
    id: number;
    name: string;
    email: string;
    phone_number: string | null;
  } | null;
  score: number | null;
  total_points: number | null;
  passed: boolean;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface ExamWithParticipants {
  id: number;
  title: string;
  type: 'online' | 'offline';
  meta: Record<string, unknown>;
  partner_id: number | null;
  partner?: {
    id: number;
    name: string;
  } | null;
  created_by: number | null;
  creator?: {
    id: number;
    name: string;
  } | null;
  status: 'published' | 'draft';
  is_active: boolean;
  completed_at: string | null;
  participation_link: string | null;
  questions_count: number;
  participants_count: number;
  participants: ExamParticipant[];
  created_at: string;
  updated_at: string;
}

export interface AvailableExam {
  id: number;
  title: string;
  type: 'online' | 'offline';
  meta: Record<string, unknown>;
  status: 'registered' | 'started' | 'completed';
  registered_at: string;
  started_at: string | null;
  completed_at: string | null;
  exam_start_at?: string | null;
  exam_end_at?: string | null;
  creator?: {
    id: number;
    name: string;
  } | null;
}

export interface ExamInfo {
  id: number;
  title: string;
  type: 'online' | 'offline';
  meta: Record<string, unknown>;
  start_at?: string | null;
  end_at?: string | null;
  questions_count: number;
  creator?: {
    id: number;
    name: string;
  } | null;
  is_registered: boolean;
  registration_status: 'registered' | 'started' | 'completed' | null;
  can_start: boolean;
  time_message?: string | null;
}

export interface ExamRegistration {
  id: number;
  exam_id: number;
  status: 'registered';
  registered_at: string;
}

export interface ExamStartResponse {
  exam: {
    id: number;
    title: string;
    type: 'online' | 'offline';
    meta: Record<string, unknown>;
  };
  questions: Array<{
    id: number;
    payload: Record<string, unknown>;
  }>;
  started_at: string;
  remaining_seconds?: number | null; // Remaining time in seconds (null if no time limit)
  answers?: Record<string, any>; // Saved answers from previous session
}

export interface ExamSubmissionResult {
  score: number;
  total_points: number;
  passed: boolean;
  completed_at: string;
}

export interface ExamResultDetail {
  exam: {
    id: number;
    title: string;
    type: 'online' | 'offline';
    meta: Record<string, unknown>;
  };
  result: {
    score: number;
    total_points: number;
    passed: boolean;
    percentage: number;
    rank: number;
    total_participants: number;
    started_at: string | null;
    completed_at: string | null;
  };
  questions: Array<{
    id: number;
    question_text: string;
    type: string;
    options?: Array<{ text: string; is_correct?: boolean }>;
    correct_answer: number | number[] | string;
    your_answer: number | number[] | string | null;
    is_correct: boolean;
    points_earned: number;
    points_total: number;
  }>;
}

