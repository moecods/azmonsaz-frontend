"use client";

import { useState, useEffect, Suspense } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import { useExamWithParticipants, usePublishExam, useUnpublishExam, useActivateExam, useDeactivateExam, useGenerateExamLink } from '@/hooks/useExams';
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
import PrintIcon from '@mui/icons-material/Print';
import GradeIcon from '@mui/icons-material/Grade';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Breadcrumb from '@/components/Breadcrumb';
import { examService } from '@/services';
import { Snackbar, Alert as MuiAlert } from '@mui/material';
import ParticipantManagement from '@/components/exams/ParticipantManagement';
import ExamNotificationsTab from '@/components/exams/ExamNotificationsTab';
import NotificationsIcon from '@mui/icons-material/Notifications';

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
    if (tab === 'participants') return 1;
    if (tab === 'notifications') return 2;
    return 0;
  });
  const [actionsMenuAnchor, setActionsMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const queryClient = useQueryClient();
  const { data: exam, isLoading, error } = useExamWithParticipants(examId);
  const publishExamMutation = usePublishExam();
  const unpublishExamMutation = useUnpublishExam();
  const activateExamMutation = useActivateExam();
  const deactivateExamMutation = useDeactivateExam();
  const generateExamLinkMutation = useGenerateExamLink();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const tabName = newValue === 1 ? 'participants' : newValue === 2 ? 'notifications' : 'info';
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

  const handlePrintClick = () => {
    if (!examId) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const url = `${origin}/exams/print?exam_id=${examId}&template=default`;
    window.open(url, '_blank');
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
            <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
              <Button
                variant="contained"
                size="medium"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/exams/create?exam_id=${exam.id}`)}
              >
                ویرایش
              </Button>
              <Button
                variant="outlined"
                size="medium"
                startIcon={<QuestionAnswerIcon />}
                onClick={() => router.push(`/exams/${exam.id}/questions`)}
              >
                سوالات
              </Button>
              <IconButton
                aria-label="عملیات بیشتر"
                onClick={(e) => setActionsMenuAnchor(e.currentTarget)}
                sx={{ border: 1, borderColor: 'divider' }}
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={actionsMenuAnchor}
                open={Boolean(actionsMenuAnchor)}
                onClose={() => setActionsMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
              >
                <MenuItem
                  onClick={() => {
                    router.push(`/exams/${exam.id}/grading`);
                    setActionsMenuAnchor(null);
                  }}
                >
                  <ListItemIcon><GradeIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>تصحیح دستی</ListItemText>
                </MenuItem>
                {exam.type === 'offline' && (
                  <MenuItem
                    onClick={() => {
                      handlePrintClick();
                      setActionsMenuAnchor(null);
                    }}
                  >
                    <ListItemIcon><PrintIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>چاپ برگه امتحان</ListItemText>
                  </MenuItem>
                )}
                <Divider />
                {exam.status === 'published' ? (
                  <MenuItem
                    onClick={() => {
                      handleUnpublish();
                      setActionsMenuAnchor(null);
                    }}
                    disabled={unpublishExamMutation.isPending}
                  >
                    <ListItemIcon><UnpublishedIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{unpublishExamMutation.isPending ? 'در حال انجام...' : 'لغو انتشار'}</ListItemText>
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => {
                      handlePublish();
                      setActionsMenuAnchor(null);
                    }}
                    disabled={publishExamMutation.isPending || (exam.questions_count || 0) === 0}
                    title={(exam.questions_count || 0) === 0 ? 'ابتدا حداقل یک سوال اضافه کنید' : ''}
                  >
                    <ListItemIcon><PublishIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{publishExamMutation.isPending ? 'در حال انجام...' : 'انتشار آزمون'}</ListItemText>
                  </MenuItem>
                )}
                {exam.is_active ? (
                  <MenuItem
                    onClick={() => {
                      handleDeactivate();
                      setActionsMenuAnchor(null);
                    }}
                    disabled={deactivateExamMutation.isPending}
                  >
                    <ListItemIcon><PowerOffIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{deactivateExamMutation.isPending ? 'در حال انجام...' : 'غیرفعال کردن'}</ListItemText>
                  </MenuItem>
                ) : (
                  <MenuItem
                    onClick={() => {
                      handleActivate();
                      setActionsMenuAnchor(null);
                    }}
                    disabled={activateExamMutation.isPending}
                  >
                    <ListItemIcon><PowerSettingsNewIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{activateExamMutation.isPending ? 'در حال انجام...' : 'فعال کردن'}</ListItemText>
                  </MenuItem>
                )}
              </Menu>
            </Stack>
          </Stack>
        </Box>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="exam tabs">
              <Tab label="اطلاعات آزمون" icon={<SchoolIcon />} iconPosition="start" />
              <Tab label="شرکت‌کنندگان" icon={<PeopleIcon />} iconPosition="start" />
              <Tab label="اعلان‌ها" icon={<NotificationsIcon />} iconPosition="start" />
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
                            {exam.published_at ? (
                              <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  تاریخ انتشار
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">
                                  {new Date(exam.published_at).toLocaleDateString('fa-IR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })}
                                </Typography>
                              </Box>
                            ) : (
                              <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                  تاریخ انتشار
                                </Typography>
                                <Typography variant="body2" fontWeight="medium" color="text.secondary">
                                  -
                                </Typography>
                              </Box>
                            )}
                          </Box>

                          {/* Registration Link (لینک ثبت‌نام آزمون) */}
                          {exam.registration_link && exam.type === 'online' && (
                            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                لینک ثبت‌نام آزمون
                              </Typography>
                              <Button
                                variant="contained"
                                component="a"
                                href={exam.registration_link}
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

                          {/* Exam Link (لینک شرکت در آزمون) */}
                          {exam.type === 'online' && exam.status === 'published' && (
                            <Box sx={{ p: 1.5, bgcolor: 'grey.50', borderRadius: 1 }}>
                              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                                لینک شرکت در آزمون
                              </Typography>
                              {exam.exam_link ? (
                                <Button
                                  variant="contained"
                                  component="a"
                                  href={exam.exam_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                  fullWidth
                                >
                                  باز کردن لینک
                                </Button>
                              ) : (
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{ mt: 0.5 }}
                                  fullWidth
                                  disabled={generateExamLinkMutation.isPending}
                                  onClick={() => generateExamLinkMutation.mutate(examId!, {
                                    onSuccess: () => {
                                      setSnackbar({ open: true, message: 'لینک آزمون تولید شد', severity: 'success' });
                                      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
                                    },
                                  })}
                                >
                                  {generateExamLinkMutation.isPending ? 'در حال تولید...' : 'تولید لینک آزمون'}
                                </Button>
                              )}
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
              <ParticipantManagement
                examId={examId!}
                participants={exam.participants}
                groups={exam.groups || []}
                registrationLink={exam.registration_link}
                examLink={exam.exam_link}
                onSuccess={() => {
                  // Refetch exam data
                  window.location.reload();
                }}
              />
            </CardContent>
          </TabPanel>

          {/* Tab Panel: Notifications */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              <ExamNotificationsTab
                examId={examId!}
                participants={exam.participants}
              />
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
