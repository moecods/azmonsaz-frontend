"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Grid,
  Chip,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import { useAuth, useAvailableExams, useExams, useUpdateUser } from '@/hooks';
import UserLayout from '@/components/layout/UserLayout';
import Breadcrumb from '@/components/Breadcrumb';
import { useMemo } from 'react';
import { handleError } from '@/lib/error-handler';

const profileSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست').max(255, 'ایمیل نمی‌تواند بیشتر از 255 کاراکتر باشد').optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch statistics
  const { data: examsData } = useExams({ per_page: 100 });
  const { data: availableExamsData } = useAvailableExams();

  const stats = useMemo(() => {
    const exams = examsData?.data || [];
    // Convert object to array if needed (in case backend returns object with numeric keys)
    const availableExamsDataValue = availableExamsData?.data;
    const availableExams = Array.isArray(availableExamsDataValue) 
      ? availableExamsDataValue 
      : availableExamsDataValue && typeof availableExamsDataValue === 'object' 
      ? Object.values(availableExamsDataValue) 
      : [];
    const isCreator = user?.roles?.includes('admin') || 
                     user?.roles?.includes('content_manager') || 
                     user?.roles?.includes('creator');

    return {
      totalExamsCreated: isCreator ? exams.length : 0,
      totalExamsParticipated: availableExams.length,
      completedExams: availableExams.filter((e: any) => e.status === 'completed').length,
    };
  }, [examsData, availableExamsData, user]);

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
        onError: (error: unknown) => {
          handleError(error, { context: 'Update Profile' });
        },
      }
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'مدیر';
      case 'content_manager':
        return 'مدیر محتوا';
      case 'creator':
        return 'سازنده';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'content_manager':
        return 'primary';
      case 'creator':
        return 'success';
      default:
        return 'default';
    }
  };

  if (!user) {
    return null;
  }

  const isCreator = user.roles?.includes('admin') || 
                   user.roles?.includes('content_manager') || 
                   user.roles?.includes('creator');

  return (
    <UserLayout>
        <Stack spacing={4}>
        <Breadcrumb items={[{ label: 'پروفایل' }]} />
        
          <Box>
          <Typography variant="h4" gutterBottom fontWeight="bold">
              پروفایل کاربری
            </Typography>
            <Typography variant="body2" color="text.secondary">
            مشاهده و ویرایش اطلاعات پروفایل
            </Typography>
          </Box>

        <Grid container spacing={3}>
          {/* Profile Info Card */}
          <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
                <Stack spacing={4}>
                  {/* Avatar and Basic Info */}
                  <Box>
                    <Stack direction="row" spacing={3} alignItems="center">
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: 'primary.main',
                          fontSize: '2rem',
                          fontWeight: 'bold',
                        }}
                      >
                        {getInitials(user.name)}
                      </Avatar>
                <Box>
                        <Typography variant="h5" fontWeight="bold">
                          {user.name}
                  </Typography>
                        {user.roles && user.roles.length > 0 && (
                          <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                            {user.roles.map((role) => (
                              <Chip
                                key={role}
                                label={getRoleLabel(role)}
                                size="small"
                                color={getRoleColor(role)}
                              />
                            ))}
                          </Stack>
                        )}
                      </Box>
                    </Stack>
                </Box>

                  <Divider />

                  {/* User Information */}
                  <Stack spacing={3}>
                <Box>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <PhoneIcon color="action" />
                        <Typography variant="body2" color="text.secondary">
                    شماره تلفن
                  </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ mr: 5 }}>
                        {user.phone_number}
                      </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    شماره تلفن قابل تغییر نیست
                  </Typography>
                </Box>

                <Box>
                      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                        <EmailIcon color="action" />
                        <Typography variant="body2" color="text.secondary">
                          ایمیل
                  </Typography>
                      </Stack>
                      <Typography variant="body1" sx={{ mr: 5 }}>
                        {user.email || 'ثبت نشده'}
                  </Typography>
                </Box>
                  </Stack>

                  <Divider />

                  {/* Email Edit Form */}
                {successMessage && (
                  <Alert severity="success">{successMessage}</Alert>
                )}

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      ویرایش ایمیل
                    </Typography>
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
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Statistics Card */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  آمار فعالیت
                </Typography>
                <Stack spacing={3} sx={{ mt: 2 }}>
                  {isCreator && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        آزمون‌های ایجاد شده
                      </Typography>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {stats.totalExamsCreated}
                      </Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      آزمون‌های ثبت‌نام شده
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {stats.totalExamsParticipated}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      آزمون‌های تکمیل شده
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {stats.completedExams}
                    </Typography>
                  </Box>
              </Stack>
            </CardContent>
          </Card>
          </Grid>
        </Grid>
        </Stack>
    </UserLayout>
  );
}

