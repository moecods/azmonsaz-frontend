"use client";

import 'react-multi-date-picker/styles/layouts/mobile.css';
import 'react-multi-date-picker/styles/colors/purple.css';
import { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Autocomplete,
  Divider,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { examSchema, ExamFormData } from '@/lib/validation';
import { usePartner, useExam, useCreateExam, useUpdateExam, useCompleteExam, useAuth } from '@/hooks';
import { isUsingMockData } from '@/lib/data-service';
import { deepLinkParamsSchema } from '@/lib/validation';
import { ExamQuestion } from '@/types';
import QuestionSelector from '@/components/QuestionSelector';
import ExamQuestionList from '@/components/ExamQuestionList';
import Breadcrumb from '@/components/Breadcrumb';
import { PersianDateTimePicker } from '@/components/exams/PersianDateTimePicker';
import { buildExamMeta, loadExamMetaToForm, buildCallbackUrl, isCreatorUser } from '@/lib/exam-utils';


function CreateExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);

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

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      questions: [],
      duration_minutes: null,
      passing_score: null,
      max_attempts: null,
      instructions: '',
      tags: [],
      start_at: null,
      end_at: null,
    },
  });

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
      setExamQuestions(existingExam.questions || []);
      
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
        console.error('Failed to build callback URL:', error);
        router.push(`/exams/${examId}`);
      }
    } else {
      router.push(`/exams/${examId}`);
    }
  };

  const onSubmit = (data: ExamFormData) => {
    if (examQuestions.length === 0) {
      return; // Validation is handled by button disabled state, but double-check
    }

    const meta = buildExamMeta(data);
    
    if (existingExam) {
      updateExamMutation.mutate({
        id: existingExam.id,
        data: {
          title: data.title,
          description: data.description,
          subject: data.subject,
          meta,
        },
      }, {
        onSuccess: (response) => {
          handleRedirectAfterSave(response.id);
        },
        onError: (error) => {
          console.error('Failed to update exam:', error);
        },
      });
    } else {
      const examData = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        type: 'offline' as const,
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
          handleRedirectAfterSave(response.id);
        },
        onError: (error) => {
          console.error('Failed to create exam:', error);
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
        console.error('Failed to complete exam:', error);
      },
    });
  };

  const handleAddQuestion = (question: ExamQuestion) => {
    const newQuestion = {
      ...question,
      order: examQuestions.length,
    };
    setExamQuestions((prev) => [...prev, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    setExamQuestions((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      // Recalculate order for remaining questions
      return updated.map((q, i) => ({ ...q, order: i }));
    });
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: ExamQuestion) => {
    setExamQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updatedQuestion, order: index };
      return updated;
    });
  };

  // Show loading state while fetching exam data
  if (isLoadingExam) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  // Only show error if not creator and validation failed
  if (!validationResult.success && !isUsingMockData() && !isCreator) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          Invalid deep link parameters. Please ensure partner_id and callback_url are provided.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
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
          {isLoadingPartner ? (
            <CircularProgress size={16} sx={{ ml: 1 }} />
          ) : partnerData ? (
            <Typography color="text.secondary">
              Partner: {partnerData.name}
            </Typography>
          ) : null}
        </Box>

        {(createExamMutation.isError || updateExamMutation.isError || completeExamMutation.isError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {createExamMutation.error instanceof Error && createExamMutation.error.message}
            {updateExamMutation.error instanceof Error && updateExamMutation.error.message}
            {completeExamMutation.error instanceof Error && completeExamMutation.error.message}
            {!createExamMutation.error && !updateExamMutation.error && !completeExamMutation.error && 'خطایی رخ داد. لطفا دوباره تلاش کنید.'}
          </Alert>
        )}

        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="عنوان آزمون"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    placeholder="مثال: آزمون ریاضی پایه دهم"
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="توضیحات"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                    placeholder="توضیحات مربوط به آزمون را اینجا وارد کنید..."
                  />
                )}
              />

              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="موضوع"
                    fullWidth
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                    placeholder="مثال: ریاضی، فیزیک، شیمی"
                  />
                )}
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                تنظیمات آزمون
              </Typography>

              <Stack direction="row" spacing={2}>
                <Controller
                  name="duration_minutes"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="مدت زمان (دقیقه)"
                      type="number"
                      fullWidth
                      error={!!errors.duration_minutes}
                      helperText={errors.duration_minutes?.message}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    />
                  )}
                />

                <Controller
                  name="passing_score"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="نمره قبولی (%)"
                      type="number"
                      fullWidth
                      error={!!errors.passing_score}
                      helperText={errors.passing_score?.message}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      inputProps={{ min: 0, max: 100 }}
                    />
                  )}
                />

                <Controller
                  name="max_attempts"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="حداکثر تلاش"
                      type="number"
                      fullWidth
                      error={!!errors.max_attempts}
                      helperText={errors.max_attempts?.message}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                      inputProps={{ min: 1 }}
                    />
                  )}
                />
              </Stack>

              <Controller
                name="instructions"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="دستورالعمل آزمون"
                    fullWidth
                    multiline
                    rows={4}
                    error={!!errors.instructions}
                    helperText={errors.instructions?.message}
                    placeholder="دستورالعمل‌های آزمون را اینجا وارد کنید..."
                    value={field.value ?? ''}
                  />
                )}
              />

              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={field.value || []}
                    onChange={(_, newValue) => field.onChange(newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          key={index}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="تگ‌ها"
                        placeholder="تگ اضافه کنید و Enter بزنید"
                        error={!!errors.tags}
                        helperText={errors.tags?.message}
                      />
                    )}
                  />
                )}
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                زمان‌بندی آزمون (اختیاری)
              </Typography>

              <Stack direction="row" spacing={2}>
                <Controller
                  name="start_at"
                  control={control}
                  render={({ field }) => (
                    <PersianDateTimePicker
                      label="زمان شروع"
                      value={field.value ?? null}
                      onChange={field.onChange}
                      error={!!errors.start_at}
                      errorMessage={errors.start_at?.message}
                    />
                  )}
                />

                <Controller
                  name="end_at"
                  control={control}
                  render={({ field }) => (
                    <PersianDateTimePicker
                      label="زمان پایان"
                      value={field.value ?? null}
                      onChange={field.onChange}
                      error={!!errors.end_at}
                      errorMessage={errors.end_at?.message}
                    />
                  )}
                />
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        <QuestionSelector onAddQuestion={handleAddQuestion} />
        <ExamQuestionList
          questions={examQuestions}
          onRemoveQuestion={handleRemoveQuestion}
          onUpdateQuestion={handleUpdateQuestion}
        />

        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={() => router.back()}
            disabled={createExamMutation.isPending || updateExamMutation.isPending}
          >
            انصراف
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={
              (createExamMutation.isPending || updateExamMutation.isPending) ||
              examQuestions.length === 0
            }
            startIcon={
              (createExamMutation.isPending || updateExamMutation.isPending) ? (
                <CircularProgress size={20} />
              ) : null
            }
          >
            {(createExamMutation.isPending || updateExamMutation.isPending)
              ? 'در حال ذخیره...'
              : existingExam
              ? 'به‌روزرسانی آزمون'
              : 'ذخیره آزمون'}
          </Button>
          {existingExam && (
            <Button
              variant="contained"
              color="success"
              onClick={handleCompleteExam}
              disabled={examQuestions.length === 0 || completeExamMutation.isPending}
              startIcon={completeExamMutation.isPending ? <CircularProgress size={20} /> : null}
            >
              {completeExamMutation.isPending ? 'در حال تکمیل...' : 'تکمیل آزمون'}
            </Button>
          )}
        </Stack>
      </Stack>
    </Container>
  );
}

export default function CreateExamPage() {
  return (
    <Suspense
      fallback={
        <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Container>
      }
    >
      <CreateExamContent />
    </Suspense>
  );
}
