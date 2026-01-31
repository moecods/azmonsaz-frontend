"use client";

import { useRouter } from 'next/navigation';
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
} from '@mui/material';
import { useAvailableExams } from '@/hooks/useExams';
import ProtectedRoute from '@/components/ProtectedRoute';
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

export default function AvailableExamsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useAvailableExams();

  const exams = data?.data || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'started':
        return 'warning';
      case 'registered':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'تکمیل شده';
      case 'started':
        return 'در حال انجام';
      case 'registered':
        return 'ثبت‌نام شده';
      default:
        return status;
    }
  };

  const handleStartExam = (examId: number, status: string) => {
    if (status === 'completed') {
      // Show user's own result page
      router.push(`/exams/${examId}/result`);
    } else {
      // Start or continue exam
      router.push(`/exams/take/${examId}`);
    }
  };

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

  if (error) {
    return (
      <ProtectedRoute>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">
            {error instanceof Error ? error.message : 'Failed to load available exams.'}
          </Alert>
        </Container>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" gutterBottom>
              آزمون‌های من
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              لیست آزمون‌هایی که در آن‌ها ثبت‌نام کرده‌اید
            </Typography>
          </Box>

          {exams.length === 0 ? (
            <Card>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    هیچ آزمونی یافت نشد
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    شما هنوز در هیچ آزمونی ثبت‌نام نکرده‌اید.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: 3,
              }}
            >
              {exams.map((exam) => (
                <Card
                  key={exam.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SchoolIcon color="primary" />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {exam.title}
                        </Typography>
                        <Chip
                          label={getStatusLabel(exam.status)}
                          color={getStatusColor(exam.status) as any}
                          size="small"
                        />
                      </Stack>

                      {exam.creator && (
                        <Typography variant="body2" color="text.secondary">
                          ایجادکننده: {exam.creator.name}
                        </Typography>
                      )}

                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={exam.type === 'online' ? 'آنلاین' : 'آفلاین'}
                            size="small"
                            variant="outlined"
                          />
                          {exam.meta && typeof exam.meta === 'object' && 'duration_minutes' in exam.meta && (
                            <Chip
                              icon={<AccessTimeIcon />}
                              label={`${exam.meta.duration_minutes} دقیقه`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Stack>

                      <Typography variant="body2" color="text.secondary">
                        تاریخ ثبت‌نام: {new Date(exam.registered_at).toLocaleDateString('fa-IR')}
                      </Typography>

                      {exam.started_at && (
                        <Typography variant="body2" color="text.secondary">
                          تاریخ شروع: {new Date(exam.started_at).toLocaleDateString('fa-IR')}
                        </Typography>
                      )}

                      {exam.completed_at && (
                        <Typography variant="body2" color="text.secondary">
                          تاریخ تکمیل: {new Date(exam.completed_at).toLocaleDateString('fa-IR')}
                        </Typography>
                      )}

                      <Button
                        variant={exam.status === 'completed' ? 'outlined' : 'contained'}
                        fullWidth
                        startIcon={
                          exam.status === 'completed' ? (
                            <CheckCircleIcon />
                          ) : (
                            <PlayArrowIcon />
                          )
                        }
                        onClick={() => handleStartExam(exam.id, exam.status)}
                        sx={{ mt: 'auto' }}
                      >
                        {exam.status === 'completed'
                          ? 'مشاهده نتایج'
                          : exam.status === 'started'
                          ? 'ادامه آزمون'
                          : 'شروع آزمون'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}

