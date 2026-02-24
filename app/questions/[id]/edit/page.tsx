"use client";

import { useParams } from 'next/navigation';
import UserLayout from '@/components/layout/UserLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/feedback';
import CreateQuestionContent from '@/components/questions/CreateQuestionContent';

export default function EditQuestionPage() {
  const params = useParams();
  const id = params?.id ? parseInt(String(params.id)) : undefined;

  if (!id || isNaN(id)) {
    return (
      <ProtectedRoute requiredPermission="manage questions">
        <UserLayout>
          <PageLoading />
        </UserLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="manage questions">
      <CreateQuestionContent questionId={id} />
    </ProtectedRoute>
  );
}
