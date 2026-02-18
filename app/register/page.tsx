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
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '@/lib/validation';
import { useRegister } from '@/hooks';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      phone_number: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    try {
      await registerMutation.mutateAsync(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'ثبت‌نام ناموفق بود. لطفا دوباره تلاش کنید.');
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
                ثبت‌نام
              </Typography>

              {error && <Alert severity="error" data-cy="register-error">{error}</Alert>}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <Controller
                    name="first_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="نام"
                        type="text"
                        fullWidth
                        autoComplete="given-name"
                        error={!!errors.first_name}
                        helperText={errors.first_name?.message}
                        disabled={registerMutation.isPending}
                        inputProps={{ 'data-cy': 'register-first-name' }}
                      />
                    )}
                  />

                  <Controller
                    name="last_name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="نام خانوادگی"
                        type="text"
                        fullWidth
                        autoComplete="family-name"
                        error={!!errors.last_name}
                        helperText={errors.last_name?.message}
                        disabled={registerMutation.isPending}
                        inputProps={{ 'data-cy': 'register-last-name' }}
                      />
                    )}
                  />

                  <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="شماره موبایل"
                        type="tel"
                        fullWidth
                        placeholder="09123456789"
                        autoComplete="tel"
                        error={!!errors.phone_number}
                        helperText={errors.phone_number?.message || 'فرمت: 09123456789 یا +989123456789'}
                        disabled={registerMutation.isPending}
                        inputProps={{ 'data-cy': 'register-phone' }}
                      />
                    )}
                  />

                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="رمز عبور"
                        type="password"
                        fullWidth
                        autoComplete="new-password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        disabled={registerMutation.isPending}
                        inputProps={{ 'data-cy': 'register-password' }}
                      />
                    )}
                  />

                  <Controller
                    name="password_confirmation"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="تایید رمز عبور"
                        type="password"
                        fullWidth
                        autoComplete="new-password"
                        error={!!errors.password_confirmation}
                        helperText={errors.password_confirmation?.message}
                        disabled={registerMutation.isPending}
                        inputProps={{ 'data-cy': 'register-password-confirmation' }}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={registerMutation.isPending}
                    data-cy="register-submit"
                  >
                    {registerMutation.isPending ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                  </Button>
                </Stack>
              </form>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  قبلاً ثبت‌نام کرده‌اید؟{' '}
                  <Link href="/login" style={{ textDecoration: 'none' }}>
                    <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
                      وارد شوید
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

