"use client";

import { useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
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
  Tabs,
  Tab,
} from '@mui/material';
import { useExamWithParticipants, usePublishExam, useUnpublishExam, useActivateExam, useDeactivateExam } from '@/hooks/useExams';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import PublishIcon from '@mui/icons-material/Publish';
import UnpublishedIcon from '@mui/icons-material/Unpublished';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import PowerOffIcon from '@mui/icons-material/PowerOff';
import Breadcrumb from '@/components/Breadcrumb';
import { Snackbar, Alert as MuiAlert } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exam-tabpanel-${index}`}
      aria-labelledby={`exam-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

function ExamDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const examId = params?.id ? parseInt(params.id as string) : null;
  const [tabValue, setTabValue] = useState(() => {
    const tab = searchParams.get('tab');
    return tab === 'participants' ? 1 : 0;
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const { data: exam, isLoading, error } = useExamWithParticipants(examId);
  const publishExamMutation = usePublishExam();
  const unpublishExamMutation = useUnpublishExam();
  const activateExamMutation = useActivateExam();
  const deactivateExamMutation = useDeactivateExam();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const tabName = newValue === 1 ? 'participants' : 'info';
    router.replace(`/exams/${examId}?tab=${tabName}`, { scroll: false });
  };

  const handlePublish = () => {
    if (!examId) return;
    publishExamMutation.mutate(examId, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'آزمون با موفقیت منتشر شد',
          severity: 'success',
        });
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: error?.message || 'خطا در انتشار آزمون',
          severity: 'error',
        });
      },
    });
  };

  const handleUnpublish = () => {
    if (!examId) return;
    unpublishExamMutation.mutate(examId, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'آزمون با موفقیت از حالت انتشار خارج شد',
          severity: 'success',
        });
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: error?.message || 'خطا در خارج کردن از حالت انتشار',
          severity: 'error',
        });
      },
    });
  };

  const handleActivate = () => {
    if (!examId) return;
    activateExamMutation.mutate(examId, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'آزمون با موفقیت فعال شد',
          severity: 'success',
        });
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: error?.message || 'خطا در فعال کردن آزمون',
          severity: 'error',
        });
      },
    });
  };

  const handleDeactivate = () => {
    if (!examId) return;
    deactivateExamMutation.mutate(examId, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'آزمون با موفقیت غیرفعال شد',
          severity: 'success',
        });
      },
      onError: (error: any) => {
        setSnackbar({
          open: true,
          message: error?.message || 'خطا در غیرفعال کردن آزمون',
          severity: 'error',
        });
      },
    });
  };

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
                <Chip
                  label={exam.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'}
                  color={exam.status === 'published' ? 'success' : 'default'}
                  size="small"
                />
                {!exam.is_active && (
                  <Chip
                    label="غیرفعال"
                    color="error"
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
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/exams/create?exam_id=${exam.id}`)}
              >
                ویرایش اطلاعات آزمون
              </Button>
              <Button
                variant="outlined"
                startIcon={<QuestionAnswerIcon />}
                onClick={() => router.push(`/exams/${exam.id}/questions`)}
              >
                مدیریت سوالات
              </Button>
              {exam.status === 'published' ? (
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={<UnpublishedIcon />}
                  onClick={handleUnpublish}
                  disabled={unpublishExamMutation.isPending}
                >
                  {unpublishExamMutation.isPending ? 'در حال انجام...' : 'لغو انتشار'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<PublishIcon />}
                  onClick={handlePublish}
                  disabled={publishExamMutation.isPending || (exam.questions_count || 0) === 0}
                  title={(exam.questions_count || 0) === 0 ? 'ابتدا باید حداقل یک سوال به آزمون اضافه کنید' : ''}
                >
                  {publishExamMutation.isPending ? 'در حال انجام...' : 'انتشار آزمون'}
                </Button>
              )}
              {exam.is_active ? (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<PowerOffIcon />}
                  onClick={handleDeactivate}
                  disabled={deactivateExamMutation.isPending}
                >
                  {deactivateExamMutation.isPending ? 'در حال انجام...' : 'غیرفعال کردن'}
                </Button>
              ) : (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<PowerSettingsNewIcon />}
                  onClick={handleActivate}
                  disabled={activateExamMutation.isPending}
                >
                  {activateExamMutation.isPending ? 'در حال انجام...' : 'فعال کردن'}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="exam tabs">
              <Tab label="اطلاعات آزمون" icon={<SchoolIcon />} iconPosition="start" />
              <Tab label="شرکت‌کنندگان" icon={<PeopleIcon />} iconPosition="start" />
            </Tabs>
          </Box>

          {/* Tab Panel: Exam Info */}
          <TabPanel value={tabValue} index={0}>
            <CardContent>
              <Stack spacing={4}>
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
              </Stack>
            </CardContent>
          </TabPanel>

          {/* Tab Panel: Participants */}
          <TabPanel value={tabValue} index={1}>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6" gutterBottom>
                  لیست شرکت‌کنندگان
                </Typography>
                {exam.participants.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <PeopleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      هنوز کسی در این آزمون شرکت نکرده است
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      پس از شرکت کاربران در آزمون، اطلاعات آن‌ها در اینجا نمایش داده می‌شود
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer component={Paper}>
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
                            <TableCell>{participant.user?.name || '-'}</TableCell>
                            <TableCell>{participant.user?.phone_number || '-'}</TableCell>
                            <TableCell>{participant.user?.email || '-'}</TableCell>
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
              </Stack>
            </CardContent>
          </TabPanel>
        </Card>
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
}

export default function ExamDetailPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    }>
      <ExamDetailContent />
    </Suspense>
  );
}
