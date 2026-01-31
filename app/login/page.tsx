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
  Tabs,
  Tab,
  Divider,
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

type LoginTab = 'password' | 'otp' | 'forgot';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn } = useAuth();
  const { requestOtp, verifyOtp, isRequestingOtp, isVerifyingOtp } = useOtpLogin();
  const { requestOtp: requestForgotOtp, isRequestingOtp: isRequestingForgotOtp } = useForgotPassword();
  
  const [activeTab, setActiveTab] = useState<LoginTab>('password');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [debugCode, setDebugCode] = useState<string | null>(null);

  // Password login form
  const passwordForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone_number: '',
      password: '',
    },
  });

  // OTP login forms
  const otpRequestForm = useForm<OtpLoginRequestFormData>({
    resolver: zodResolver(otpLoginRequestSchema),
    defaultValues: {
      phone_number: '',
    },
  });

  const otpVerifyForm = useForm<OtpLoginVerifyFormData>({
    resolver: zodResolver(otpLoginVerifySchema),
    defaultValues: {
      phone_number: '',
      code: '',
    },
  });

  // Forgot password form
  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      phone_number: '',
    },
  });

  const handlePasswordLogin = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
      // Use replace instead of push to avoid back button issues
      // The delay ensures query cache is updated
      setTimeout(() => {
        router.replace('/dashboard');
      }, 150);
    } catch (err: any) {
      setError(err.message || 'ورود ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  };

  const handleOtpRequest = async (data: OtpLoginRequestFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await requestOtp(data) as any;
      setOtpSent(true);
      setSuccess('کد یکبار مصرف ارسال شد.');
      if (result?.debug_code) {
        setDebugCode(result.debug_code);
      }
      otpVerifyForm.setValue('phone_number', data.phone_number);
    } catch (err: any) {
      setError(err.message || 'ارسال کد ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  };

  const handleOtpVerify = async (data: OtpLoginVerifyFormData) => {
    setError(null);
    try {
      await verifyOtp(data);
      // Use replace instead of push to avoid back button issues
      // The delay ensures query cache is updated
      setTimeout(() => {
        router.replace('/dashboard');
      }, 150);
    } catch (err: any) {
      setError(err.message || 'کد نامعتبر است. لطفا دوباره تلاش کنید.');
    }
  };

  const handleForgotPasswordRequest = async (data: ForgotPasswordFormData) => {
    setError(null);
    setSuccess(null);
    try {
      const result = await requestForgotOtp(data) as any;
      setForgotOtpSent(true);
      setSuccess('کد بازیابی رمز عبور ارسال شد.');
      if (result?.debug_code) {
        setDebugCode(result.debug_code);
      }
    } catch (err: any) {
      setError(err.message || 'ارسال کد ناموفق بود. لطفا دوباره تلاش کنید.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card sx={{ width: '100%', maxWidth: 450 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" component="h1" textAlign="center">
                ورود به سیستم
              </Typography>

              <Tabs
                value={activeTab}
                onChange={(_, newValue) => {
                  setActiveTab(newValue);
                  setError(null);
                  setSuccess(null);
                  setOtpSent(false);
                  setForgotOtpSent(false);
                  setDebugCode(null);
                }}
                variant="fullWidth"
              >
                <Tab label="ورود با رمز عبور" value="password" />
                <Tab label="ورود با کد یکبار مصرف" value="otp" />
              </Tabs>

              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">{success}</Alert>}
              {debugCode && (
                <Alert severity="info">
                  کد تست (فقط در محیط توسعه): <strong>{debugCode}</strong>
                </Alert>
              )}

              {/* Password Login Tab */}
              {activeTab === 'password' && (
                <form onSubmit={passwordForm.handleSubmit(handlePasswordLogin)}>
                  <Stack spacing={3}>
                    <Controller
                      name="phone_number"
                      control={passwordForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="شماره تلفن"
                          type="tel"
                          fullWidth
                          placeholder="09123456789"
                          autoComplete="tel"
                          error={!!passwordForm.formState.errors.phone_number}
                          helperText={passwordForm.formState.errors.phone_number?.message || 'فرمت: 09123456789 یا +989123456789'}
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
                          type="password"
                          fullWidth
                          autoComplete="current-password"
                          error={!!passwordForm.formState.errors.password}
                          helperText={passwordForm.formState.errors.password?.message}
                          disabled={isLoggingIn}
                        />
                      )}
                    />

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? 'در حال ورود...' : 'ورود'}
                    </Button>

                    <Button
                      type="button"
                      variant="text"
                      fullWidth
                      onClick={() => {
                        setActiveTab('forgot');
                        forgotPasswordForm.setValue('phone_number', passwordForm.getValues('phone_number'));
                      }}
                    >
                      رمز عبور را فراموش کرده‌اید؟
                    </Button>
                  </Stack>
                </form>
              )}

              {/* OTP Login Tab */}
              {activeTab === 'otp' && (
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
                              label="شماره تلفن"
                              type="tel"
                              fullWidth
                              placeholder="09123456789"
                              autoComplete="tel"
                              error={!!otpRequestForm.formState.errors.phone_number}
                              helperText={otpRequestForm.formState.errors.phone_number?.message || 'فرمت: 09123456789 یا +989123456789'}
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
                        >
                          {isRequestingOtp ? 'در حال ارسال...' : 'ارسال کد یکبار مصرف'}
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
                              label="شماره تلفن"
                              type="tel"
                              fullWidth
                              disabled
                            />
                          )}
                        />

                        <Controller
                          name="code"
                          control={otpVerifyForm.control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label="کد یکبار مصرف"
                              type="text"
                              fullWidth
                              placeholder="123456"
                              inputProps={{ maxLength: 6 }}
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
                        >
                          {isVerifyingOtp ? 'در حال ورود...' : 'تایید و ورود'}
                        </Button>

                        <Button
                          type="button"
                          variant="text"
                          fullWidth
                          onClick={() => {
                            setOtpSent(false);
                            setDebugCode(null);
                          }}
                        >
                          تغییر شماره تلفن
                        </Button>
                      </Stack>
                    </form>
                  )}
                </>
              )}

              {/* Forgot Password (Modal-like) */}
              {activeTab === 'forgot' && (
                <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPasswordRequest)}>
                  <Stack spacing={3}>
                    <Typography variant="body1" textAlign="center">
                      برای بازیابی رمز عبور، شماره موبایل خود را وارد کنید.
                    </Typography>

                    <Controller
                      name="phone_number"
                      control={forgotPasswordForm.control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="شماره تلفن"
                          type="tel"
                          fullWidth
                          placeholder="09123456789"
                          autoComplete="tel"
                          error={!!forgotPasswordForm.formState.errors.phone_number}
                          helperText={forgotPasswordForm.formState.errors.phone_number?.message || 'فرمت: 09123456789 یا +989123456789'}
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
                      >
                        {isRequestingForgotOtp ? 'در حال ارسال...' : 'ارسال کد بازیابی'}
                      </Button>
                    ) : (
                      <Alert severity="success">
                        کد بازیابی ارسال شد. لطفا به صفحه تنظیم مجدد رمز عبور بروید.
                      </Alert>
                    )}

                    <Button
                      type="button"
                      variant="text"
                      fullWidth
                      onClick={() => setActiveTab('password')}
                    >
                      بازگشت به صفحه ورود
                    </Button>
                  </Stack>
                </form>
              )}

              <Divider />

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  حساب کاربری ندارید؟{' '}
                  <Link href="/register" style={{ textDecoration: 'none' }}>
                    <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
                      ثبت‌نام کنید
                    </Typography>
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
