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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from '@mui/material';
import { useExamWithParticipants } from '@/hooks/useExams';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function ExamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params?.id ? parseInt(params.id as string) : null;

  const { data: exam, isLoading, error } = useExamWithParticipants(examId);

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !exam) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load exam details.'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/exams')}
          sx={{ mt: 2 }}
        >
          بازگشت به لیست آزمون‌ها
        </Button>
      </Container>
    );
  }

  const passedCount = exam.participants.filter((p) => p.passed).length;
  const averageScore = exam.participants.length > 0
    ? exam.participants.reduce((sum, p) => sum + (p.score || 0), 0) / exam.participants.length
    : 0;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/exams')}
            sx={{ mb: 2 }}
          >
            بازگشت به لیست
          </Button>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 40 }} color="primary" />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {exam.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={exam.status === 'completed' ? 'تکمیل شده' : 'پیش‌نویس'}
                  color={exam.status === 'completed' ? 'success' : 'default'}
                  size="small"
                />
                <Chip
                  label={exam.type === 'online' ? 'آنلاین' : 'آفلاین'}
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Box>
            {exam.status === 'draft' && (
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/exams/edit?exam_id=${exam.id}`)}
              >
                ویرایش آزمون
              </Button>
            )}
          </Stack>
        </Box>

        {/* Exam Info */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  اطلاعات آزمون
                </Typography>
                <Stack spacing={1} sx={{ mt: 2 }}>
                  {exam.partner && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        شریک:
                      </Typography>
                      <Typography variant="body1">{exam.partner.name}</Typography>
                    </Box>
                  )}
                  {exam.creator && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        ایجادکننده:
                      </Typography>
                      <Typography variant="body1">{exam.creator.name}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      تعداد سوالات:
                    </Typography>
                    <Typography variant="body1">{exam.questions_count}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      تاریخ ایجاد:
                    </Typography>
                    <Typography variant="body1">
                      {new Date(exam.created_at).toLocaleDateString('fa-IR')}
                    </Typography>
                  </Box>
                  {exam.completed_at && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        تاریخ تکمیل:
                      </Typography>
                      <Typography variant="body1">
                        {new Date(exam.completed_at).toLocaleDateString('fa-IR')}
                      </Typography>
                    </Box>
                  )}
                  {exam.participation_link && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        لینک شرکت:
                      </Typography>
                      <Button
                        variant="outlined"
                        component="a"
                        href={exam.participation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ mt: 1 }}
                      >
                        باز کردن لینک شرکت
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  آمار شرکت‌کنندگان
                </Typography>
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <PeopleIcon color="primary" />
                      <Typography variant="h5">{exam.participants_count}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        کل شرکت‌کنندگان
                      </Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CheckCircleIcon color="success" />
                      <Typography variant="h5">{passedCount}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        قبول شده
                      </Typography>
                    </Stack>
                  </Box>
                  <Box>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CancelIcon color="error" />
                      <Typography variant="h5">
                        {exam.participants_count - passedCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        رد شده
                      </Typography>
                    </Stack>
                  </Box>
                  {exam.participants_count > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        میانگین نمره:
                      </Typography>
                      <Typography variant="h6">
                        {averageScore.toFixed(1)} / {exam.participants[0]?.total_points || 100}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Participants Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              لیست شرکت‌کنندگان
            </Typography>
            {exam.participants.length === 0 ? (
              <Box textAlign="center" py={4}>
                <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body1" color="text.secondary">
                  هنوز کسی در این آزمون شرکت نکرده است
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>نام</TableCell>
                      <TableCell>شماره تماس</TableCell>
                      <TableCell>ایمیل</TableCell>
                      <TableCell align="center">نمره</TableCell>
                      <TableCell align="center">وضعیت</TableCell>
                      <TableCell>تاریخ شروع</TableCell>
                      <TableCell>تاریخ تکمیل</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exam.participants.map((participant) => (
                      <TableRow key={participant.id}>
                        <TableCell>{participant.name || '-'}</TableCell>
                        <TableCell>{participant.phone_number || '-'}</TableCell>
                        <TableCell>{participant.email || '-'}</TableCell>
                        <TableCell align="center">
                          {participant.score !== null
                            ? `${participant.score} / ${participant.total_points || 100}`
                            : '-'}
                        </TableCell>
                        <TableCell align="center">
                          {participant.completed_at ? (
                            <Chip
                              label={participant.passed ? 'قبول' : 'رد'}
                              color={participant.passed ? 'success' : 'error'}
                              size="small"
                            />
                          ) : (
                            <Chip label="در حال انجام" color="warning" size="small" />
                          )}
                        </TableCell>
                        <TableCell>
                          {participant.started_at
                            ? new Date(participant.started_at).toLocaleDateString('fa-IR')
                            : '-'}
                        </TableCell>
                        <TableCell>
                          {participant.completed_at
                            ? new Date(participant.completed_at).toLocaleDateString('fa-IR')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}

