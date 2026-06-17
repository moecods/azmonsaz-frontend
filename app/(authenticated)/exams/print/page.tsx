"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useExam, useExamWithParticipants } from '@/hooks/useExams';
import ExamPrintView from '@/components/ExamPrintView';
import type { ExamForPrint } from '@/lib/exam-print/types';
import { Container, Box, CircularProgress, Alert } from '@mui/material';

function PrintExamContent() {
  const searchParams = useSearchParams();
  const examIdParam = searchParams.get('exam_id');
  const examId = examIdParam ? parseInt(examIdParam, 10) : null;
  const template = searchParams.get('template') || 'formal_school';

  const { data: examData, isLoading: examLoading, error: examError } = useExam(examId);
  const { data: manageData, isLoading: manageLoading } = useExamWithParticipants(examId);

  const isLoading = examLoading || manageLoading;
  const error = examError;

  if (!examId || Number.isNaN(examId)) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">شناسه آزمون معتبر نیست.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          خطا در بارگذاری آزمون: {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  if (!examData) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">آزمون یافت نشد.</Alert>
      </Container>
    );
  }

  const examForPrint: ExamForPrint = {
    id: examData.id,
    title: examData.title,
    partner_id: examData.partner_id,
    type: examData.type,
    meta: examData.meta as ExamForPrint["meta"],
    print_settings: examData.print_settings as ExamForPrint["print_settings"],
    partner: examData.partner ? { name: examData.partner.name } : undefined,
    exam_questions: (
      (examData as { exam_questions?: ExamForPrint["exam_questions"] }).exam_questions ??
      (examData.questions as ExamForPrint["exam_questions"]) ??
      []
    ),
  };

  const rawParticipants =
    (manageData as { participants?: Array<{ id: number; user?: { name?: string; email?: string; phone_number?: string | null } | null; user_id?: number }> })?.participants ?? [];
  const participants = rawParticipants.map((p) => ({
    id: p.id,
    name: p.user?.name ?? `کاربر ${p.user_id ?? p.id}`,
    phone_number: p.user?.phone_number ?? null,
    email: p.user?.email ?? null,
  }));

  const pageSizeFromUrl = searchParams.get('page_size');
  const orientationFromUrl = searchParams.get('orientation');
  const marginFromUrl = searchParams.get('margin');
  const headerFromUrl = {
    schoolName: searchParams.get('school_name') ?? undefined,
    className: searchParams.get('class') ?? undefined,
    grade: searchParams.get('grade') ?? undefined,
    studentCode: searchParams.get('student_code') ?? undefined,
    courseName: searchParams.get('course') ?? undefined,
    examDate: searchParams.get('exam_date') ?? undefined,
    examTime: searchParams.get('exam_time') ?? undefined,
    teacherName: searchParams.get('teacher_name') ?? undefined,
  };

  const answerKeyFromUrl = searchParams.get('answer_key');
  const printModeFromUrl = searchParams.get('mode');

  return (
    <ExamPrintView
      exam={examForPrint}
      participants={participants}
      template={template}
      pageSizeFromUrl={pageSizeFromUrl}
      orientationFromUrl={orientationFromUrl}
      marginFromUrl={marginFromUrl}
      headerFromUrl={headerFromUrl}
      answerKeyFromUrl={answerKeyFromUrl}
      printModeFromUrl={printModeFromUrl}
    />
  );
}

export default function ExamPrintPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    }>
      <PrintExamContent />
    </Suspense>
  );
}

