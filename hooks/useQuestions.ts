/**
 * Custom hook for managing questions
 * Uses React Query for caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService, ApiError } from '@/services';
import { Question, CreateQuestionRequest, UpdateQuestionRequest, QuestionFilters } from '@/types';
import { queryKeys } from '@/lib/query-client';

export function useQuestions(filters?: QuestionFilters) {
  return useQuery({
    queryKey: queryKeys.questions(filters),
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
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: ['questions'] });
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
      // Invalidate specific question and questions list
      queryClient.invalidateQueries({ queryKey: queryKeys.question(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['questions'] });
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
      // Invalidate questions list
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
  });
}

export function useQuestionCategories() {
  return useQuery({
    queryKey: queryKeys.questionCategories(),
    queryFn: async () => {
      const response = await questionService.getCategories();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch categories');
      }
      return response.data;
    },
  });
}

