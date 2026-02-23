"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
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
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
} from '@mui/material';
import { useStartExam, useSaveAnswer, useSubmitExam, useExamInfo } from '@/hooks/useExams';
import ProtectedRoute from '@/components/ProtectedRoute';
import { QuestionAnswerInput } from '@/components/questions/QuestionAnswerInput';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface Question {
  id: number;
  payload: {
    question_text: string;
    type: string;
    options?: string[]; // Options are now string array, not object array
    correct_answer?: number | number[];
    order: number;
    points?: number;
  };
}

export default function TakeExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [examStarted, setExamStarted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'warning' | 'info' }>({
    open: false,
    message: '',
    severity: 'error',
  });
  const hasStartedRef = useRef(false);

  const startExamMutation = useStartExam();
  const saveAnswerMutation = useSaveAnswer();
  const submitExamMutation = useSubmitExam();
  const { data: examInfo } = useExamInfo(examId);
  
  // Get participant status
  const participantStatus = examInfo?.registration_status;

  // Check exam time status (must be defined before shouldFetchQuestions)
  const getExamTimeStatus = useCallback(() => {
    if (!examInfo?.meta || typeof examInfo.meta !== 'object') {
      return { hasTimeRestriction: false, isBeforeStart: false, isAfterEnd: false, startAt: null, endAt: null };
    }
    const meta = examInfo.meta;
    let startAt: Date | null = null;
    let endAt: Date | null = null;
    const examDate = meta.date && typeof meta.date === 'string' ? meta.date : null;
    const startTime = meta.start_time && typeof meta.start_time === 'string' ? meta.start_time : null;
    const endTime = meta.end_time && typeof meta.end_time === 'string' ? meta.end_time : null;
    if (examDate && startTime) {
      try { startAt = new Date(`${examDate}T${startTime}:00`); } catch { /* invalid */ }
    }
    if (examDate && endTime) {
      try { endAt = new Date(`${examDate}T${endTime}:00`); } catch { /* invalid */ }
    }
    if (!startAt && meta.start_at && typeof meta.start_at === 'string') {
      try { startAt = new Date(meta.start_at); } catch { /* invalid */ }
    }
    if (!endAt && meta.end_at && typeof meta.end_at === 'string') {
      try { endAt = new Date(meta.end_at); } catch { /* invalid */ }
    }
    const hasTimeRestriction = startAt !== null || endAt !== null;
    const now = new Date();
    const isBeforeStart = startAt ? now < startAt : false;
    const isAfterEnd = endAt ? now > endAt : false;
    return { hasTimeRestriction, isBeforeStart, isAfterEnd, startAt, endAt };
  }, [examInfo?.meta]);
  const timeStatus = getExamTimeStatus();
  const canAccessQuestions = !timeStatus.hasTimeRestriction || !timeStatus.isBeforeStart;

  // Helper to map API questions to our format
  const mapApiQuestionsToState = useCallback((apiQuestions: Array<{ id: number; payload: Record<string, unknown> }>): Question[] => {
    const mapped = apiQuestions.map((q, index) => {
      const payload = (q.payload || {}) as Question['payload'];
      if (!payload.order) payload.order = index + 1;
      return { id: q.id, payload };
    });
    mapped.sort((a, b) => (a.payload?.order ?? a.id ?? 0) - (b.payload?.order ?? b.id ?? 0));
    mapped.forEach((q, i) => { if (q.payload) q.payload.order = i + 1; });
    return mapped;
  }, []);

  const applyStartExamResponse = useCallback((data: { questions?: Array<{ id: number; payload: Record<string, unknown> }>; remaining_seconds?: number | null; answers?: Record<number, unknown> }) => {
    if (data.questions && data.questions.length > 0) {
      setQuestions(mapApiQuestionsToState(data.questions));
    }
    if (data.answers && typeof data.answers === 'object') {
      setAnswers(data.answers as Record<number, unknown>);
    }
    if (data.remaining_seconds != null && typeof data.remaining_seconds === 'number') {
      setTimeRemaining(data.remaining_seconds);
    } else if (examInfo?.meta && typeof examInfo.meta === 'object' && 'duration_minutes' in examInfo.meta) {
      const dm = (examInfo.meta as { duration_minutes?: number }).duration_minutes;
      if (typeof dm === 'number') setTimeRemaining(dm * 60);
    }
    setExamStarted(true);
  }, [mapApiQuestionsToState, examInfo?.meta]);

  const handleStartExam = useCallback(async () => {
    if (!examId) {
      return;
    }
    
    if (examStarted) {
      return;
    }
    
    if (startExamMutation.isPending) {
      return;
    }
    
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;

    try {
      // Call startExam API - returns questions, answers, remaining_seconds in one response
      const data = await startExamMutation.mutateAsync(examId);
      applyStartExamResponse(data as { questions?: Array<{ id: number; payload: Record<string, unknown> }>; remaining_seconds?: number | null; answers?: Record<number, unknown> });
    } catch (error) {
      hasStartedRef.current = false; // Reset on error so user can retry
      // Show error toast
      const errorMessage = error instanceof Error ? error.message : 'خطا در شروع آزمون';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  }, [examId, examStarted, startExamMutation.isPending, startExamMutation.mutateAsync, applyStartExamResponse]);

  // When resuming (status 'started'), call startExam to load questions + answers + remaining_seconds
  const hasLoadedResumeRef = useRef(false);
  useEffect(() => {
    hasStartedRef.current = false;
    hasLoadedResumeRef.current = false;
  }, [examId]);

  useEffect(() => {
    if (
      participantStatus === 'started' &&
      examId &&
      !examStarted &&
      canAccessQuestions &&
      !hasLoadedResumeRef.current &&
      !startExamMutation.isPending
    ) {
      hasLoadedResumeRef.current = true;
      startExamMutation
        .mutateAsync(examId)
        .then((data) => {
          applyStartExamResponse(data as { questions?: Array<{ id: number; payload: Record<string, unknown> }>; remaining_seconds?: number | null; answers?: Record<number, unknown> });
        })
        .catch(() => {
          hasLoadedResumeRef.current = false;
        });
    }
  }, [participantStatus, examId, examStarted, canAccessQuestions, startExamMutation.mutateAsync, applyStartExamResponse]);

  // Show error toast when mutation fails
  useEffect(() => {
    if (startExamMutation.isError && startExamMutation.error) {
      const errorMessage = startExamMutation.error instanceof Error 
        ? startExamMutation.error.message 
        : 'خطا در شروع آزمون';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  }, [startExamMutation.isError, startExamMutation.error]);

  const handleSubmitClick = useCallback(() => {
    if (!examId || submitted) return;
    setShowSubmitDialog(true);
  }, [examId, submitted]);

  const handleSubmitConfirm = useCallback(async () => {
    if (!examId || submitted) return;

    setShowSubmitDialog(false);
    try {
      const result = await submitExamMutation.mutateAsync(examId);
      setResult(result);
      setSubmitted(true);
    } catch (error) {
      // Error handled by mutation
    }
  }, [examId, submitted, submitExamMutation]);

  const handleAutoSubmit = useCallback(() => {
    if (!submitted && examId) {
      handleSubmitConfirm();
    }
  }, [submitted, examId, handleSubmitConfirm]);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !submitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return Math.floor(prev - 1); // Ensure integer
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && !submitted) {
      handleAutoSubmit();
    }
  }, [timeRemaining, submitted, handleAutoSubmit]);


  const handleAnswerChange = (questionId: number, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Auto-save answer
    if (examId) {
      saveAnswerMutation.mutate({
        examId,
        data: {
          exam_question_id: questionId,
          answer,
        },
      });
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Show start button if user is registered but hasn't started yet
  const isRegistered = examInfo?.is_registered;
  const shouldShowStartButton = isRegistered && (participantStatus === 'registered' || participantStatus === null);

  // If already completed, redirect to result page
  if (participantStatus === 'completed' && examId) {
    router.replace(`/exams/${examId}/result`);
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }

  // Show message if exam hasn't started yet (time restriction)
  if (timeStatus.hasTimeRestriction && timeStatus.isBeforeStart && timeStatus.startAt) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Typography variant="h5" gutterBottom>
                  {examInfo?.title || 'آزمون'}
                </Typography>
                <Alert severity="warning" sx={{ width: '100%' }}>
                  <Typography variant="body1" fontWeight="bold" gutterBottom>
                    آزمون هنوز شروع نشده است
                  </Typography>
                  <Typography variant="body2">
                    زمان شروع آزمون: {timeStatus.startAt.toLocaleString('fa-IR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      timeZone: 'Asia/Tehran'
                    })}
                  </Typography>
                </Alert>
                <Button
                  variant="outlined"
                  onClick={() => router.push(`/exams/participate/${examId}`)}
                >
                  بازگشت به صفحه ثبت‌نام
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </ProtectedRoute>
    );
  }

  if (shouldShowStartButton && !examStarted) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Typography variant="h5" gutterBottom>
                  {examInfo?.title || 'آزمون'}
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  شما در این آزمون ثبت‌نام کرده‌اید. برای شروع آزمون روی دکمه زیر کلیک کنید.
                </Typography>
                {examInfo?.time_message && (
                  <Alert severity="info" sx={{ width: '100%' }}>
                    {examInfo.time_message}
                  </Alert>
                )}
                {startExamMutation.isError && (
                  <Alert severity="error" sx={{ width: '100%' }}>
                    {startExamMutation.error instanceof Error
                      ? startExamMutation.error.message
                      : 'خطا در شروع آزمون'}
                  </Alert>
                )}
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<PlayArrowIcon />}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleStartExam();
                  }}
                  disabled={startExamMutation.isPending || !canAccessQuestions}
                  sx={{ minWidth: 200, zIndex: 1000 }}
                >
                  {startExamMutation.isPending ? 'در حال شروع...' : 'شروع آزمون'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </ProtectedRoute>
    );
  }

  if (startExamMutation.isPending || (!examStarted && participantStatus === 'started')) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </Container>
      </ProtectedRoute>
    );
  }

  if (startExamMutation.isError) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            {startExamMutation.error instanceof Error
              ? startExamMutation.error.message
              : 'Failed to start exam.'}
          </Alert>
        </Container>
      </ProtectedRoute>
    );
  }

  if (submitted && result) {
    return (
      <ProtectedRoute>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Card>
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <CheckCircleIcon
                  sx={{ fontSize: 64, color: result.passed ? 'success.main' : 'error.main' }}
                />
                <Typography variant="h4" gutterBottom>
                  {result.passed ? 'تبریک! شما قبول شدید' : 'متأسفانه شما رد شدید'}
                </Typography>
                <Box textAlign="center">
                  <Typography variant="h5" gutterBottom>
                    نمره شما: {result.score} از {result.total_points}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    درصد: {Math.round((result.score / result.total_points) * 100)}%
                  </Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/exams/available')}
                  >
                    بازگشت به لیست آزمون‌ها
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => router.push(`/exams/${examId}/result`)}
                  >
                    مشاهده جزئیات نتیجه
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </ProtectedRoute>
    );
  }

  // Show error if exam started but no questions
  if (examStarted && questions.length === 0) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            سوالات آزمون دریافت نشد. لطفاً صفحه را رفرش کنید یا با پشتیبانی تماس بگیرید.
          </Alert>
        </Container>
      </ProtectedRoute>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={3}>
          {/* Header with timer and progress */}
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                  <Typography variant="h6" gutterBottom>
                    سوال {currentQuestionIndex + 1} از {questions.length}
                  </Typography>
                  <LinearProgress variant="determinate" value={progress} sx={{ width: 200, mt: 1 }} />
                </Box>
                {timeRemaining !== null && (
                  <Box textAlign="center">
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <AccessTimeIcon color={timeRemaining < 300 ? 'error' : 'action'} />
                      <Typography
                        variant="h6"
                        color={timeRemaining < 300 ? 'error.main' : 'text.primary'}
                      >
                        {formatTime(timeRemaining)}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Question Card */}
          {currentQuestion && (
            <Card>
              <CardContent>
                <Stack spacing={3}>
                  <Typography variant="h6" gutterBottom>
                    {currentQuestion.payload.question_text}
                  </Typography>

                  <QuestionAnswerInput
                    payload={currentQuestion.payload}
                    value={answers[currentQuestion.id]}
                    onChange={(v) => handleAnswerChange(currentQuestion.id, v)}
                  />

                  {saveAnswerMutation.isPending && (
                    <Alert severity="info" icon={<SaveIcon />}>
                      در حال ذخیره پاسخ...
                    </Alert>
                  )}
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="outlined"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              قبلی
            </Button>

            <Stack direction="row" spacing={2}>
              {currentQuestionIndex < questions.length - 1 ? (
                <Button variant="contained" onClick={handleNext}>
                  بعدی
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<SendIcon />}
                  onClick={() => setShowSubmitDialog(true)}
                  disabled={submitExamMutation.isPending}
                >
                  ارسال آزمون
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Question Navigation */}
          <Card>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                پیمایش سریع:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {questions.map((q, index) => (
                  <Button
                    key={q.id}
                    variant={index === currentQuestionIndex ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => setCurrentQuestionIndex(index)}
                    sx={{ minWidth: 40 }}
                  >
                    {index + 1}
                  </Button>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* Submit Confirmation Dialog */}
        <Dialog open={showSubmitDialog} onClose={() => setShowSubmitDialog(false)}>
          <DialogTitle>تأیید ارسال آزمون</DialogTitle>
          <DialogContent>
            <Typography>
              آیا از ارسال آزمون اطمینان دارید؟ پس از ارسال امکان تغییر پاسخ‌ها وجود ندارد.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              تعداد سوالات پاسخ داده شده: {Object.keys(answers).length} از {questions.length}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSubmitDialog(false)}>انصراف</Button>
            <Button onClick={handleSubmitConfirm} variant="contained" color="success">
              ارسال
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for error notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </ProtectedRoute>
  );
}

