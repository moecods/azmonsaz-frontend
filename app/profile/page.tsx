"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks';
import { useUpdateUser } from '@/hooks';
import ProtectedRoute from '@/components/ProtectedRoute';

const profileSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست').max(255, 'ایمیل نمی‌تواند بیشتر از 255 کاراکتر باشد').optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      email: user?.email || '',
    },
  });

  const updateProfileMutation = useUpdateUser();

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    setSuccessMessage(null);
    updateProfileMutation.mutate(
      {
        id: user.id,
        data: {
          email: data.email || null,
        },
      },
      {
        onSuccess: () => {
          setSuccessMessage('ایمیل با موفقیت به‌روزرسانی شد');
          setTimeout(() => {
            setSuccessMessage(null);
          }, 3000);
        },
        onError: (error: any) => {
          console.error('Failed to update profile:', error);
        },
      }
    );
  };

  if (!user) {
    return null;
  }

  return (
    <ProtectedRoute>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" gutterBottom>
              پروفایل کاربری
            </Typography>
            <Typography variant="body2" color="text.secondary">
              می‌توانید ایمیل خود را در اینجا تغییر دهید
            </Typography>
          </Box>

          <Card>
            <CardContent>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    نام
                  </Typography>
                  <Typography variant="body1">{user.name}</Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    شماره تلفن
                  </Typography>
                  <Typography variant="body1">{user.phone_number}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    شماره تلفن قابل تغییر نیست
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    نقش
                  </Typography>
                  <Typography variant="body1">
                    {user.role === 'admin' ? 'مدیر' :
                     user.role === 'content_manager' ? 'مدیر محتوا' : 'کاربر شریک'}
                  </Typography>
                </Box>

                {successMessage && (
                  <Alert severity="success">{successMessage}</Alert>
                )}

                <form onSubmit={handleSubmit(onSubmit)}>
                  <Stack spacing={3}>
                    <Controller
                      name="email"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="ایمیل"
                          type="email"
                          fullWidth
                          placeholder="example@email.com"
                          error={!!errors.email}
                          helperText={errors.email?.message || 'ایمیل اختیاری است. می‌توانید آن را خالی بگذارید.'}
                          disabled={updateProfileMutation.isPending}
                        />
                      )}
                    />

                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => {
                          reset({ email: user.email || '' });
                          setSuccessMessage(null);
                        }}
                        disabled={updateProfileMutation.isPending}
                      >
                        انصراف
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={updateProfileMutation.isPending}
                        startIcon={updateProfileMutation.isPending ? <CircularProgress size={20} /> : null}
                      >
                        {updateProfileMutation.isPending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </ProtectedRoute>
  );
}

