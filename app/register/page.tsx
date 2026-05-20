"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  Stack,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validation';
import { useRegister } from '@/hooks';
import GuestRoute from '@/components/GuestRoute';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { toEnglishNumbers } from '@/utils/numbers';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      phone_number: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      data.phone_number = toEnglishNumbers(data.phone_number)
      await registerMutation.mutateAsync(data);
      // هدایت به داشبورد بعد از ثبت‌نام موفق
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'ثبت‌نام ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  };

  return (
    <GuestRoute>
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f9fa', // پس‌زمینه روشن مشابه لاگین
        p: 2,
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={4}
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            overflow: 'hidden',
            borderRadius: 3,
            minHeight: { xs: 'auto', md: '750px' }, // کمی بلندتر برای فیلدهای بیشتر
            bgcolor: 'white',
          }}
        >
          {/* Left Side: Visual/Branding (Desktop) */}
          <Box
            sx={{
              flex: 1,
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'primary.main',
              color: 'white',
              p: 6,
              position: 'relative',
              backgroundImage: 'linear-gradient(135deg, #311b92 0%, #1a237e 100%)',
            }}
          >
            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                left: -20,
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)',
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -40,
                right: -40,
                width: 250,
                height: 250,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)',
              }}
            />

            <Stack spacing={4} sx={{ zIndex: 1, textAlign: 'center' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '20px',
                  bgcolor: 'white',
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                }}
              >
                <PersonAddIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold">
                پیوستن به خانواده بزرگ
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, lineHeight: 1.8 }}>
                با ثبت‌نام در {process.env.NEXT_PUBLIC_APP_NAME_FA || "آزمون‌ساز"}، به دنیای بی‌نهایت از امکانات ارزشیابی و تحلیل داده‌ها قدم بگذارید.
                <br />
                ساده، سریع و رایگان.
              </Typography>
            </Stack>
          </Box>

          {/* Right Side: Form Area */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 4, md: 6 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: 'white',
            }}
          >
            <Stack spacing={3}>
              {/* Header */}
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                  ایجاد حساب کاربری
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  اطلاعات خود را وارد کنید تا حساب کاربری شما ساخته شود.
                </Typography>
              </Box>

              {/* Alert */}
              {error && <Alert severity="error">{error}</Alert>}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2.5}>
                  {/* Name */}
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="نام و نام‌خانوادگی"
                        fullWidth
                        autoComplete="name"
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        disabled={registerMutation.isPending}
                      />
                    )}
                  />

                  {/* Phone Number */}
                  <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="شماره موبایل"
                        fullWidth
                        error={!!errors.phone_number}
                        helperText={errors.phone_number?.message}
                        disabled={registerMutation.isPending}
                      />
                    )}
                  />

                  {/* Password */}
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="رمز عبور"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        dir="ltr"
                        autoComplete="new-password"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        disabled={registerMutation.isPending}
                      />
                    )}
                  />

                  {/* Confirm Password */}
                  <Controller
                    name="password_confirmation"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="تایید رمز عبور"
                        type={showConfirmPassword ? 'text' : 'password'}
                        fullWidth
                        dir="ltr"
                        autoComplete="new-password"
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation?.message}
                        disabled={registerMutation.isPending}
                      />
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={registerMutation.isPending}
                    sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold', mt: 2 }}
                  >
                    {registerMutation.isPending ? <CircularProgress size={24} color="inherit" /> : 'ثبت‌نام'}
                  </Button>
                </Stack>
              </form>

              {/* Footer Link */}
              <Box sx={{ mt: 2, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="body2" color="text.secondary">
                  قبلاً ثبت‌نام کرده‌اید؟{' '}
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Typography component="span" color="primary" fontWeight="bold" sx={{ cursor: 'pointer' }}>
                      وارد شوید
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
    </GuestRoute>
  );
}