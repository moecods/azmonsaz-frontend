"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services";
import { ApiError } from "@/services/api/ApiClient";

export function useStartExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (examId: number) => {
      const response = await examService.startExam(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || "Failed to start exam",
          undefined,
          (response as { errors?: unknown }).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ["exams", "available"] });
      queryClient.invalidateQueries({ queryKey: ["exam", "info", examId] });
      queryClient.invalidateQueries({ queryKey: ["exam", "questions", examId] });
    },
  });
}

export function useExamQuestions(examId: number | null) {
  return useQuery({
    queryKey: ["exam", "questions", examId],
    queryFn: async () => {
      if (!examId) return null;
      const response = await examService.getExamQuestions(examId);
      if (!response.success) {
        throw new ApiError(
          response.message || "Failed to fetch exam questions",
          undefined,
          (response as { errors?: unknown }).errors
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
    mutationFn: async ({
      examId,
      data,
    }: {
      examId: number;
      data: { exam_question_id: number; answer: unknown };
    }) => {
      const response = await examService.saveAnswer(examId, data);
      if (!response.success) {
        throw new ApiError(
          response.message || "Failed to save answer",
          undefined,
          (response as { errors?: unknown }).errors
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
          response.message || "Failed to submit exam",
          undefined,
          (response as { errors?: unknown }).errors
        );
      }
      return response.data;
    },
    onSuccess: (_, examId) => {
      queryClient.invalidateQueries({ queryKey: ["exams", "available"] });
      queryClient.invalidateQueries({ queryKey: ["exam", "info", examId] });
    },
  });
}
