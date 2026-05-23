"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services";
import type { ExamResultResponse } from "@/services/exams/ExamService";

export function useMyExamResult(examId: number | null) {
  return useQuery({
    queryKey: ["exam", "my-result", examId],
    queryFn: async () => {
      if (!examId) return null;
      const response = await examService.getMyExamResult(examId);
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch exam result");
      }
      return response.data;
    },
    enabled: !!examId,
  });
}

function useGraderNoteEngagementMutation(examId: number | null) {
  const queryClient = useQueryClient();

  const invalidate = (data: ExamResultResponse | undefined) => {
    if (examId && data) {
      queryClient.setQueryData(["exam", "my-result", examId], data);
    }
    if (examId) {
      void queryClient.invalidateQueries({ queryKey: ["exam", "my-result", examId] });
    }
    void queryClient.invalidateQueries({ queryKey: ["exams", "available"] });
  };

  const markSeen = useMutation({
    mutationFn: async (payload: { scope: "exam" | "question"; exam_question_id?: number }) => {
      if (!examId) throw new Error("Exam id required");
      const response = await examService.markGraderNoteSeen(examId, payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to mark note as seen");
      }
      return response.data;
    },
    onSuccess: (data) => invalidate(data),
  });

  const acknowledge = useMutation({
    mutationFn: async (payload: { scope: "exam" | "question"; exam_question_id?: number }) => {
      if (!examId) throw new Error("Exam id required");
      const response = await examService.acknowledgeGraderNote(examId, payload);
      if (!response.success) {
        throw new Error(response.message || "Failed to acknowledge note");
      }
      return response.data;
    },
    onSuccess: (data) => invalidate(data),
  });

  return { markSeen, acknowledge };
}

export function useGraderNoteEngagement(examId: number | null) {
  return useGraderNoteEngagementMutation(examId);
}

export function useMarkResultViewed(examId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!examId) throw new Error("Exam id required");
      const response = await examService.markResultViewed(examId);
      if (!response.success) {
        throw new Error(response.message || "Failed to mark result as viewed");
      }
      return response.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["exams", "available"] });
      if (examId) {
        void queryClient.invalidateQueries({ queryKey: ["exam", "my-result", examId] });
      }
    },
  });
}

export function useExamAiReview(examId: number | null) {
  return useMutation({
    mutationFn: async (examQuestionId: number) => {
      if (!examId) throw new Error("Exam id required");
      const response = await examService.requestAiReview(examId, examQuestionId);
      if (!response.success) {
        throw new Error(response.message || "AI review failed");
      }
      return response.data as { explanation: string; feedback?: string };
    },
  });
}
