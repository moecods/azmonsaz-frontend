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
} from '@mui/material';
import { useExamWithParticipants } from '@/hooks/useExams';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Breadcrumb from '@/components/Breadcrumb';

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
        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'مدیریت آزمون‌ها', href: '/exams' },
          { label: exam.title }
        ]} />

        {/* Header */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <SchoolIcon sx={{ fontSize: 40 }} color="primary" />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h4" gutterBottom>
                {exam.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                {exam.status !== 'completed' && (
                  <Chip
                    label="پیش‌نویس"
                    color="default"
                    size="small"
                  />
                )}
                <Chip
                  label={exam.type === 'online' ? 'آنلاین' : 'آفلاین'}
                  variant="outlined"
                  size="small"
                />
              </Stack>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/exams/edit?exam_id=${exam.id}`)}
            >
              ویرایش آزمون
            </Button>
          </Stack>
        </Box>

        {/* Exam Info and Statistics */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
          <Box>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <SchoolIcon color="primary" />
                  <Typography variant="h6">
                    اطلاعات آزمون
                  </Typography>
                </Stack>
                <Stack spacing={2}>
                  {/* Row 1: Partner and Questions Count */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    {exam.partner && (
                      <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          شریک
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {exam.partner.name}
                        </Typography>
                      </Box>
                    )}
                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        تعداد سوالات
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {exam.questions_count} سوال
                      </Typography>
                    </Box>
                  </Box>

                  {/* Row 2: Creator */}
                  {exam.creator && (
                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        ایجادکننده
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {exam.creator.name}
                      </Typography>
                    </Box>
                  )}

                  {/* Row 3: Created and Completed Dates */}
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        تاریخ ایجاد
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(exam.created_at).toLocaleDateString('fa-IR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                    {exam.completed_at ? (
                      <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          تاریخ تکمیل
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {new Date(exam.completed_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                          تاریخ تکمیل
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="text.secondary">
                          -
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Participation Link */}
                  {exam.participation_link && (
                    <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        لینک شرکت در آزمون
                      </Typography>
                      <Button
                        variant="contained"
                        component="a"
                        href={exam.participation_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{ mt: 0.5 }}
                        fullWidth
                      >
                        باز کردن لینک
                      </Button>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                  <PeopleIcon color="primary" />
                  <Typography variant="h6">
                    آمار شرکت‌کنندگان
                  </Typography>
                </Stack>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
                    <PeopleIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="primary.main">
                      {exam.participants_count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      کل شرکت‌کنندگان
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, textAlign: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {passedCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      قبول شده
                    </Typography>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, textAlign: 'center' }}>
                    <CancelIcon sx={{ fontSize: 32, color: 'error.main', mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {exam.participants_count - passedCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      رد شده
                    </Typography>
                  </Box>
                  {exam.participants_count > 0 && (
                    <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 1, textAlign: 'center' }}>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {averageScore.toFixed(1)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        از {exam.participants[0]?.total_points || 100}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        میانگین نمره
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

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

