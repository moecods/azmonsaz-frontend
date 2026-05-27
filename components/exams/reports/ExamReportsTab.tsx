"use client";

import { Alert, CircularProgress, Stack, Typography } from "@mui/material";
import {
  useExamLiveReport,
  useExamQuestionsReport,
  useExamReportSummary,
} from "@/hooks/useExamReports";
import { ExamReportSummaryBar } from "@/components/exams/reports/ExamReportSummaryBar";
import { ExamLiveMonitor } from "@/components/exams/reports/ExamLiveMonitor";
import { ExamQuestionAnalytics } from "@/components/exams/reports/ExamQuestionAnalytics";
import { SectionCard } from "@/components/exams/participants/participant-ui-shared";

interface ExamReportsTabProps {
  examId: number;
  canGrade?: boolean;
}

export function ExamReportsTab({ examId, canGrade }: ExamReportsTabProps) {
  const summaryQuery = useExamReportSummary(examId);
  const liveQuery = useExamLiveReport(examId, !!summaryQuery.data?.is_live);
  const questionsQuery = useExamQuestionsReport(examId);

  const isLive = summaryQuery.data?.is_live ?? false;
  const isLoading = summaryQuery.isLoading;

  if (isLoading) {
    return (
      <Stack alignItems="center" py={6}>
        <CircularProgress />
      </Stack>
    );
  }

  if (summaryQuery.error) {
    return (
      <Alert severity="error">
        {summaryQuery.error instanceof Error
          ? summaryQuery.error.message
          : "بارگذاری گزارش ناموفق بود."}
      </Alert>
    );
  }

  return (
    <Stack spacing={2.5}>
      <ExamReportSummaryBar summary={summaryQuery.data ?? undefined} />

      {isLive ? (
        <SectionCard title="پایش زنده">
          {liveQuery.isLoading ? (
            <Stack alignItems="center" py={3}>
              <CircularProgress size={28} />
            </Stack>
          ) : liveQuery.error ? (
            <Alert severity="warning">بارگذاری لیست زنده ناموفق بود.</Alert>
          ) : (
            <ExamLiveMonitor
              rows={liveQuery.data?.participants ?? []}
              examId={examId}
              canGrade={canGrade}
            />
          )}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            به‌روزرسانی خودکار هر ۳۰ ثانیه و هنگام ذخیره پاسخ شرکت‌کنندگان.
          </Typography>
        </SectionCard>
      ) : (
        <Alert severity="info" sx={{ py: 0.75 }}>
          آزمون در حال حاضر در بازه «زنده» نیست. خلاصه و تحلیل سوالات بر اساس آخرین داده‌ها
          نمایش داده می‌شود.
        </Alert>
      )}

      <SectionCard title="تحلیل سوالات">
        {questionsQuery.isLoading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress size={28} />
          </Stack>
        ) : (
          <ExamQuestionAnalytics questions={questionsQuery.data?.questions ?? []} />
        )}
      </SectionCard>
    </Stack>
  );
}
