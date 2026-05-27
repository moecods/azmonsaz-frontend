"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@/services";
import { ExamReportService } from "@/services/exams/ExamReportService";

const reportService = new ExamReportService(getApiClient());

const LIVE_POLL_MS = 30_000;

export function useExamReportSummary(examId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["exam", examId, "reports", "summary"],
    queryFn: async () => {
      if (!examId) return null;
      const res = await reportService.getSummary(examId);
      if (!res.success) throw new Error(res.message || "بارگذاری خلاصه گزارش ناموفق بود");
      return res.data;
    },
    enabled: !!examId && enabled,
    refetchInterval: (query) =>
      query.state.data?.is_live ? LIVE_POLL_MS : false,
  });
}

export function useExamLiveReport(examId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["exam", examId, "reports", "live"],
    queryFn: async () => {
      if (!examId) return null;
      const res = await reportService.getLive(examId);
      if (!res.success) throw new Error(res.message || "بارگذاری گزارش زنده ناموفق بود");
      return res.data;
    },
    enabled: !!examId && enabled,
    refetchInterval: LIVE_POLL_MS,
  });
}

export function useExamQuestionsReport(examId: number | null, enabled = true) {
  return useQuery({
    queryKey: ["exam", examId, "reports", "questions"],
    queryFn: async () => {
      if (!examId) return null;
      const res = await reportService.getQuestions(examId);
      if (!res.success) throw new Error(res.message || "بارگذاری تحلیل سوالات ناموفق بود");
      return res.data;
    },
    enabled: !!examId && enabled,
  });
}
