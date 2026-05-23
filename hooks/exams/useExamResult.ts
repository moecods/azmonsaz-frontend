"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { examService } from "@/services";

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
