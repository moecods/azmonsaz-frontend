"use client";

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
    }
  }, [existingExam, setValue]);

  const onSubmit = (data: ExamFormData) => {
    setIsLoading(true);
    
    if (existingExam) {
      updateExamMutation.mutate({
        id: existingExam.id,
        data: {
          title: data.title,
          description: data.description,
          subject: data.subject,
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
        <Box>
          <Typography variant="h4" gutterBottom>
            {existingExam ? 'Edit Exam' : 'Create New Exam'}
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
                    label="Exam Title"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />

              <Controller
                name="subject"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Subject"
                    fullWidth
                    error={!!errors.subject}
                    helperText={errors.subject?.message}
                  />
                )}
              />
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
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit(onSubmit)}
            disabled={isLoading || examQuestions.length === 0}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : 'Save Exam'}
          </Button>
          {existingExam && (
            <Button
              variant="contained"
              color="success"
              onClick={handleCompleteExam}
              disabled={isLoading || examQuestions.length === 0 || completeExamMutation.isPending}
            >
              {completeExamMutation.isPending ? 'Completing...' : 'Complete Exam'}
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
