"use client";

import 'react-multi-date-picker/styles/layouts/mobile.css';
import 'react-multi-date-picker/styles/colors/purple.css';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/locales/persian_fa';
import persianCalendar from 'react-date-object/calendars/persian';
import TimePicker from 'react-multi-date-picker/plugins/time_picker';
import type { Value, DateObject } from 'react-multi-date-picker';


function CreateExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is creator/admin/content_manager (can create exams without partner)
  const isCreator = user?.roles?.some(role => ['admin', 'content_manager', 'creator'].includes(role)) || false;

  // Parse deep link parameters
  const deepLinkParams = {
    partner_id: searchParams.get('partner_id') || (isUsingMockData() ? '1' : ''),
    callback_url: searchParams.get('callback_url') || (isUsingMockData() ? 'https://example.com/callback' : ''),
    exam_id: searchParams.get('exam_id') || undefined,
  };

  // For creator users, deep link parameters are optional
  // In mock data mode, we don't need to validate deep link parameters
  const validationResult = isUsingMockData() || isCreator
    ? { success: true, data: deepLinkParams }
    : deepLinkParamsSchema.safeParse(deepLinkParams);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
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
  const { data: partnerData } = usePartner(
    validationResult.success && deepLinkParams.partner_id 
      ? parseInt(deepLinkParams.partner_id) 
      : null
  );

  // Fetch existing exam if exam_id is provided
  const { data: existingExam } = useExam(
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
      
      // Load meta fields if they exist
      const meta = (existingExam as any).meta || {};
      if (meta.duration_minutes) setValue('duration_minutes', meta.duration_minutes);
      if (meta.passing_score !== undefined) setValue('passing_score', meta.passing_score);
      if (meta.max_attempts) setValue('max_attempts', meta.max_attempts);
      if (meta.instructions) setValue('instructions', meta.instructions);
      if (meta.tags) setValue('tags', meta.tags);
      if (meta.start_at) setValue('start_at', meta.start_at);
      if (meta.end_at) setValue('end_at', meta.end_at);
    }
  }, [existingExam, setValue]);

  const onSubmit = (data: ExamFormData) => {
    setIsLoading(true);
    
    // Build meta object from form data
    const meta: Record<string, any> = {};
    if (data.duration_minutes) meta.duration_minutes = data.duration_minutes;
    if (data.passing_score !== null && data.passing_score !== undefined) meta.passing_score = data.passing_score;
    if (data.max_attempts) meta.max_attempts = data.max_attempts;
    if (data.instructions) meta.instructions = data.instructions;
    if (data.tags && data.tags.length > 0) meta.tags = data.tags;
    if (data.start_at) meta.start_at = data.start_at;
    if (data.end_at) meta.end_at = data.end_at;
    
    if (existingExam) {
      updateExamMutation.mutate({
        id: existingExam.id,
        data: {
          title: data.title,
          description: data.description,
          subject: data.subject,
          meta: Object.keys(meta).length > 0 ? meta : undefined,
        },
      }, {
        onSuccess: (response) => {
          // Redirect to callback URL with exam ID
          const examId = response.id;
          const callbackUrl = new URL(deepLinkParams.callback_url);
          callbackUrl.searchParams.set('exam_id', examId.toString());
          callbackUrl.searchParams.set('status', 'completed');
          window.location.href = callbackUrl.toString();
        },
        onError: (error) => {
          console.error('Failed to update exam:', error);
          setIsLoading(false);
        },
      });
    } else {
      const examData: any = {
        title: data.title,
        description: data.description,
        subject: data.subject,
        type: 'offline', // Default type
        meta: Object.keys(meta).length > 0 ? meta : undefined,
      };

      // Only add partner_id and callback_url if they exist (for partner-based exams)
      if (deepLinkParams.partner_id && validationResult.success) {
        examData.partner_id = parseInt(deepLinkParams.partner_id);
      }
      if (deepLinkParams.callback_url && validationResult.success) {
        examData.callback_url = deepLinkParams.callback_url;
      }

      createExamMutation.mutate(examData, {
        onSuccess: (response) => {
          // If callback_url exists, redirect to it
          if (deepLinkParams.callback_url && validationResult.success) {
            const examId = response.id;
            const callbackUrl = new URL(deepLinkParams.callback_url);
            callbackUrl.searchParams.set('exam_id', examId.toString());
            callbackUrl.searchParams.set('status', 'completed');
            window.location.href = callbackUrl.toString();
          } else {
            // For creator users, redirect to exam edit page
            router.push(`/exams/edit?exam_id=${response.id}`);
          }
        },
        onError: (error) => {
          console.error('Failed to create exam:', error);
          setIsLoading(false);
        },
      });
    }
  };

  const handleCompleteExam = () => {
    if (existingExam) {
      completeExamMutation.mutate(existingExam.id, {
        onSuccess: (response) => {
          // Redirect to callback URL with PDF download link
          const callbackUrl = new URL(deepLinkParams.callback_url);
          callbackUrl.searchParams.set('exam_id', response.callback_url);
          callbackUrl.searchParams.set('pdf_url', response.pdf_url);
          callbackUrl.searchParams.set('status', 'completed');
          window.location.href = callbackUrl.toString();
        },
      });
    }
  };

  const handleAddQuestion = (question: ExamQuestion) => {
    const newQuestion = {
      ...question,
      order: examQuestions.length,
    };
    setExamQuestions([...examQuestions, newQuestion]);
  };

  const handleRemoveQuestion = (index: number) => {
    const updatedQuestions = examQuestions.filter((_, i) => i !== index);
    setExamQuestions(updatedQuestions);
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: ExamQuestion) => {
    const updatedQuestions = [...examQuestions];
    updatedQuestions[index] = updatedQuestion;
    setExamQuestions(updatedQuestions);
  };

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
          {partnerData && (
            <Typography color="text.secondary">
              Partner: {partnerData.name}
            </Typography>
          )}
        </Box>

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
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" sx={{ mb: 1, color: errors.start_at ? 'error.main' : 'text.secondary' }}>
                        زمان شروع
                      </Typography>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date: Value) => {
                          if (date) {
                            const dateObj = date as DateObject;
                            const jsDate = dateObj.toDate();
                            field.onChange(jsDate.toISOString());
                          } else {
                            field.onChange(null);
                          }
                        }}
                        locale={persian}
                        calendar={persianCalendar}
                        format="YYYY/MM/DD HH:mm"
                        plugins={[<TimePicker position="bottom" key="time-picker" />]}
                        containerStyle={{ width: '100%' }}
                        inputClass="form-control"
                        style={{
                          width: '100%',
                          padding: '16.5px 14px',
                          border: errors.start_at ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
                          borderRadius: '4px',
                          fontSize: '1rem',
                        }}
                      />
                      {errors.start_at && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {errors.start_at.message}
                        </Typography>
                      )}
                    </Box>
                  )}
                />

                <Controller
                  name="end_at"
                  control={control}
                  render={({ field }) => (
                    <Box sx={{ width: '100%' }}>
                      <Typography variant="body2" sx={{ mb: 1, color: errors.end_at ? 'error.main' : 'text.secondary' }}>
                        زمان پایان
                      </Typography>
                      <DatePicker
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date: Value) => {
                          if (date) {
                            const dateObj = date as DateObject;
                            const jsDate = dateObj.toDate();
                            field.onChange(jsDate.toISOString());
                          } else {
                            field.onChange(null);
                          }
                        }}
                        locale={persian}
                        calendar={persianCalendar}
                        format="YYYY/MM/DD HH:mm"
                        plugins={[<TimePicker position="bottom" key="time-picker" />]}
                        containerStyle={{ width: '100%' }}
                        inputClass="form-control"
                        style={{
                          width: '100%',
                          padding: '16.5px 14px',
                          border: errors.end_at ? '1px solid #d32f2f' : '1px solid rgba(0, 0, 0, 0.23)',
                          borderRadius: '4px',
                          fontSize: '1rem',
                        }}
                      />
                      {errors.end_at && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                          {errors.end_at.message}
                        </Typography>
                      )}
                    </Box>
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
            disabled={isLoading}
          >
            انصراف
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || examQuestions.length === 0}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'در حال ذخیره...' : existingExam ? 'به‌روزرسانی آزمون' : 'ذخیره آزمون'}
          </Button>
          {existingExam && (
            <Button
              variant="contained"
              color="success"
              onClick={handleCompleteExam}
              disabled={isLoading || examQuestions.length === 0 || completeExamMutation.isPending}
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
    <Suspense fallback={<div>Loading...</div>}>
      <CreateExamContent />
    </Suspense>
  );
}
