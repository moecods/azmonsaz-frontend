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
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import BarChartIcon from '@mui/icons-material/BarChart';
import HistoryIcon from '@mui/icons-material/History';
import { useAuth, useAvailableExams, useExams, useUpdateUser } from '@/hooks';
import Breadcrumb from '@/components/Breadcrumb';
import AvatarUpload from '@/components/profile/AvatarUpload';
import ShellContentLoader from '@/components/layout/ShellContentLoader';
import { useMemo } from 'react';
import { handleError } from '@/lib/error-handler';

const profileSchema = z.object({
  email: z.string().email('ایمیل معتبر نیست').max(255, 'ایمیل نمی‌تواند بیشتر از 255 کاراکتر باشد').optional().nullable(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // Fetch statistics
  const { data: examsData, isLoading: examsLoading, isFetching: examsFetching } = useExams({ per_page: 100 });
  const {
    data: availableExamsData,
    isLoading: availableExamsLoading,
    isFetching: availableExamsFetching,
  } = useAvailableExams();

  const statsLoading = examsLoading || availableExamsLoading;
  const statsFetching = examsFetching || availableExamsFetching;

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

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const completionRate = stats.totalExamsParticipated > 0 
    ? Math.round((stats.completedExams / stats.totalExamsParticipated) * 100) 
    : 0;

  return (
    <ShellContentLoader loading={statsLoading} fetching={!statsLoading && statsFetching}>
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

        {/* Profile Header Card */}
        <Card>
          <CardContent>
            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap">
              <AvatarUpload />
              <Box sx={{ flexGrow: 1, minWidth: 200 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h5" fontWeight="bold">
                    {user.name}
                  </Typography>
                  {/*<IconButton */}
                  {/*  size="small" */}
                  {/*  onClick={() => setEditMode(!editMode)}*/}
                  {/*  color={editMode ? 'primary' : 'default'}*/}
                  {/*>*/}
                  {/*  <EditIcon />*/}
                  {/*</IconButton>*/}
                </Stack>
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
                <Stack direction="row" spacing={3} sx={{ mt: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PhoneIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {user.phone_number}
                    </Typography>
                  </Stack>
                  {user.email && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <EmailIcon fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab icon={<PersonIcon />} iconPosition="start" label="اطلاعات شخصی" />
              <Tab icon={<BarChartIcon />} iconPosition="start" label="آمار فعالیت" />
              <Tab icon={<SettingsIcon />} iconPosition="start" label="تنظیمات" />
              <Tab icon={<HistoryIcon />} iconPosition="start" label="تاریخچه" />
            </Tabs>
          </Box>

          {/* Personal Information Tab */}
          <TabPanel value={tabValue} index={0}>
            <CardContent>
              <Stack spacing={3}>
                {successMessage && (
                  <Alert severity="success">{successMessage}</Alert>
                )}

                <Box>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <PhoneIcon color="action" />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        شماره تلفن
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {user.phone_number}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        شماره تلفن قابل تغییر نیست
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="h6" gutterBottom>
                    ویرایش ایمیل
                  </Typography>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
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
          </TabPanel>

          {/* Statistics Tab */}
          <TabPanel value={tabValue} index={1}>
            <CardContent>
              <Grid container spacing={3}>
                {isCreator && (
                  <Grid item xs={12} sm={6} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Typography variant="h3" fontWeight="bold">
                        {stats.totalExamsCreated}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        آزمون‌های ایجاد شده
                      </Typography>
                    </Paper>
                  </Grid>
                )}
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'info.light', color: 'info.contrastText' }}>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.totalExamsParticipated}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      آزمون‌های ثبت‌نام شده
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light', color: 'success.contrastText' }}>
                    <Typography variant="h3" fontWeight="bold">
                      {stats.completedExams}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      آزمون‌های تکمیل شده
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        نرخ تکمیل آزمون‌ها
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                          <Typography variant="body2">{completionRate}%</Typography>
                          <Typography variant="body2">
                            {stats.completedExams} از {stats.totalExamsParticipated}
                          </Typography>
                        </Stack>
                        <LinearProgress 
                          variant="determinate" 
                          value={completionRate} 
                          sx={{ height: 10, borderRadius: 5 }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </TabPanel>

          {/* Settings Tab */}
          <TabPanel value={tabValue} index={2}>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h6">تنظیمات</Typography>
                <Alert severity="info">
                  تنظیمات بیشتر به زودی اضافه خواهد شد.
                </Alert>
              </Stack>
            </CardContent>
          </TabPanel>

          {/* History Tab */}
          <TabPanel value={tabValue} index={3}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">تاریخچه فعالیت</Typography>
                <Alert severity="info">
                  تاریخچه فعالیت‌ها به زودی اضافه خواهد شد.
                </Alert>
              </Stack>
            </CardContent>
          </TabPanel>
        </Card>
      </Stack>
    </ShellContentLoader>
  );
}

