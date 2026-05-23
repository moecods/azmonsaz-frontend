"use client";

import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageLoading } from '@/components/feedback';
import CreateQuestionContent from '@/components/questions/CreateQuestionContent';
import { Box, Alert } from '@mui/material';

export default function EditQuestionPage() {
  const params = useParams();
  const id = params?.id ? parseInt(String(params.id)) : undefined;

  if (!id || isNaN(id)) {
    return (
      <ProtectedRoute requiredPermission="manage questions">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">شناسه سوال نامعتبر است.</Alert>
        </Box>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="manage questions">
      <CreateQuestionContent questionId={id} />
    </ProtectedRoute>
  );
}
