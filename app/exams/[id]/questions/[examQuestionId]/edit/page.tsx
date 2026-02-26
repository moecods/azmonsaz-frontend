"use client";

import { useParams } from 'next/navigation';
import UserLayout from '@/components/layout/UserLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/feedback';
import CreateQuestionContent from '@/components/questions/CreateQuestionContent';
import { useExam } from '@/hooks/useExams';

export default function EditExamQuestionPage() {
  const params = useParams();
  const examId = params?.id ? parseInt(params.id as string) : null;
  const examQuestionId = params?.examQuestionId ? parseInt(params.examQuestionId as string) : null;

  const { data: exam, isLoading, error } = useExam(examId);

  if (examId == null || examQuestionId == null) {
    return (
      <UserLayout>
        <div style={{ padding: 24 }}>شناسه آزمون یا سوال نامعتبر است.</div>
      </UserLayout>
    );
  }

  if (isLoading) {
    return (
      <UserLayout>
        <PageLoading />
      </UserLayout>
    );
  }

  if (error || !exam) {
    return (
      <UserLayout>
        <div style={{ padding: 24 }}>خطا در بارگذاری آزمون.</div>
      </UserLayout>
    );
  }

  const examQuestions = (exam as { exam_questions?: Array<{ id: number; payload?: Record<string, unknown> }> }).exam_questions ?? [];
  const examQuestion = examQuestions.find((q: { id: number }) => q.id === examQuestionId);

  if (!examQuestion) {
    return (
      <UserLayout>
        <div style={{ padding: 24 }}>سوال یافت نشد.</div>
      </UserLayout>
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
