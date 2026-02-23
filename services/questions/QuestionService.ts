/**
 * Question Service
 * Handles all question-related API calls
 */

import { ApiClient } from '../api/ApiClient';
import {
  Question,
  QuestionCategory,
  CreateQuestionRequest,
  UpdateQuestionRequest,
  ApiResponse,
  PaginatedResponse,
} from '@/types';

export interface QuestionFilters {
  category_id?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
  type?: 'multiple_choice' | 'true_false' | 'multiple_select' | 'essay';
  tags?: string[];
  sort?: 'newest' | 'oldest';
  page?: number;
  per_page?: number;
}

export class QuestionService {
  constructor(private apiClient: ApiClient) {}

  /**
   * Get questions with filters and pagination
   */
  async getQuestions(
    filters?: QuestionFilters
  ): Promise<ApiResponse<PaginatedResponse<Question>>> {
    return this.apiClient.get<PaginatedResponse<Question>>('/questions', filters);
  }

  /**
   * Get single question by ID
   */
  async getQuestion(id: number): Promise<ApiResponse<Question>> {
    return this.apiClient.get<Question>(`/questions/${id}`);
  }

  /**
   * Create new question
   */
  async createQuestion(
    data: CreateQuestionRequest
  ): Promise<ApiResponse<Question>> {
    return this.apiClient.post<Question>('/questions', data);
  }

  /**
   * Update question
   */
  async updateQuestion(
    id: number,
    data: UpdateQuestionRequest
  ): Promise<ApiResponse<Question>> {
    return this.apiClient.put<Question>(`/questions/${id}`, data);
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: number): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/questions/${id}`);
  }

  /**
   * Get question categories
   */
  async getCategories(): Promise<ApiResponse<QuestionCategory[]>> {
    return this.apiClient.get<QuestionCategory[]>('/question-categories');
  }

  /**
   * Create question category
   */
  async createCategory(data: {
    name: string;
    description?: string;
  }): Promise<ApiResponse<QuestionCategory>> {
    return this.apiClient.post<QuestionCategory>('/question-categories', data);
  }

  /**
   * Update question category
   */
  async updateCategory(
    id: number,
    data: { name?: string; description?: string }
  ): Promise<ApiResponse<QuestionCategory>> {
    return this.apiClient.put<QuestionCategory>(`/question-categories/${id}`, data);
  }

  /**
   * Delete question category
   */
  async deleteCategory(id: number): Promise<ApiResponse<void>> {
    return this.apiClient.delete<void>(`/question-categories/${id}`);
  }
}

