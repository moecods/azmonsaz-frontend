"use client";

import 'react-multi-date-picker/styles/layouts/mobile.css';
import 'react-multi-date-picker/styles/colors/purple.css';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Container,
  Stack,
  Typography,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { examSchema, ExamFormData } from '@/lib/validation';
import { usePartner, useExam, useCreateExam, useUpdateExam, useCompleteExam, useAuth } from '@/hooks';
import { isUsingMockData } from '@/lib/data-service';
import { deepLinkParamsSchema } from '@/lib/validation';
import Breadcrumb from '@/components/Breadcrumb';
import { ExamFormWizard } from '@/components/exams/ExamFormWizard';
import { buildExamMeta, loadExamMetaToForm, buildCallbackUrl, isCreatorUser } from '@/lib/exam-utils';
import { handleError } from '@/lib/error-handler';
import { PageLoading } from '@/components/feedback';
import UserLayout from '@/components/layout/UserLayout';
import ProtectedRoute from '@/components/ProtectedRoute';


function CreateExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  // Check if user is creator/admin/content_manager (can create exams without partner)
  const isCreator = useMemo(() => isCreatorUser(user?.roles), [user?.roles]);

  // Parse deep link parameters
  const deepLinkParams = useMemo(() => ({
    partner_id: searchParams.get('partner_id') || (isUsingMockData() ? '1' : ''),
    callback_url: searchParams.get('callback_url') || (isUsingMockData() ? 'https://example.com/callback' : ''),
    exam_id: searchParams.get('exam_id') || undefined,
  }), [searchParams]);

  // For creator users, deep link parameters are optional
  // In mock data mode, we don't need to validate deep link parameters
  const validationResult = useMemo(() => 
    isUsingMockData() || isCreator
      ? { success: true, data: deepLinkParams }
      : deepLinkParamsSchema.safeParse(deepLinkParams),
    [isCreator, deepLinkParams]
  );

  const form = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      type: 'online',
      questions: [],
      duration_minutes: null,
      passing_score: null,
      max_attempts: null,
      instructions: '',
      tags: [],
      exam_date: null,
      start_time: null,
      end_time: null,
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  // Fetch partner information if partner_id is provided
  const { data: partnerData, isLoading: isLoadingPartner } = usePartner(
    validationResult.success && deepLinkParams.partner_id 
      ? parseInt(deepLinkParams.partner_id) 
      : null
  );

  // Fetch existing exam if exam_id is provided
  const { data: existingExam, isLoading: isLoadingExam } = useExam(
    validationResult.success && deepLinkParams.exam_id 
      ? parseInt(deepLinkParams.exam_id) 
      : null
  );

  // Create exam mutation
  const createExamMutation = useCreateExam();
  const updateExamMutation = useUpdateExam();
  const completeExamMutation = useCompleteExam();

  // Load existing exam data
  useEffect(() => {
    if (existingExam) {
      setValue('title', existingExam.title);
      setValue('description', existingExam.description || '');
      setValue('subject', existingExam.subject || '');
      setValue('type', existingExam.type || 'online');
      
      // Load meta fields
      const metaFields = loadExamMetaToForm(existingExam);
      Object.entries(metaFields).forEach(([key, value]) => {
        setValue(key as keyof ExamFormData, value);
      });
    }
  }, [existingExam, setValue]);

  const handleRedirectAfterSave = (examId: number, additionalParams?: Record<string, string>) => {
    if (deepLinkParams.callback_url && validationResult.success) {
      try {
        const callbackUrl = buildCallbackUrl(deepLinkParams.callback_url, examId, additionalParams);
        window.location.href = callbackUrl;
      } catch (error) {
        handleError(error, { context: 'Callback URL', logToConsole: true });
        router.push(`/exams/${examId}`);
      }
    } else {
      router.push(`/exams/${examId}`);
    }
  };

  const onSubmit = (data: ExamFormData, redirectToQuestions: boolean = false) => {
    const meta = buildExamMeta(data);
    
    if (existingExam) {
      updateExamMutation.mutate({
        id: existingExam.id,
        data: {
          title: data.title,
          description: data.description,
          subject: data.subject,
          type: data.type,
          meta,
        },
      }, {
        onSuccess: (response) => {
          if (redirectToQuestions) {
            router.push(`/exams/${response.id}?tab=questions`);
          } else {
            handleRedirectAfterSave(response.id);
          }
        },
        onError: (error) => {
          handleError(error, { context: 'Update Exam' });
        },
      });
    } else {
      const examData = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        type: data.type,
        meta,
        ...(validationResult.success && deepLinkParams.partner_id && {
          partner_id: parseInt(deepLinkParams.partner_id),
        }),
        ...(validationResult.success && deepLinkParams.callback_url && {
          callback_url: deepLinkParams.callback_url,
        }),
      };

      createExamMutation.mutate(examData, {
        onSuccess: (response) => {
          if (redirectToQuestions) {
            router.push(`/exams/${response.id}?tab=questions`);
          } else {
            handleRedirectAfterSave(response.id);
          }
        },
        onError: (error) => {
          handleError(error, { context: 'Create Exam' });
        },
      });
    }
  };

  const handleCompleteExam = () => {
    if (!existingExam) return;
    
    completeExamMutation.mutate(existingExam.id, {
      onSuccess: (response) => {
        handleRedirectAfterSave(existingExam.id, { pdf_url: response.pdf_url });
      },
      onError: (error) => {
        handleError(error, { context: 'Complete Exam' });
      },
    });
  };


  // Show loading state while fetching exam data
  if (isLoadingExam) {
    return (
      <UserLayout>
        <PageLoading message="در حال بارگذاری اطلاعات آزمون..." />
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Breadcrumb items={[
            { label: 'مدیریت آزمون‌ها', href: '/exams' },
            { label: existingExam ? 'ویرایش آزمون' : 'ایجاد آزمون جدید' }
          ]} />
          <Box>
            <Typography variant="h4" gutterBottom>
              {existingExam ? 'ویرایش آزمون' : 'ایجاد آزمون جدید'}
            </Typography>
          {isUsingMockData() && (
            <Alert severity="info" sx={{ mb: 2 }}>
              🧪 Using mock data for development. Partner ID: {deepLinkParams.partner_id}
            </Alert>
          )}
          {partnerData && (
            <Typography color="text.secondary">
              Partner: {partnerData.name}
            </Typography>
          )}
        </Box>

        {(createExamMutation.isError || updateExamMutation.isError || completeExamMutation.isError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {createExamMutation.error instanceof Error && createExamMutation.error.message}
            {updateExamMutation.error instanceof Error && updateExamMutation.error.message}
            {completeExamMutation.error instanceof Error && completeExamMutation.error.message}
            {!createExamMutation.error && !updateExamMutation.error && !completeExamMutation.error && 'خطایی رخ داد. لطفا دوباره تلاش کنید.'}
          </Alert>
        )}

        {existingExam && (
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="success"
              onClick={handleCompleteExam}
              disabled={completeExamMutation.isPending}
            >
              {completeExamMutation.isPending ? 'در حال تکمیل...' : 'تکمیل آزمون'}
            </Button>
          </Stack>
        )}

        <ExamFormWizard
          form={form}
          onSubmit={onSubmit}
          isSubmitting={createExamMutation.isPending || updateExamMutation.isPending}
          existingExam={!!existingExam}
        />
        </Stack>
      </Container>
    </UserLayout>
  );
}

export default function CreateExamPage() {
  return (
    <ProtectedRoute requiredPermission="create exams">
      <Suspense
        fallback={
          <UserLayout>
            <PageLoading />
          </UserLayout>
        }
      >
        <CreateExamContent />
      </Suspense>
    </ProtectedRoute>
  );
}
