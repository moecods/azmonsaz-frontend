"use client";

import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography, Chip, Divider } from "@mui/material";
import { useRouter } from "next/navigation";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import SecurityIcon from "@mui/icons-material/Security";
import SpeedIcon from "@mui/icons-material/Speed";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import GroupIcon from "@mui/icons-material/Group";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            opacity: 0.1,
          },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={4} alignItems="center" textAlign="center" sx={{ position: 'relative', zIndex: 1 }}>
            <Chip 
              label="پلتفرم حرفه‌ای ساخت آزمون" 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold',
                mb: 2
              }} 
            />
            <Typography 
              variant="h2" 
              component="h1" 
              fontWeight="bold"
              sx={{ 
                fontSize: { xs: '2.5rem', md: '4rem' },
                lineHeight: 1.2,
                mb: 2
              }}
            >
              آزمون‌ساز
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                maxWidth: 700,
                opacity: 0.95,
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                lineHeight: 1.6
              }}
            >
              پلتفرم قدرتمند و حرفه‌ای برای ایجاد، مدیریت و سفارشی‌سازی آزمون‌های آنلاین
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                maxWidth: 600,
                opacity: 0.9,
                fontSize: { xs: '0.95rem', md: '1.1rem' }
              }}
            >
              مناسب برای مؤسسات آموزشی، سازمان‌های شرکتی و مراکز صدور گواهینامه
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push(isAuthenticated ? '/dashboard' : '/login')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease',
                }}
                endIcon={<ArrowForwardIcon />}
              >
                شروع کنید
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/partners')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                مشاهده شرکا
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            ویژگی‌های کلیدی
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            تمام ابزارهای مورد نیاز برای ساخت و مدیریت آزمون‌های حرفه‌ای
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 4,
          }}
        >
          <Box>
            <Card 
              sx={{ 
                height: '100%',
                textAlign: 'center',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  بانک سوالات
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  کتابخانه جامع سوالات با دسته‌بندی، برچسب‌گذاری و سطوح دشواری مختلف. سوالات را یکبار بسازید و بارها استفاده کنید.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card 
              sx={{ 
                height: '100%',
                textAlign: 'center',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'secondary.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <QuizIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  ساخت آزمون
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  ایجاد آزمون‌های سفارشی با رابط کاربری ساده. انتخاب سوالات از بانک یا ایجاد سوالات جدید برای هر آزمون.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card 
              sx={{ 
                height: '100%',
                textAlign: 'center',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'success.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <SecurityIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  امنیت بالا
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  لینک‌های امن و محدود به زمان برای ویرایش آزمون‌ها. هر شریک کلید دسترسی منحصر به فرد خود را دارد.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card 
              sx={{ 
                height: '100%',
                textAlign: 'center',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'warning.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <SpeedIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  سرعت بالا
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  رابط کاربری سریع و واکنش‌گرا. ایجاد و مدیریت آزمون‌ها در کمترین زمان ممکن.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card 
              sx={{ 
                height: '100%',
                textAlign: 'center',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'info.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: 40, color: 'info.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  مدیریت پیشرفته
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  پنل مدیریت کامل برای مدیریت شرکا، کاربران و تنظیمات سیستم. کنترل کامل بر تمام جنبه‌های پلتفرم.
                </Typography>
              </CardContent>
            </Card>
          </Box>

          <Box>
            <Card 
              sx={{ 
                height: '100%',
                textAlign: 'center',
                p: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'error.light',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <GroupIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  چند کاربره
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  پشتیبانی از چندین شریک و کاربر. هر سازمان حساب کاربری مستقل و امن خود را دارد.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>

      {/* How It Works Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              چگونه کار می‌کند؟
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
              در ۴ مرحله ساده آزمون خود را ایجاد کنید
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 4,
            }}
          >
            {[
              { step: '۱', title: 'ثبت نام شریک', desc: 'سازمان شما به عنوان شریک ثبت می‌شود و کلید دسترسی امن دریافت می‌کنید' },
              { step: '۲', title: 'ایجاد بانک سوالات', desc: 'سوالات خود را با دسته‌بندی و سطح دشواری ایجاد و سازمان‌دهی کنید' },
              { step: '۳', title: 'ساخت آزمون', desc: 'از بانک سوالات یا سوالات جدید، آزمون خود را بسازید و تنظیمات را اعمال کنید' },
              { step: '۴', title: 'اشتراک‌گذاری', desc: 'لینک امن آزمون را دریافت کرده و با شرکت‌کنندگان به اشتراک بگذارید' },
            ].map((item, index) => (
              <Box key={index}>
                <Card sx={{ height: '100%', textAlign: 'center', p: 3 }}>
                  <CardContent>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        bgcolor: 'primary.main',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {item.step}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {item.title}
                    </Typography>
                    <Typography color="text.secondary" sx={{ lineHeight: 1.8 }}>
                      {item.desc}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box textAlign="center" mb={6}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            مزایای استفاده
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            چرا آزمون‌ساز را انتخاب کنید؟
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
            gap: 4,
          }}
        >
          {[
            'صرفه‌جویی در زمان با استفاده مجدد از سوالات',
            'سازمان‌دهی کامل با دسته‌بندی و برچسب‌گذاری',
            'امنیت بالا با لینک‌های محافظت شده',
            'انعطاف‌پذیری در سفارشی‌سازی آزمون‌ها',
            'مدیریت مرکزی تمام آزمون‌ها و سوالات',
            'پشتیبانی از چندین سازمان و کاربر',
          ].map((benefit, index) => (
            <Box key={index}>
              <Box display="flex" gap={2}>
                <CheckCircleIcon sx={{ color: 'success.main', fontSize: 32, mt: 0.5 }} />
                <Box>
                  <Typography variant="h6" fontWeight="medium">
                    {benefit}
                  </Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Box>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography variant="h3" fontWeight="bold">
              آماده شروع هستید؟
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.95 }}>
              همین حالا شروع کنید و اولین آزمون خود را ایجاد کنید
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push(isAuthenticated ? '/exams/create' : '/login')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                  transition: 'all 0.3s ease',
                }}
                endIcon={<ArrowForwardIcon />}
              >
                شروع رایگان
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push('/admin')}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                پنل مدیریت
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
