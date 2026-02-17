"use client";

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
} from '@mui/material';
import { useMyExamResult } from '@/hooks/useExams';
import ProtectedRoute from '@/components/ProtectedRoute';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { QuestionResultDisplay } from '@/components/questions/QuestionResultDisplay';

export default function ExamResultPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;

  const { data: resultData, isLoading, error } = useMyExamResult(examId);

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
  const incorrectCount = questions.length - correctCount;

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
                    {result.completed_at && (
                      <Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          تاریخ تکمیل
                        </Typography>
                        <Typography variant="body1">
                          {new Date(result.completed_at).toLocaleString('fa-IR')}
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
                {questions.map((question, index) => (
                  <Card
                    key={question.id}
                    variant="outlined"
                    sx={{
                      borderColor: question.is_correct ? 'success.main' : 'error.main',
                      borderWidth: 2,
                    }}
                  >
                    <CardContent>
                      <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">
                            سوال {index + 1}: {question.question_text}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <Chip
                              label={question.is_correct ? 'صحیح' : 'نادرست'}
                              color={question.is_correct ? 'success' : 'error'}
                              size="small"
                            />
                            <Chip
                              label={`${question.points_earned}/${question.points_total} نمره`}
                              variant="outlined"
                              size="small"
                            />
                          </Stack>
                        </Stack>

                        <QuestionResultDisplay question={question} />
                      </Stack>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}

