"use client";

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useExamBySignedUrl } from '@/hooks/useExams';
import ExamPrintView from '@/components/ExamPrintView';
import { Container, Box, CircularProgress, Alert } from '@mui/material';

function PrintExamContent() {
  const searchParams = useSearchParams();
  const showUrl = searchParams.get('show_url');
  const template = searchParams.get('template') || 'default';

  const { data: examData, isLoading, error } = useExamBySignedUrl(showUrl);

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

  return <ExamPrintView exam={examData} template={template} />;
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

