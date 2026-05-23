"use client";

import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/feedback';
import CreateQuestionContent from '@/components/questions/CreateQuestionContent';
import { useExam } from '@/hooks/useExams';
import { Box, Alert } from '@mui/material';

export default function EditExamQuestionPage() {
  const params = useParams();
  const examId = params?.id ? parseInt(params.id as string) : null;
  const examQuestionId = params?.examQuestionId ? parseInt(params.examQuestionId as string) : null;

  const { data: exam, isLoading, error } = useExam(examId);

  if (examId == null || examQuestionId == null) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">شناسه آزمون یا سوال نامعتبر است.</Alert>
      </Box>
    );
  }

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !exam) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">خطا در بارگذاری آزمون.</Alert>
      </Box>
    );
  }

  const examQuestions = (exam as { exam_questions?: Array<{ id: number; payload?: Record<string, unknown> }> }).exam_questions ?? [];
  const examQuestion = examQuestions.find((q: { id: number }) => q.id === examQuestionId);

  if (!examQuestion) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">سوال یافت نشد.</Alert>
      </Box>
    );
  }

  const payload = examQuestion.payload ?? {};

  return (
    <ProtectedRoute requiredPermission="edit exams">
      <CreateQuestionContent
        examId={examId}
        examQuestionId={examQuestionId}
        examQuestionPayload={payload}
      />
    </ProtectedRoute>
  );
}
