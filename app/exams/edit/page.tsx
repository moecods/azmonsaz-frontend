"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useExamBySignedUrl, useAddQuestionToExam, useUpdateExamQuestion, useDeleteExamQuestion } from '@/hooks/useExams';
import QuestionSelector from '@/components/QuestionSelector';
import ExamQuestionList from '@/components/ExamQuestionList';
import { ExamQuestion } from '@/types';
import { ApiError } from '@/services';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PrintIcon from '@mui/icons-material/Print';
import LinkIcon from '@mui/icons-material/Link';

interface ExamData {
  id: number;
  title: string;
  partner_id: number;
  type: 'offline' | 'online';
  meta: {
    duration_minutes?: number;
    passing_score?: number;
    instructions?: string;
  };
  completed_at: string | null;
  exam_questions: Array<{
    id: number;
    question_id: number | null;
    payload: any;
    created_at: string;
    updated_at: string;
  }>;
}

function EditExamContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const showUrl = searchParams.get('show_url');
  const completeUrlParam = searchParams.get('complete_url');
  const examId = searchParams.get('exam_id');
  const isCompleted = searchParams.get('completed') === '1';
  const [examQuestions, setExamQuestions] = useState<ExamQuestion[]>([]);
  const [completeUrl, setCompleteUrl] = useState<string | null>(completeUrlParam);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [participationUrl, setParticipationUrl] = useState<string | null>(null);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);

  // Fetch exam data using signed URL
  const { data: examData, isLoading, error, refetch } = useExamBySignedUrl(showUrl);
  const exam = examData as ExamData | undefined;

  // Convert exam_questions to ExamQuestion format
  useEffect(() => {
    if (exam?.exam_questions) {
      const questions: ExamQuestion[] = exam.exam_questions.map((eq, index) => ({
        id: eq.id,
        exam_id: exam.id,
        question_id: eq.question_id || undefined,
        order: index + 1,
        custom_text: eq.payload?.question_text,
        custom_options: eq.payload?.options?.map((opt: any, idx: number) => ({
          id: idx + 1,
          text: typeof opt === 'string' ? opt : (opt.text || opt),
          is_correct: typeof opt === 'object' ? (opt.is_correct || false) : false,
        })),
        custom_correct_answer: eq.payload?.correct_answer,
        created_at: eq.created_at,
        updated_at: eq.updated_at,
      }));
      setExamQuestions(questions);
    }
  }, [exam]);

  // Add question from bank or create custom
  const addQuestionMutation = useAddQuestionToExam();

  // Update question
  const updateQuestionMutation = useUpdateExamQuestion();

  // Delete question
  const deleteQuestionMutation = useDeleteExamQuestion();

  // Complete exam
  const completeExamMutation = useMutation({
    mutationFn: async () => {
      if (!completeUrlParam) return;
      
      const response = await fetch(completeUrlParam, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to complete exam');
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.data) {
        setCompleteUrl(data.data.edit_link);
        setDownloadUrl(data.data.download_link);
        setParticipationUrl(data.data.participation_link);
        setCallbackUrl(data.data.callback_url);
        
        // Redirect to callback URL if provided
        if (data.data.callback_url) {
          window.location.href = data.data.callback_url;
        }
      }
    },
  });

  const handleAddQuestion = (question: ExamQuestion) => {
    if (!exam) return;
    
    if (question.question_id) {
      // Question from bank - just pass question_id and optional payload overrides
      const payload: any = {
        order: examQuestions.length + 1,
        points: 10,
      };
      addQuestionMutation.mutate({ 
        examId: exam.id, 
        data: { question_id: question.question_id, payload } 
      });
    } else {
      // Custom question - must provide full payload
      const payload: any = {
        question_text: question.custom_text || '',
        type: question.question?.type || 'multiple_choice',
        order: examQuestions.length + 1,
        points: 10,
      };

      if (question.custom_options && question.custom_options.length > 0) {
        payload.options = question.custom_options.map(opt => 
          typeof opt === 'string' ? opt : opt.text
        );
      }

      if (question.custom_correct_answer !== undefined) {
        payload.correct_answer = question.custom_correct_answer;
      }

      addQuestionMutation.mutate({ 
        examId: exam.id, 
        data: { payload } 
      });
    }
  };

  const handleUpdateQuestion = (index: number, updatedQuestion: ExamQuestion) => {
    const examQuestion = examQuestions[index];
    if (!examQuestion || !exam) return;

    const payload: any = {
      ...examQuestion,
      question_text: updatedQuestion.custom_text || examQuestion.question?.text,
      options: updatedQuestion.custom_options || examQuestion.question?.options,
      order: index + 1,
    };

    updateQuestionMutation.mutate({
      examId: exam.id,
      questionId: examQuestion.id,
      data: { payload },
    });
  };

  const handleRemoveQuestion = (index: number) => {
    const examQuestion = examQuestions[index];
    if (examQuestion && exam) {
      deleteQuestionMutation.mutate({ 
        examId: exam.id, 
        questionId: examQuestion.id 
      });
    }
  };

  const handleComplete = () => {
    if (examQuestions.length === 0) {
      alert('لطفاً حداقل یک سوال به آزمون اضافه کنید');
      return;
    }
    completeExamMutation.mutate();
  };

  if (!showUrl && !isCompleted) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">لینک معتبر نیست. لطفاً از لینک ارائه شده توسط سیستم استفاده کنید.</Alert>
      </Container>
    );
  }

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

  if (!exam) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">آزمون یافت نشد.</Alert>
      </Container>
    );
  }

  if (exam.completed_at) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Stack spacing={3} alignItems="center">
              <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
              <Typography variant="h4">آزمون تکمیل شده است</Typography>
              <Typography variant="body1" color="text.secondary">
                این آزمون قبلاً تکمیل شده و قابل ویرایش نیست.
              </Typography>
              {exam.type === 'offline' && downloadUrl && (
                <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={() => window.open(downloadUrl, '_blank')}
                    sx={{ mb: 2 }}
                  >
                    مشاهده و چاپ آزمون
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    برای تغییر قالب، می‌توانید پارامتر template را به URL اضافه کنید:
                    <br />
                    ?template=college, persian_college, modern, classic
                  </Typography>
                </Stack>
              )}
              {exam.type === 'online' && participationUrl && (
                <Button
                  variant="contained"
                  startIcon={<LinkIcon />}
                  onClick={() => window.open(participationUrl, '_blank')}
                >
                  مشاهده لینک شرکت در آزمون
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Exam Header */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">{exam.title}</Typography>
                <Chip 
                  label={exam.type === 'offline' ? 'آفلاین' : 'آنلاین'} 
                  color={exam.type === 'offline' ? 'primary' : 'secondary'}
                />
              </Box>
              
              {exam.meta.duration_minutes && (
                <Typography variant="body2" color="text.secondary">
                  ⏱ زمان: {exam.meta.duration_minutes} دقیقه
                </Typography>
              )}
              
              {exam.meta.passing_score && (
                <Typography variant="body2" color="text.secondary">
                  ✓ نمره قبولی: {exam.meta.passing_score}%
                </Typography>
              )}

              {exam.meta.instructions && (
                <Alert severity="info">
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    دستورالعمل:
                  </Typography>
                  <Typography variant="body2">{exam.meta.instructions}</Typography>
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Questions Section */}
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">سوالات آزمون ({examQuestions.length})</Typography>
                <QuestionSelector onAddQuestion={handleAddQuestion} />
              </Box>

              {examQuestions.length === 0 ? (
                <Alert severity="info">
                  هنوز سوالی به آزمون اضافه نشده است. از دکمه بالا برای افزودن سوال استفاده کنید.
                </Alert>
              ) : (
                <ExamQuestionList
                  questions={examQuestions}
                  onRemoveQuestion={handleRemoveQuestion}
                  onUpdateQuestion={handleUpdateQuestion}
                />
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* Complete Button */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            startIcon={<CheckCircleIcon />}
            onClick={handleComplete}
            disabled={completeExamMutation.isPending || examQuestions.length === 0}
          >
            {completeExamMutation.isPending ? 'در حال تکمیل...' : 'تکمیل آزمون'}
          </Button>
        </Box>

        {completeExamMutation.isError && (
          <Alert severity="error">
            خطا در تکمیل آزمون: {(completeExamMutation.error as Error).message}
          </Alert>
        )}
      </Stack>
    </Container>
  );
}

export default function EditExamPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    }>
      <EditExamContent />
    </Suspense>
  );
}

