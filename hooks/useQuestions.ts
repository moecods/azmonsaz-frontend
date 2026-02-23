/**
 * Custom hook for managing questions
 * Uses React Query for caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService, ApiError } from '@/services';
import { QuestionFilters } from '@/services/questions';
import { Question, CreateQuestionRequest, UpdateQuestionRequest } from '@/types';
import { queryKeys } from '@/lib/query-client';

export function useQuestions(filters?: QuestionFilters) {
  return useQuery({
    queryKey: queryKeys.questions(filters as Record<string, unknown>),
    queryFn: async () => {
      const response = await questionService.getQuestions(filters);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch questions');
      }
      return response.data;
    },
  });
}

export function useQuestion(id: number | null) {
  return useQuery({
    queryKey: queryKeys.question(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await questionService.getQuestion(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch question');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateQuestionRequest) => {
      const response = await questionService.createQuestion(data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to create question',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate questions list (only questions queries)
      queryClient.invalidateQueries({ 
        queryKey: ['questions'],
        exact: false, // Match all queries starting with ['questions']
      });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateQuestionRequest }) => {
      const response = await questionService.updateQuestion(id, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to update question',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Invalidate specific question and questions list (only questions queries)
      queryClient.invalidateQueries({ queryKey: queryKeys.question(variables.id) });
      queryClient.invalidateQueries({ 
        queryKey: ['questions'],
        exact: false, // Match all queries starting with ['questions']
      });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await questionService.deleteQuestion(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete question');
      }
    },
    onSuccess: () => {
      // Invalidate questions list (only questions queries)
      queryClient.invalidateQueries({ 
        queryKey: ['questions'],
        exact: false, // Match all queries starting with ['questions']
      });
    },
  });
}

export function useQuestionCategories(enabled = true) {
  return useQuery({
    queryKey: queryKeys.questionCategories(),
    queryFn: async () => {
      const response = await questionService.getCategories();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch categories');
      }
      return response.data;
    },
    enabled,
  });
}

export function useCreateQuestionCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; description?: string }) => {
      const response = await questionService.createCategory(data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to create category',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionCategories() });
      queryClient.invalidateQueries({ queryKey: ['questions'], exact: false });
    },
  });
}

export function useUpdateQuestionCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; description?: string };
    }) => {
      const response = await questionService.updateCategory(id, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to update category',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionCategories() });
      queryClient.invalidateQueries({ queryKey: ['questions'], exact: false });
    },
  });
}

export function useDeleteQuestionCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await questionService.deleteCategory(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete category');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questionCategories() });
      queryClient.invalidateQueries({ queryKey: ['questions'], exact: false });
    },
  });
}

