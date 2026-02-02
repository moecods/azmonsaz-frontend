"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
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
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Checkbox,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useStartExam, useSaveAnswer, useSubmitExam } from '@/hooks/useExams';
import ProtectedRoute from '@/components/ProtectedRoute';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

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

  const startExamMutation = useStartExam();
  const saveAnswerMutation = useSaveAnswer();
  const submitExamMutation = useSubmitExam();

  useEffect(() => {
    if (examId && !examStarted) {
      handleStartExam();
    }
  }, [examId]);

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
  }, [timeRemaining, submitted]);

  const handleStartExam = async () => {
    if (!examId) return;

    try {
      const response = await startExamMutation.mutateAsync(examId);
      // Map API response questions to local Question interface
      const mappedQuestions: Question[] = (response.questions || []).map((q) => ({
        id: q.id,
        payload: q.payload as Question['payload'],
      }));
      setQuestions(mappedQuestions);
      setExamStarted(true);
      
      // Load saved answers if resuming
      if (response.answers && typeof response.answers === 'object') {
        const savedAnswers: Record<number, any> = {};
        Object.keys(response.answers).forEach((key) => {
          const questionId = parseInt(key);
          if (!isNaN(questionId) && response.answers) {
            savedAnswers[questionId] = response.answers[key];
          }
        });
        setAnswers(savedAnswers);
      }
      
      // Set timer - use remaining_seconds if resuming, otherwise calculate from duration
      if (response.remaining_seconds !== null && response.remaining_seconds !== undefined) {
        setTimeRemaining(Math.floor(response.remaining_seconds)); // Ensure integer
      } else {
        const durationMinutes = response.exam?.meta?.duration_minutes;
        if (durationMinutes && typeof durationMinutes === 'number') {
          setTimeRemaining(durationMinutes * 60);
        }
      }
    } catch (error) {
      // Error handled by mutation
    }
  };

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

  const handleSubmit = async () => {
    if (!examId) return;

    setShowSubmitDialog(false);
    try {
      const response = await submitExamMutation.mutateAsync(examId);
      setResult(response);
      setSubmitted(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleAutoSubmit = () => {
    if (!submitted && examId) {
      handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (startExamMutation.isPending || !examStarted) {
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

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

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

                  {currentQuestion.payload.type === 'multiple_choice' && (
                    <FormControl>
                      <RadioGroup
                        value={answers[currentQuestion.id] ?? ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                      >
                        {currentQuestion.payload.options?.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            value={index.toString()}
                            control={<Radio />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}

                  {currentQuestion.payload.type === 'true_false' && (
                    <FormControl>
                      <RadioGroup
                        value={answers[currentQuestion.id] ?? ''}
                        onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
                      >
                        <FormControlLabel value="0" control={<Radio />} label="درست" />
                        <FormControlLabel value="1" control={<Radio />} label="نادرست" />
                      </RadioGroup>
                    </FormControl>
                  )}

                  {currentQuestion.payload.type === 'multiple_select' && (
                    <FormControl>
                      <FormLabel>انتخاب چند گزینه</FormLabel>
                      <Stack>
                        {currentQuestion.payload.options?.map((option, index) => (
                          <FormControlLabel
                            key={index}
                            control={
                              <Checkbox
                                checked={
                                  Array.isArray(answers[currentQuestion.id])
                                    ? answers[currentQuestion.id].includes(index)
                                    : false
                                }
                                onChange={(e) => {
                                  const current = Array.isArray(answers[currentQuestion.id])
                                    ? answers[currentQuestion.id]
                                    : [];
                                  const newAnswer = e.target.checked
                                    ? [...current, index]
                                    : current.filter((i: number) => i !== index);
                                  handleAnswerChange(currentQuestion.id, newAnswer);
                                }}
                              />
                            }
                            label={option}
                          />
                        ))}
                      </Stack>
                    </FormControl>
                  )}

                  {currentQuestion.payload.type === 'essay' && (
                    <TextField
                      multiline
                      rows={6}
                      fullWidth
                      value={answers[currentQuestion.id] ?? ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="پاسخ خود را اینجا بنویسید..."
                    />
                  )}

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
            <Button onClick={handleSubmit} variant="contained" color="success">
              ارسال
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </ProtectedRoute>
  );
}

