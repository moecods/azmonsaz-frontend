"use client";

import { 
  Box, 
  Stack, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Paper, 
  Chip,
  CircularProgress,
  LinearProgress,
  Alert,
} from "@mui/material";
import { useAuth, useExams, useAvailableExams, useQuestions } from "@/hooks";
import { useMemo } from "react";
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Breadcrumb from '@/components/Breadcrumb';
import ShellContentLoader from '@/components/layout/ShellContentLoader';

export default function DashboardPage() {
  const { user } = useAuth();
  
  // Fetch data for statistics
  const { data: examsData, isLoading: examsLoading, isFetching: examsFetching } = useExams({
    per_page: 20,
  });
  const {
    data: availableExamsData,
    isLoading: availableExamsLoading,
    isFetching: availableExamsFetching,
  } = useAvailableExams();
  const {
    data: questionsData,
    isLoading: questionsLoading,
    isFetching: questionsFetching,
  } = useQuestions({ per_page: 1 });

  // Calculate statistics
  const stats = useMemo(() => {
    const exams = examsData?.data || [];
    // Convert object to array if needed (in case backend returns object with numeric keys)
    const availableExamsDataValue = availableExamsData?.data;
    const availableExams = Array.isArray(availableExamsDataValue) 
      ? availableExamsDataValue 
      : availableExamsDataValue && typeof availableExamsDataValue === 'object' 
      ? Object.values(availableExamsDataValue) 
      : [];

    const totalQuestions = questionsData?.meta?.total || 0;

    const isCreator = user?.roles?.includes('admin') || 
                     user?.roles?.includes('content_manager') || 
                     user?.roles?.includes('creator');

    // Get ongoing exams (started but not completed)
    const ongoingExams = availableExams.filter((e: any) => e.status === 'started');
    
    // Get recent completed exams with scores
    const recentCompleted = availableExams
      .filter((e: any) => e.status === 'completed')
      .slice(0, 5);

    return {
      totalExamsCreated: isCreator ? exams.length : 0,
      totalExamsParticipated: availableExams.length,
      totalQuestions: totalQuestions,
      completedExams: availableExams.filter((e: any) => e.status === 'completed').length,
      ongoingExams: ongoingExams.length,
      recentCompleted,
      isLoading: examsLoading || availableExamsLoading || questionsLoading,
    };
  }, [examsData, availableExamsData, questionsData, examsLoading, availableExamsLoading, questionsLoading, user]);

  const isCreator = user?.roles?.includes('admin') || 
                   user?.roles?.includes('content_manager') || 
                   user?.roles?.includes('creator');

  const completionRate = stats.totalExamsParticipated > 0 
    ? Math.round((stats.completedExams / stats.totalExamsParticipated) * 100) 
    : 0;

  const pageLoading = stats.isLoading;
  const pageFetching =
    examsFetching || availableExamsFetching || questionsFetching;

  return (
    <ShellContentLoader loading={pageLoading} fetching={!pageLoading && pageFetching}>
    <Stack spacing={4}>
        <Breadcrumb items={[{ label: 'داشبورد' }]} />

        <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            پنل کاربری
          </Typography>
          <Typography variant="body1" color="text.secondary">
            خوش آمدید، {user?.name}
          </Typography>
        </Box>

        {/* Role-based Widgets */}
        {isCreator ? (
          // Admin/Content Manager/Creator Widgets
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    >
                      <SchoolIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalExamsCreated}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        آزمون‌های ایجاد شده
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'info.light',
                        color: 'info.contrastText',
                      }}
                    >
                      <PeopleIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalQuestions}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        تعداد سوالات
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'warning.light',
                        color: 'warning.contrastText',
                      }}
                    >
                      <AccessTimeIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.ongoingExams}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        آزمون‌های در حال برگزاری
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'success.light',
                        color: 'success.contrastText',
                      }}
                    >
                      <TrendingUpIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {completionRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        نرخ تکمیل
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    آمار آزمون‌ها
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">آزمون‌های ایجاد شده</Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {stats.totalExamsCreated}
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={stats.totalExamsCreated > 0 ? 100 : 0}
                          sx={{ height: 8, borderRadius: 4 }}
                        />
                      </Box>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        ) : (
          // Regular User Widgets
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'info.light',
                        color: 'info.contrastText',
                      }}
                    >
                      <QuizIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalExamsParticipated}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        آزمون‌های ثبت‌نام شده
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'success.light',
                        color: 'success.contrastText',
                      }}
                    >
                      <CheckCircleIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.completedExams}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        آزمون‌های تکمیل شده
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'warning.light',
                        color: 'warning.contrastText',
                      }}
                    >
                      <AccessTimeIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.ongoingExams}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        آزمون‌های در حال برگزاری
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'primary.light',
                        color: 'primary.contrastText',
                      }}
                    >
                      <TrendingUpIcon />
                    </Box>
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {completionRate}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        نرخ تکمیل
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {stats.recentCompleted.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      نمرات اخیر
                    </Typography>
                    <Stack spacing={2} sx={{ mt: 2 }}>
                      {stats.recentCompleted.map((exam: any, index: number) => (
                        <Paper key={index} sx={{ p: 2 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body1" fontWeight="medium">
                              {exam.title || `آزمون ${index + 1}`}
                            </Typography>
                            {exam.score !== undefined && (
                              <Chip
                                label={`نمره: ${exam.score}`}
                                color={exam.passed ? 'success' : 'default'}
                                size="small"
                              />
                            )}
                          </Stack>
                        </Paper>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        )}
      </Stack>
    </ShellContentLoader>
  );
}

