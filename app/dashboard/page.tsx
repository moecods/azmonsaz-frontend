"use client";

import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Stack spacing={6} alignItems="center">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom>
              پنل کاربری
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
              با پلتفرم قدرتمند سازنده آزمون ما، آزمون‌ها را ایجاد و مدیریت کنید. مناسب برای مؤسسات آموزشی و سازمان‌های آموزشی.
            </Typography>
            {user && (
              <Typography variant="body1" color="primary" sx={{ mt: 2 }}>
                خوش آمدید، {user.name}
              </Typography>
            )}
          </Box>

          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: 4, 
              mt: 4,
              width: '100%'
            }}
          >
            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <CardContent>
                <SchoolIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
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

            <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
              <CardContent>
                <QuizIcon sx={{ fontSize: 48, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
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


            {(user?.role === 'admin' || user?.role === 'content_manager') && (
              <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                <CardContent>
                  <AdminPanelSettingsIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                  <Typography variant="h5" gutterBottom>
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
            )}
          </Box>
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}

