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
}

