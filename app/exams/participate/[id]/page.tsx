"use client";

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
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
} from '@mui/material';
import { useExamInfo, useRegisterForExam } from '@/hooks/useExams';
import { useAuth } from '@/hooks';
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LoginIcon from '@mui/icons-material/Login';

export default function ExamParticipatePage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;
  const { isAuthenticated } = useAuth();
  const { data: examInfo, isLoading, error } = useExamInfo(examId);
  const registerMutation = useRegisterForExam();
  const [registering, setRegistering] = useState(false);

  const handleRegister = async () => {
    if (!examId || !isAuthenticated) {
      router.push(`/login?redirect=/exams/participate/${examId}`);
      return;
    }

    setRegistering(true);
    try {
      await registerMutation.mutateAsync(examId);
      // After registration (or if already registered), redirect to take exam
      router.push(`/exams/take/${examId}`);
    } catch (error) {
      // Error is handled by mutation
      // If user is already registered, the backend now returns success, so this shouldn't error
    } finally {
      setRegistering(false);
    }
  };

  const handleStart = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/exams/participate/${examId}`);
      return;
    }
    router.push(`/exams/take/${examId}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !examInfo) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load exam information.'}
        </Alert>
      </Container>
    );
  }

  const now = new Date();
  const startAt = examInfo?.start_at ? new Date(examInfo.start_at) : null;
  const endAt = examInfo?.end_at ? new Date(examInfo.end_at) : null;
  const isBeforeStart = startAt && now < startAt;
  const isAfterEnd = endAt && now > endAt;
  const isDuringExam = !isBeforeStart && !isAfterEnd;

  // Type-safe meta checks
  const meta = examInfo?.meta;
  const durationMinutes = meta?.duration_minutes ?? null;
  const passingScore = meta?.passing_score ?? null;
  const hasDurationMinutes = durationMinutes !== null && typeof durationMinutes === 'number';
  const hasPassingScore = passingScore !== null && typeof passingScore === 'number';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <SchoolIcon sx={{ fontSize: 40 }} color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h4" gutterBottom>
                    {examInfo.title}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={examInfo.type === 'online' ? 'آنلاین' : 'آفلاین'}
                      variant="outlined"
                      size="small"
                    />
                  </Stack>
                </Box>
              </Stack>

              {/* Time Information */}
              {(startAt || endAt) && (
                <Box>
                  <Divider sx={{ my: 2 }} />
                  <Stack spacing={1}>
                    {startAt ? (
                      <Typography variant="body2" color="text.secondary">
                        <AccessTimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        زمان شروع: {startAt.toLocaleString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    ) : null}
                    {endAt ? (
                      <Typography variant="body2" color="text.secondary">
                        <AccessTimeIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                        زمان پایان: {endAt.toLocaleString('fa-IR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    ) : null}
                    {isBeforeStart ? (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        آزمون هنوز شروع نشده است. لطفاً در زمان مشخص شده وارد شوید.
                      </Alert>
                    ) : null}
                    {isAfterEnd ? (
                      <Alert severity="warning" sx={{ mt: 1 }}>
                        زمان آزمون به پایان رسیده است. شما می‌توانید نتایج را مشاهده کنید.
                      </Alert>
                    ) : null}
                    {isDuringExam ? (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        آزمون در حال برگزاری است. می‌توانید وارد شوید و آزمون بدهید.
                      </Alert>
                    ) : null}
                  </Stack>
                </Box>
              )}

              <Divider />

              {examInfo.creator && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    ایجادکننده
                  </Typography>
                  <Typography variant="body1">{examInfo.creator.name}</Typography>
                </Box>
              )}

              <Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  تعداد سوالات
                </Typography>
                <Typography variant="body1">{examInfo.questions_count}</Typography>
              </Box>

              {hasDurationMinutes && durationMinutes && (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTimeIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      زمان آزمون: {durationMinutes} دقیقه
                    </Typography>
                  </Stack>
                </Box>
              )}

              {hasPassingScore && passingScore && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    نمره قبولی
                  </Typography>
                  <Typography variant="body1">{passingScore}%</Typography>
                </Box>
              )}

              {examInfo.meta?.instructions && (
                <Alert severity="info">
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    دستورالعمل:
                  </Typography>
                  <Typography variant="body2">{examInfo.meta.instructions as string}</Typography>
                </Alert>
              )}

              <Divider />

              {!isAuthenticated ? (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  برای شرکت در این آزمون باید وارد حساب کاربری خود شوید.
                </Alert>
              ) : examInfo.is_registered ? (
                <Alert
                  severity={examInfo.registration_status === 'completed' ? 'success' : 'info'}
                  sx={{ mb: 2 }}
                >
                  {examInfo.registration_status === 'completed'
                    ? 'شما این آزمون را تکمیل کرده‌اید.'
                    : examInfo.registration_status === 'started'
                    ? 'شما این آزمون را شروع کرده‌اید.'
                    : 'شما در این آزمون ثبت‌نام کرده‌اید.'}
                </Alert>
              ) : null}

              <Stack direction="row" spacing={2}>
                {!isAuthenticated ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<LoginIcon />}
                    onClick={() => router.push(`/login?redirect=/exams/participate/${examId}`)}
                  >
                    ورود به حساب کاربری
                  </Button>
                ) : examInfo.is_registered && examInfo.registration_status !== 'completed' ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStart}
                    disabled={!examInfo.can_start}
                  >
                    {examInfo.registration_status === 'started' ? 'ادامه آزمون' : 'شروع آزمون'}
                  </Button>
                ) : !examInfo.is_registered ? (
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<PlayArrowIcon />}
                    onClick={handleRegister}
                    disabled={registering || registerMutation.isPending}
                  >
                    {registering || registerMutation.isPending
                      ? 'در حال ثبت‌نام...'
                      : 'ثبت‌نام و شروع آزمون'}
                  </Button>
                ) : (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => router.push(`/exams/${examId}`)}
                  >
                    مشاهده نتایج
                  </Button>
                )}
              </Stack>

              {registerMutation.isError && (
                <Alert severity="error">
                  {registerMutation.error instanceof Error
                    ? registerMutation.error.message
                    : 'خطا در ثبت‌نام'}
                </Alert>
              )}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

