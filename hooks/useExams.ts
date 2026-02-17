/**
 * Custom hook for managing exams
 * Uses React Query for caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { examService, ApiError } from '@/services';
import { Exam, CreateExamRequest, UpdateExamRequest } from '@/types';
import { queryKeys } from '@/lib/query-client';
import type { 
  AvailableExam, 
  ExamInfo, 
  ExamStartResponse, 
  ExamQuestionsResponse,
  ExamSubmissionResult, 
  ExamResultDetail,
  SearchUsersParams,
  SearchUsersResponse,
  AddParticipantsByPhoneRequest,
  AddParticipantsByNationalIdRequest,
  AddSelectedParticipantsRequest,
  AddParticipantsResponse,
  AddGroupsToExamRequest,
  AddGroupsToExamResponse,
} from '@/services/exams/ExamService';

export function useExam(id: number | null) {
  return useQuery({
    queryKey: queryKeys.exam(id!),
    queryFn: async () => {
      if (!id) return null;
      const response = await examService.getExamForEdit(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch exam');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateExamRequest) => {
      const response = await examService.createExam(data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to create exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate exams list and add new exam to cache
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.setQueryData(queryKeys.exam(data.id), data);
    },
  });
}

export function useUpdateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateExamRequest }) => {
      const response = await examService.updateExam(id, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to update exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Update exam in cache
      queryClient.setQueryData(queryKeys.exam(variables.id), data);
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
}

export function useCompleteExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await examService.completeExam(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to complete exam');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      // Invalidate exam to refetch with updated status
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(id) });
    },
  });
}

export function useAddQuestionToExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      examId,
      data,
    }: {
      examId: number;
      data: { question_id?: number; payload?: Record<string, unknown> };
    }) => {
      const response = await examService.addQuestionToExam(examId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to add question to exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate exam to refetch with new question
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(variables.examId) });
    },
  });
}

export function useUpdateExamQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      examId,
      questionId,
      data,
    }: {
      examId: number;
      questionId: number;
      data: { payload: Record<string, unknown> };
    }) => {
      const response = await examService.updateExamQuestion(examId, questionId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to update exam question',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate exam to refetch with updated question
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(variables.examId) });
    },
  });
}

export function useDeleteExamQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, questionId }: { examId: number; questionId: number }) => {
      const response = await examService.deleteExamQuestion(examId, questionId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete exam question');
      }
    },
    onSuccess: (_, variables) => {
      // Invalidate exam to refetch without deleted question
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(variables.examId) });
    },
  });
}

export function useExams(params?: {
  per_page?: number;
  status?: 'published' | 'draft';
  type?: 'online' | 'offline';
  search?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ['exams', 'list', params],
    queryFn: async () => {
      const response = await examService.getExams(params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch exams');
      }
      return response.data;
    },
  });
}

export function useExamWithParticipants(id: number | null) {
  return useQuery({
    queryKey: ['exam', 'manage', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await examService.getExamWithParticipants(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch exam with participants');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useAvailableExams() {
  return useQuery({
    queryKey: ['exams', 'available'],
    queryFn: async () => {
      const response = await examService.getAvailableExams();
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch available exams');
      }
      return response.data;
    },
  });
}

export function usePublishExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => {
      const response = await examService.publishExam(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to publish exam',
          response as any
        );
      }
      return response.data;
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams() });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(examId) });
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
    },
  });
}

export function useUnpublishExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => {
      const response = await examService.unpublishExam(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to unpublish exam',
          response as any
        );
      }
      return response.data;
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams() });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(examId) });
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
    },
  });
}

export function useActivateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => {
      const response = await examService.activateExam(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to activate exam',
          response as any
        );
      }
      return response.data;
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams() });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(examId) });
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
    },
  });
}

export function useDeactivateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => {
      const response = await examService.deactivateExam(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to deactivate exam',
          response as any
        );
      }
      return response.data;
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.exams() });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(examId) });
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
    },
  });
}

export function useExamInfo(id: number | null) {
  return useQuery({
    queryKey: ['exam', 'info', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await examService.getExamInfo(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch exam info');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useRegisterForExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => {
      const response = await examService.registerForExam(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to register for exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['exam', 'info'] });
    },
  });
}

export function useRegisterForExamPublic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, data }: { examId: number; data: { phone_number: string; national_id?: string; name?: string } }) => {
      const response = await examService.registerForExamPublic(examId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to register for exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['exam', 'info'] });
    },
  });
}

export function useStartExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => {
      const response = await examService.startExam(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to start exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['exam', 'info', examId] });
      // Invalidate questions query so it will refetch after exam starts
      queryClient.invalidateQueries({ queryKey: ['exam', 'questions', examId] });
    },
  });
}

export function useExamQuestions(examId: number | null) {
  return useQuery({
    queryKey: ['exam', 'questions', examId],
    queryFn: async () => {
      if (!examId) return null;
      const response = await examService.getExamQuestions(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to fetch exam questions',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    enabled: !!examId,
    refetchOnWindowFocus: false,
    retry: false,
  });
}

export function useSaveAnswer() {
  return useMutation({
    mutationFn: async ({ examId, data }: { examId: number; data: { exam_question_id: number; answer: any } }) => {
      const response = await examService.saveAnswer(examId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to save answer',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
  });
}

export function useSubmitExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => {
      const response = await examService.submitExam(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to submit exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
      queryClient.invalidateQueries({ queryKey: ['exam', 'info', examId] });
    },
  });
}

export function useMyExamResult(id: number | null) {
  return useQuery({
    queryKey: ['exam', 'my-result', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await examService.getMyExamResult(id);
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch exam result');
      }
      return response.data;
    },
    enabled: !!id,
  });
}

export function useSearchUsers(examId: number | null, params: SearchUsersParams, enabled: boolean = true) {
  return useQuery({
    queryKey: ['exam', examId, 'search-users', params],
    queryFn: async () => {
      if (!examId) return null;
      const response = await examService.searchUsers(examId, params);
      if (!response.success) {
        throw new Error(response.message || 'Failed to search users');
      }
      return response.data;
    },
    enabled: !!examId && enabled && !!params.query && params.query.length >= 3,
  });
}

export function useAddParticipantsByPhone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, data }: { examId: number; data: AddParticipantsByPhoneRequest }) => {
      const response = await examService.addParticipantsByPhone(examId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to add participants',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', variables.examId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(variables.examId) });
    },
  });
}

export function useAddParticipantsByNationalId() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, data }: { examId: number; data: AddParticipantsByNationalIdRequest }) => {
      const response = await examService.addParticipantsByNationalId(examId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to add participants',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', variables.examId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(variables.examId) });
    },
  });
}

export function useAddSelectedParticipants() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, data }: { examId: number; data: AddSelectedParticipantsRequest }) => {
      const response = await examService.addSelectedParticipants(examId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to add participants',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', variables.examId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(variables.examId) });
    },
  });
}

export function useAddGroupsToExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, data }: { examId: number; data: AddGroupsToExamRequest }) => {
      const response = await examService.addGroupsToExam(examId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to add groups to exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', variables.examId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(variables.examId) });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
  });
}

export function useRemoveGroupFromExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ examId, groupId }: { examId: number; groupId: number }) => {
      const response = await examService.removeGroupFromExam(examId, groupId);
      if (!response.success) {
        throw new ApiError(
          response.message || 'Failed to remove group from exam',
          undefined,
          (response as any).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', variables.examId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.exam(variables.examId) });
    },
  });
}
