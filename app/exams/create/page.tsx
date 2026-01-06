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
import { useMutation, useQuery } from '@tanstack/react-query';
import { dataService, isUsingMockData } from '@/lib/data-service';
import { queryKeys } from '@/lib/query-client';
import { deepLinkParamsSchema } from '@/lib/validation';
import { ExamQuestion } from '@/types';
import QuestionSelector from '@/components/QuestionSelector';
import ExamQuestionList from '@/components/ExamQuestionList';


function CreateExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Parse deep link parameters
  const deepLinkParams = {
    partner_id: searchParams.get('partner_id') || (isUsingMockData() ? '1' : ''),
    callback_url: searchParams.get('callback_url') || (isUsingMockData() ? 'https://example.com/callback' : ''),
    exam_id: searchParams.get('exam_id') || undefined,
  };

  // In mock data mode, we don't need to validate deep link parameters
  const validationResult = isUsingMockData() 
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
  const { data: partnerData } = useQuery({
    queryKey: queryKeys.partner(parseInt(deepLinkParams.partner_id)),
    queryFn: () => dataService.getPartner(parseInt(deepLinkParams.partner_id)),
    enabled: !!deepLinkParams.partner_id && validationResult.success,
  });

  // Fetch existing exam if exam_id is provided
  const { data: existingExam } = useQuery({
    queryKey: queryKeys.exam(parseInt(deepLinkParams.exam_id!)),
    queryFn: () => dataService.getExam(parseInt(deepLinkParams.exam_id!)),
    enabled: !!deepLinkParams.exam_id && validationResult.success,
  });

  // Create exam mutation
  const createExamMutation = useMutation({
    mutationFn: (data: ExamFormData) => {
      if (existingExam?.data) {
        return dataService.updateExam(existingExam.data.id, {
          title: data.title,
          description: data.description,
          subject: data.subject,
          questions: examQuestions,
        });
      } else {
        return dataService.createExam({
          title: data.title,
          description: data.description,
          subject: data.subject,
          partner_id: parseInt(deepLinkParams.partner_id),
          callback_url: deepLinkParams.callback_url,
        });
      }
    },
    onSuccess: (response) => {
      // Redirect to callback URL with exam ID
      const examId = response.data.id;
      const callbackUrl = new URL(deepLinkParams.callback_url);
      callbackUrl.searchParams.set('exam_id', examId.toString());
      callbackUrl.searchParams.set('status', 'completed');
      window.location.href = callbackUrl.toString();
    },
    onError: (error) => {
      console.error('Failed to create/update exam:', error);
    },
  });

  // Complete exam mutation
  const completeExamMutation = useMutation({
    mutationFn: (examId: number) => dataService.completeExam(examId),
    onSuccess: (response) => {
      // Redirect to callback URL with PDF download link
      const callbackUrl = new URL(deepLinkParams.callback_url);
      callbackUrl.searchParams.set('exam_id', response.data.callback_url);
      callbackUrl.searchParams.set('pdf_url', response.data.pdf_url);
      callbackUrl.searchParams.set('status', 'completed');
      window.location.href = callbackUrl.toString();
    },
  });

  // Load existing exam data
  useEffect(() => {
    if (existingExam?.data) {
      setValue('title', existingExam.data.title);
      setValue('description', existingExam.data.description || '');
      setValue('subject', existingExam.data.subject || '');
      setExamQuestions(existingExam.data.questions || []);
    }
  }, [existingExam, setValue]);

  const onSubmit = (data: ExamFormData) => {
    setIsLoading(true);
    createExamMutation.mutate(data);
  };

  const handleCompleteExam = () => {
    if (existingExam?.data) {
      completeExamMutation.mutate(existingExam.data.id);
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

  if (!validationResult.success && !isUsingMockData()) {
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
            {existingExam?.data ? 'Edit Exam' : 'Create New Exam'}
          </Typography>
          {isUsingMockData() && (
            <Alert severity="info" sx={{ mb: 2 }}>
              🧪 Using mock data for development. Partner ID: {deepLinkParams.partner_id}
            </Alert>
          )}
          {partnerData?.data && (
            <Typography color="text.secondary">
              Partner: {partnerData.data.name}
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
          {existingExam?.data && (
            <Button
              variant="contained"
              color="success"
              onClick={handleCompleteExam}
              disabled={isLoading || examQuestions.length === 0}
            >
              Complete Exam
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
