"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { useMyExamResult } from '@/hooks/useExams';
import { useAuth } from '@/hooks';
import ProtectedRoute from '@/components/ProtectedRoute';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import { QuestionResultDisplay } from '@/components/questions/QuestionResultDisplay';
import { handleError } from '@/lib/error-handler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8030/api';
const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('auth_token') || localStorage.getItem('token')}`,
  'Content-Type': 'application/json',
});

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;
  const [aiReviewQuestion, setAiReviewQuestion] = useState<number | null>(null);
  const [aiReviewData, setAiReviewData] = useState<{ explanation: string; feedback: string } | null>(null);

  const { data: resultData, isLoading, error } = useMyExamResult(examId);
  const { user } = useAuth();
  const hasPro = !!user?.subscription?.ends_at && new Date(user.subscription.ends_at) > new Date();

  if (isLoading) {
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

  if (error || !resultData) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            {error instanceof Error ? error.message : 'Failed to load exam result.'}
          </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/exams/available')}
            sx={{ mt: 2 }}
          >
            بازگشت به لیست آزمون‌ها
          </Button>
        </Container>
      </ProtectedRoute>
    );
  }

  const { exam, result, questions } = resultData;
  const correctCount = questions.filter((q) => q.is_correct).length;
  const pendingGradingCount = questions.filter((q) => (q as { is_pending_grading?: boolean }).is_pending_grading).length;
  const incorrectCount = questions.length - correctCount - pendingGradingCount;

  const handleAiReview = async (examQuestionId: number) => {
    if (!examId) return;
    setAiReviewQuestion(examQuestionId);
    setAiReviewData(null);
    try {
      const res = await fetch(
        `${API_URL}/exams/${examId}/my-result/ai-review/${examQuestionId}`,
        { method: 'POST', headers: getAuthHeader() }
      );
      if (!res.ok) throw new Error((await res.json()).message || 'AI review failed');
      const { data } = await res.json();
      setAiReviewData({ explanation: data.explanation || '', feedback: data.feedback || '' });
    } catch (e) {
      handleError(e, { context: 'AI Review' });
      setAiReviewQuestion(null);
    }
  };

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          {/* Header */}
          <Box>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/exams/available')}
              sx={{ mb: 2 }}
            >
              بازگشت
            </Button>
            <Typography variant="h4" gutterBottom>
              نتیجه آزمون: {exam.title}
            </Typography>
          </Box>

          {/* Summary Card */}
          <Card>
            <CardContent>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: result.passed ? 'success.light' : 'error.light',
                        mb: 2,
                      }}
                    >
                      {result.passed ? (
                        <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
                      ) : (
                        <CancelIcon sx={{ fontSize: 64, color: 'error.main' }} />
                      )}
                    </Box>
                    <Typography variant="h5" gutterBottom>
                      {result.passed ? 'قبول شدید' : 'رد شدید'}
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {result.score} / {result.total_points}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {result.percentage}%
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        رتبه شما
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <EmojiEventsIcon color="primary" />
                        <Typography variant="h5">
                          {result.rank} از {result.total_participants}
                        </Typography>
                      </Stack>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        سوالات صحیح
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {correctCount} از {questions.length}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        سوالات نادرست
                      </Typography>
                      <Typography variant="h6" color="error.main">
                        {incorrectCount} از {questions.length}
                      </Typography>
                    </Box>
                    {pendingGradingCount > 0 && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          در انتظار تصحیح
                        </Typography>
                        <Typography variant="h6" color="warning.main">
                          {pendingGradingCount} از {questions.length}
                        </Typography>
                      </Box>
                    )}
                    {result.completed_at && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          تاریخ تکمیل
                        </Typography>
                        <Typography variant="body1">
                          {new Date(result.completed_at).toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}
                        </Typography>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Questions Review */}
          <Card>
            <CardContent>
              <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
                بررسی پاسخ‌ها
              </Typography>
              <Stack spacing={3}>
                {questions.map((question, index) => {
                  const isPendingGrading = (question as { is_pending_grading?: boolean }).is_pending_grading;
                  const statusLabel = isPendingGrading ? 'در انتظار تصحیح' : question.is_correct ? 'صحیح' : 'نادرست';
                  const statusColor = isPendingGrading ? 'warning' : question.is_correct ? 'success' : 'error';
                  const borderColor = isPendingGrading ? 'warning.main' : question.is_correct ? 'success.main' : 'error.main';
                  return (
                  <Card
                    key={question.id}
                    variant="outlined"
                    sx={{
                      borderColor,
                      borderWidth: 2,
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">
                            سوال {index + 1}: {question.question_text}
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Chip
                              label={statusLabel}
                              color={statusColor}
                              size="small"
                            />
                            <Chip
                              label={`${question.points_earned}/${question.points_total} نمره`}
                              variant="outlined"
                              size="small"
                            />
                            {hasPro && (
                              <Button
                                size="small"
                                variant="outlined"
                                startIcon={aiReviewQuestion === question.id ? <CircularProgress size={14} /> : <SmartToyIcon />}
                                onClick={() => handleAiReview(question.id)}
                                disabled={aiReviewQuestion !== null}
                              >
                                بررسی با AI
                              </Button>
                            )}
                          </Stack>
                        </Stack>

                        <QuestionResultDisplay question={{ ...question, is_pending_grading: isPendingGrading }} />
                      </Stack>
                    </CardContent>
                  </Card>
                );
                })}
              </Stack>
            </CardContent>
          </Card>

          <Dialog open={!!aiReviewData} onClose={() => { setAiReviewData(null); setAiReviewQuestion(null); }} maxWidth="sm" fullWidth>
            <DialogTitle>بررسی با هوش مصنوعی</DialogTitle>
            <DialogContent>
              {aiReviewData && (
                <Stack spacing={2} sx={{ pt: 1 }}>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {aiReviewData.explanation}
                  </Typography>
                  {aiReviewData.feedback && (
                    <Alert severity="info">{aiReviewData.feedback}</Alert>
                  )}
                </Stack>
              )}
            </DialogContent>
          </Dialog>
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}

