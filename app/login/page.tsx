"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { loginSchema, LoginFormData } from '@/lib/validation';
import { useAuth } from '@/hooks';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone_number: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'ورود ناموفق بود. لطفا دوباره تلاش کنید.');
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
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Typography variant="h4" component="h1" textAlign="center">
                ورود به سیستم
              </Typography>

              {error && (
                <Alert severity="error">{error}</Alert>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={3}>
                  <Controller
                    name="phone_number"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="شماره تلفن"
                        type="tel"
                        fullWidth
                        placeholder="09123456789"
                        autoComplete="tel"
                        error={!!errors.phone_number}
                        helperText={errors.phone_number?.message || 'فرمت: 09123456789 یا +989123456789'}
                        disabled={isLoading}
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
                        autoComplete="current-password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        disabled={isLoading}
                      />
                    )}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={isLoading}
                  >
                    {isLoading ? 'در حال ورود...' : 'ورود'}
                  </Button>
                </Stack>
              </form>

              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  حساب کاربری ندارید؟ با مدیر سیستم تماس بگیرید.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

