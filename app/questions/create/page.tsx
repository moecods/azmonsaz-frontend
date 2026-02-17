"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import UserLayout from '@/components/layout/UserLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/feedback';
import CreateQuestionContent from '@/components/questions/CreateQuestionContent';

function CreateQuestionPageContent() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam_id');
  const returnUrl = searchParams.get('return_url');

  return (
    <CreateQuestionContent 
      examId={examId ? parseInt(examId) : undefined}
      returnUrl={returnUrl || undefined}
    />
  );
}

export default function CreateQuestionPage() {
  const searchParams = useSearchParams();
  const examId = searchParams.get('exam_id');
  
  // If examId exists, check edit exams permission (for creator to add custom questions to their exam)
  // Otherwise, check manage questions permission (for adding to question bank)
  const requiredPermission = examId ? 'edit exams' : 'manage questions';

  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <Suspense
        fallback={
          <UserLayout>
            <PageLoading />
          </UserLayout>
        }
      >
        <CreateQuestionPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
