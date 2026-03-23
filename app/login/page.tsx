"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Stack,
  Container,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  alpha,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  otpLoginRequestSchema,
  otpLoginVerifySchema,
  forgotPasswordSchema,
  LoginFormData,
  OtpLoginRequestFormData,
  OtpLoginVerifyFormData,
  ForgotPasswordFormData,
} from '@/lib/validation';
import { useAuth, useOtpLogin, useForgotPassword } from '@/hooks';
import { getErrorMessage } from '@/lib/error-handler';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import SchoolIcon from '@mui/icons-material/School';
import {toEnglishNumbers} from "@/utils/numbers";

type LoginView = 'password' | 'otp' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsync, isLoggingIn } = useAuth();
  const { requestOtp, verifyOtp, isRequestingOtp, isVerifyingOtp } = useOtpLogin();
  const { requestOtp: requestForgotOtp, isRequestingOtp: isRequestingForgotOtp } = useForgotPassword();

  const [currentView, setCurrentView] = useState<LoginView>('password');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Forms
  const passwordForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone_number: '', password: '' },
  });

  const otpRequestForm = useForm<OtpLoginRequestFormData>({
    resolver: zodResolver(otpLoginRequestSchema),
    defaultValues: { phone_number: '' },
  });

  const otpVerifyForm = useForm<OtpLoginVerifyFormData>({
    resolver: zodResolver(otpLoginVerifySchema),
    defaultValues: { phone_number: '', code: '' },
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { phone_number: '' },
  });

  // Handlers
  const handlePasswordLogin = async (data: LoginFormData) => {
    setError(null);
    try {
      data.phone_number = toEnglishNumbers(data.phone_number)
      await loginAsync(data);
      setTimeout(() => router.replace('/dashboard'), 150);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'ورود ناموفق بود. لطفا دوباره تلاش کنید.'));
    }
  };

  const handleOtpRequest = async (data: OtpLoginRequestFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const result = requestOtp(data);
      setOtpSent(true);
      setSuccess('کد یکبار مصرف ارسال شد.');
      if (result?.debug_code) {
        setDebugCode(result.debug_code);
      }
      otpVerifyForm.setValue('phone_number', data.phone_number);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'ارسال کد ناموفق بود.'));
    }
  };

  const handleOtpVerify = async (data: OtpLoginVerifyFormData) => {
    setError(null);
    try {
        verifyOtp(data);
      setTimeout(() => router.replace('/dashboard'), 150);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'کد نامعتبر است.'));
    }
  };

  const handleForgotPasswordRequest = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await requestForgotOtp(data);
      setForgotOtpSent(true);
      setSuccess('کد بازیابی ارسال شد.');
      if (result && typeof result === 'object' && 'debug_code' in result) {
        setDebugCode(result.debug_code as string);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'ارسال کد ناموفق بود.'));
    }
  };

  const switchView = (view: LoginView) => {
    setCurrentView(view);
    setError(null);
    setSuccess(null);
    setOtpSent(false);
    setForgotOtpSent(false);
    setDebugCode(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f8f9fa', // پس‌زمینه روشن و خاکستری
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
            minHeight: { xs: 'auto', md: '650px' },
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
              bgcolor: 'primary.main', // رنگ اصلی برند (بنفش)
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
                bgcolor: alpha('#ffffff', 0.1),
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
                bgcolor: alpha('#ffffff', 0.1),
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
                <SchoolIcon sx={{ fontSize: 48 }} />
              </Box>
              <Typography variant="h3" fontWeight="bold">
                  <span>پلتفرم</span>
                  <span> </span>
                  <span>{process.env.NEXT_PUBLIC_APP_NAME_FA || "آزمون‌ساز"}</span>
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 300, lineHeight: 1.8 }}>
                محیطی امن و ساده برای برگزاری آزمون‌های آنلاین.
                <br />
                مناسب برای مدارس، دانشگاه‌ها و موسسات آموزشی.
              </Typography>
            </Stack>
          </Box>

          {/* Right Side: Form Area */}
          <Box
            sx={{
              flex: 1,
              p: { xs: 4, md: 8 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              bgcolor: 'white',
            }}
          >
            <Stack spacing={4}>
              {/* Header */}
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h4" fontWeight="bold" color="text.primary" gutterBottom>
                  {currentView === 'forgot' ? 'بازیابی رمز عبور' : 'خوش آمدید'}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {currentView === 'forgot'
                    ? 'لطفا شماره موبایل خود را وارد کنید تا کد بازیابی ارسال شود.'
                    : 'لطفا برای ادامه وارد حساب کاربری خود شوید.'}
                </Typography>
              </Box>

              {/* Alerts */}
              <Stack spacing={2}>
                {error && <Alert severity="error">{error}</Alert>}
                {success && <Alert severity="success">{success}</Alert>}
                {debugCode && (
                  <Alert severity="info" sx={{ fontSize: '0.85rem' }}>
                    کد تست: <strong>{debugCode}</strong>
                  </Alert>
                )}
              </Stack>

              {/* Forms */}
              <Stack spacing={3}>
                {/* Password Login Form */}
                {currentView === 'password' && (
                  <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)}>
                    <Stack spacing={3}>
                      <Controller
                        name="phone_number"
                        control={passwordForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="tel"
                            label="شماره موبایل"
                            fullWidth
                            error={!!passwordForm.formState.errors.phone_number}
                            helperText={passwordForm.formState.errors.phone_number?.message}
                            disabled={isLoggingIn}
                          />
                        )}
                      />
                      <Controller
                        name="password"
                        control={passwordForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="رمز عبور"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                            error={!!passwordForm.formState.errors.password}
                            helperText={passwordForm.formState.errors.password?.message}
                            disabled={isLoggingIn}
                          />
                        )}
                      />
                      <Box sx={{ textAlign: 'left' }}>
                        <Button
                          size="small"
                          onClick={() => {
                            switchView('forgot');
                            forgotPasswordForm.setValue('phone_number', passwordForm.getValues('phone_number'));
                          }}
                          sx={{ fontWeight: 500 }}
                        >
                          رمز عبور را فراموش کرده‌اید؟
                        </Button>
                      </Box>
                      <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={isLoggingIn}
                        sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                      >
                        {isLoggingIn ? <CircularProgress size={24} color="inherit" /> : 'ورود به حساب'}
                      </Button>
                    </Stack>
                  </form>
                )}

                {/* OTP Login Form */}
                {currentView === 'otp' && (
                  <>
                    {!otpSent ? (
                      <form onSubmit={otpRequestForm.handleSubmit(handleOtpRequest)}>
                        <Stack spacing={3}>
                          <Controller
                            name="phone_number"
                            control={otpRequestForm.control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="شماره موبایل"
                                fullWidth
                                dir="ltr"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">+98</InputAdornment>,
                                }}
                                error={!!otpRequestForm.formState.errors.phone_number}
                                helperText={otpRequestForm.formState.errors.phone_number?.message}
                                disabled={isRequestingOtp}
                              />
                            )}
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isRequestingOtp}
                            sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            {isRequestingOtp ? <CircularProgress size={24} color="inherit" /> : 'دریافت کد ورود'}
                          </Button>
                        </Stack>
                      </form>
                    ) : (
                      <form onSubmit={otpVerifyForm.handleSubmit(handleOtpVerify)}>
                        <Stack spacing={3}>
                          <Controller
                            name="phone_number"
                            control={otpVerifyForm.control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="شماره موبایل"
                                fullWidth
                                disabled
                                dir="ltr"
                                InputProps={{
                                  startAdornment: <InputAdornment position="start">+98</InputAdornment>,
                                }}
                              />
                            )}
                          />
                          <Controller
                            name="code"
                            control={otpVerifyForm.control}
                            render={({ field }) => (
                              <TextField
                                {...field}
                                label="کد تایید"
                                fullWidth
                                placeholder="------"
                                inputProps={{ maxLength: 6, style: { letterSpacing: '0.5em', textAlign: 'center' } }}
                                error={!!otpVerifyForm.formState.errors.code}
                                helperText={otpVerifyForm.formState.errors.code?.message}
                                disabled={isVerifyingOtp}
                              />
                            )}
                          />
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={isVerifyingOtp}
                            sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                          >
                            {isVerifyingOtp ? <CircularProgress size={24} color="inherit" /> : 'تایید و ورود'}
                          </Button>
                          <Button
                            variant="text"
                            fullWidth
                            onClick={() => {
                              setOtpSent(false);
                              setDebugCode(null);
                            }}
                          >
                            ویرایش شماره موبایل
                          </Button>
                        </Stack>
                      </form>
                    )}
                  </>
                )}

                {/* Forgot Password Form */}
                {currentView === 'forgot' && (
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPasswordRequest)}>
                    <Stack spacing={3}>
                      <Controller
                        name="phone_number"
                        control={forgotPasswordForm.control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            label="شماره موبایل"
                            fullWidth
                            dir="ltr"
                            InputProps={{
                              startAdornment: <InputAdornment position="start">+98</InputAdornment>,
                            }}
                            error={!!forgotPasswordForm.formState.errors.phone_number}
                            helperText={forgotPasswordForm.formState.errors.phone_number?.message}
                            disabled={isRequestingForgotOtp || forgotOtpSent}
                          />
                        )}
                      />
                      {!forgotOtpSent ? (
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          size="large"
                          disabled={isRequestingForgotOtp}
                          sx={{ py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                        >
                          {isRequestingForgotOtp ? <CircularProgress size={24} color="inherit" /> : 'ارسال کد بازیابی'}
                        </Button>
                      ) : (
                        <Alert severity="success" sx={{ justifyContent: 'center' }}>
                          کد بازیابی با موفقیت ارسال شد.
                        </Alert>
                      )}
                      <Button
                        variant="text"
                        fullWidth
                        startIcon={<ArrowBackIcon />}
                        onClick={() => switchView('password')}
                      >
                        بازگشت به صفحه ورود
                      </Button>
                    </Stack>
                  </form>
                )}
              </Stack>

              {/* Footer Links */}
              <Box sx={{ mt: 2, textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="body2" color="text.secondary">
                  {currentView !== 'forgot' ? 'حساب کاربری ندارید؟' : 'به یاد آوردید؟'}{' '}
                  <Link href={currentView !== 'forgot' ? '/register' : '/login'} style={{ textDecoration: 'none' }}>
                    <Typography component="span" color="primary" fontWeight="bold" sx={{ cursor: 'pointer' }}>
                      {currentView !== 'forgot' ? 'ثبت‌نام کنید' : 'وارد شوید'}
                    </Typography>
                  </Link>
                </Typography>

                {currentView !== 'forgot' && (
                  <Box sx={{ mt: 2 }}>
                    <Button
                      size="small"
                      onClick={() => switchView(currentView === 'password' ? 'otp' : 'password')}
                      sx={{ color: 'text.secondary', fontSize: '0.85rem' }}
                    >
                      {currentView === 'password' ? 'ورود با کد یکبار مصرف (OTP)' : 'ورود با رمز عبور'}
                    </Button>
                  </Box>
                )}
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}