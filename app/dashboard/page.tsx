"use client";

import { Box, Button, Card, CardContent, Grid, Stack, Typography, CircularProgress, Chip } from "@mui/material";
import { useRouter } from "next/navigation";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import UserLayout from "@/components/layout/UserLayout";
import Breadcrumb from "@/components/Breadcrumb";
import { useAuth, useExams, useAvailableExams, useQuestions } from "@/hooks";
import { useMemo } from "react";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Fetch data for statistics
  const { data: examsData, isLoading: examsLoading } = useExams({ per_page: 100 });
  const { data: availableExamsData, isLoading: availableExamsLoading } = useAvailableExams();
  const { data: questionsData, isLoading: questionsLoading } = useQuestions({ per_page: 1 });

  // Calculate statistics
  const stats = useMemo(() => {
    const exams = examsData?.data || [];
    const availableExams = availableExamsData?.data || [];
    const totalQuestions = questionsData?.meta?.total || 0;

    const isCreator = user?.roles?.includes('admin') || 
                     user?.roles?.includes('content_manager') || 
                     user?.roles?.includes('creator');

    return {
      totalExamsCreated: isCreator ? exams.length : 0,
      totalExamsParticipated: availableExams.length,
      totalQuestions: totalQuestions,
      completedExams: availableExams.filter((e: any) => e.status === 'completed').length,
      isLoading: examsLoading || availableExamsLoading || questionsLoading,
    };
  }, [examsData, availableExamsData, questionsData, examsLoading, availableExamsLoading, questionsLoading, user]);

  const isCreator = user?.roles?.includes('admin') || 
                   user?.roles?.includes('content_manager') || 
                   user?.roles?.includes('creator');

  return (
    <UserLayout>
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

        {/* Statistics Cards */}
        {!stats.isLoading && (
          <Grid container spacing={3}>
            {isCreator && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.totalExamsCreated}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          آزمون ایجاد شده
                        </Typography>
                      </Box>
                      <SchoolIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
            
            {isCreator && (
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ height: '100%', bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.totalQuestions}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          سوال در بانک
                        </Typography>
                      </Box>
                      <QuizIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={isCreator ? 3 : 6}>
              <Card sx={{ height: '100%', bgcolor: 'info.main', color: 'info.contrastText' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.totalExamsParticipated}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        آزمون ثبت‌نام شده
                      </Typography>
                    </Box>
                    <AssignmentIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={isCreator ? 3 : 6}>
              <Card sx={{ height: '100%', bgcolor: 'success.main', color: 'success.contrastText' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="h4" fontWeight="bold">
                        {stats.completedExams}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        آزمون تکمیل شده
                      </Typography>
                    </Box>
                    <TrendingUpIcon sx={{ fontSize: 48, opacity: 0.8 }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {stats.isLoading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {/* Quick Actions */}
        <Box>
          <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
            دسترسی سریع
          </Typography>
          <Grid container spacing={3}>
            {isCreator && (
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      ایجاد آزمون
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      آزمون‌های سفارشی با سوالات از بانک سوالات ما یا ایجاد سوالات خودتان بسازید.
                    </Typography>
                    <Button 
                      variant="contained" 
                      fullWidth
                      onClick={() => router.push('/exams/create')}
                    >
                      شروع ایجاد
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {isCreator && (
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <QuizIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      بانک سوالات
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      کتابخانه سوالات خود را با دسته‌بندی‌ها، برچسب‌ها و سطوح دشواری مدیریت کنید.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => router.push('/questions')}
                    >
                      مدیریت سوالات
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            {isCreator && (
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <ListAltIcon sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      مدیریت آزمون‌ها
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      مشاهده و مدیریت آزمون‌های ایجاد شده، شرکت‌کنندگان و نتایج.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => router.push('/exams')}
                    >
                      مشاهده آزمون‌ها
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} sm={6} md={isCreator ? 4 : 6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <SchoolIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    آزمون‌های من
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    مشاهده آزمون‌هایی که در آن‌ها ثبت‌نام کرده‌اید یا می‌توانید شرکت کنید.
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => router.push('/exams/available')}
                  >
                    مشاهده آزمون‌های من
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={isCreator ? 4 : 6}>
              <Card 
                sx={{ 
                  height: '100%', 
                  textAlign: 'center', 
                  p: 3,
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent>
                  <PersonIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    پروفایل
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3 }}>
                    مشاهده و ویرایش اطلاعات پروفایل کاربری
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    onClick={() => router.push('/profile')}
                  >
                    مشاهده پروفایل
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {(user?.roles?.includes('admin') || user?.roles?.includes('content_manager')) && (
              <Grid item xs={12} sm={6} md={4}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    textAlign: 'center', 
                    p: 3,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardContent>
                    <AdminPanelSettingsIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      پنل مدیریت
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                      مدیریت شرکا، کاربران و تنظیمات سیستم برای مدیران.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      fullWidth
                      onClick={() => router.push('/admin')}
                    >
                      دسترسی مدیریت
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Stack>
    </UserLayout>
  );
}

