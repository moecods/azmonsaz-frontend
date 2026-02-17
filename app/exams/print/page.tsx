"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useExam } from '@/hooks/useExams';
import ExamPrintView from '@/components/ExamPrintView';
import { Container, Box, CircularProgress, Alert } from '@mui/material';

function PrintExamContent() {
  const searchParams = useSearchParams();
  const examIdParam = searchParams.get('exam_id');
  const examId = examIdParam ? parseInt(examIdParam, 10) : null;
  const template = searchParams.get('template') || 'default';

  const { data: examData, isLoading, error } = useExam(examId);

  if (!examId || Number.isNaN(examId)) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">شناسه آزمون معتبر نیست.</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          خطا در بارگذاری آزمون: {(error as Error).message}
        </Alert>
      </Container>
    );
  }

  if (!examData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">آزمون یافت نشد.</Alert>
      </Container>
    );
  }

  const examForPrint = {
    ...examData,
    exam_questions: (examData as { exam_questions?: unknown }).exam_questions ?? (examData as { questions?: unknown }).questions ?? [],
  };

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

  return (
    <ExamPrintView
      exam={examForPrint}
      template={template}
      pageSizeFromUrl={pageSizeFromUrl}
      orientationFromUrl={orientationFromUrl}
      marginFromUrl={marginFromUrl}
      headerFromUrl={headerFromUrl}
    />
  );
}

export default function ExamPrintPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    }>
      <PrintExamContent />
    </Suspense>
  );
}

