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
      // After registration, redirect to take exam
      router.push(`/exams/take/${examId}`);
    } catch (error) {
      // Error is handled by mutation
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

              {examInfo.meta?.duration_minutes && (
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AccessTimeIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      زمان آزمون: {examInfo.meta.duration_minutes} دقیقه
                    </Typography>
                  </Stack>
                </Box>
              )}

              {examInfo.meta?.passing_score && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    نمره قبولی
                  </Typography>
                  <Typography variant="body1">{examInfo.meta.passing_score}%</Typography>
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

