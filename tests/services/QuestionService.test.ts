/**
 * Tests for QuestionService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QuestionService } from '@/services/questions/QuestionService';
import { ApiClient } from '@/services/api/ApiClient';

describe('QuestionService', () => {
  let questionService: QuestionService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
    questionService = new QuestionService(mockApiClient as unknown as ApiClient);
  });

  describe('getQuestions', () => {
    it('should fetch questions with filters', async () => {
      const filters = { page: 1, per_page: 10, category_id: 1 };
      const mockResponse = {
        success: true,
        data: {
          data: [{ id: 1, text: 'Test Question' }],
          meta: { current_page: 1, last_page: 1, total: 1 },
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await questionService.getQuestions(filters);

      expect(mockApiClient.get).toHaveBeenCalledWith('/questions', filters);
      expect(result).toEqual(mockResponse);
    });

    it('should fetch questions without filters', async () => {
      const mockResponse = {
        success: true,
        data: { data: [], meta: { current_page: 1, last_page: 1, total: 0 } },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await questionService.getQuestions();

      expect(mockApiClient.get).toHaveBeenCalledWith('/questions', undefined);
    });
  });

  describe('getQuestion', () => {
    it('should fetch single question by ID', async () => {
      const mockResponse = {
        success: true,
        data: { id: 1, text: 'Test Question' },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await questionService.getQuestion(1);

      expect(mockApiClient.get).toHaveBeenCalledWith('/questions/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('createQuestion', () => {
    it('should create new question', async () => {
      const questionData = {
        text: 'Test Question',
        type: 'multiple_choice',
        category_id: 1,
        options: [
          { text: 'Option 1', is_correct: true },
          { text: 'Option 2', is_correct: false },
        ],
        correct_answer: 0,
        difficulty: 'medium',
        tags: ['test'],
      };

      const mockResponse = {
        success: true,
        data: { id: 1, ...questionData },
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await questionService.createQuestion(questionData);

      expect(mockApiClient.post).toHaveBeenCalledWith('/questions', questionData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateQuestion', () => {
    it('should update question', async () => {
      const updateData = { text: 'Updated Question' };
      const mockResponse = {
        success: true,
        data: { id: 1, ...updateData },
      };

      mockApiClient.put.mockResolvedValue(mockResponse);

      const result = await questionService.updateQuestion(1, updateData);

      expect(mockApiClient.put).toHaveBeenCalledWith('/questions/1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteQuestion', () => {
    it('should delete question', async () => {
      const mockResponse = { success: true, data: undefined };

      mockApiClient.delete.mockResolvedValue(mockResponse);

      const result = await questionService.deleteQuestion(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/questions/1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCategories', () => {
    it('should fetch question categories', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: 1, name: 'Category 1' }],
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await questionService.getCategories();

      expect(mockApiClient.get).toHaveBeenCalledWith('/question-categories');
      expect(result).toEqual(mockResponse);
    });
  });
});

