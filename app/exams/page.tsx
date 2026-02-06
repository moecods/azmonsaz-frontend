"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Pagination,
  Divider,
  Collapse,
} from '@mui/material';
import { useExams } from '@/hooks/useExams';
import { useRouter } from 'next/navigation';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import QuizIcon from '@mui/icons-material/Quiz';
import PeopleIcon from '@mui/icons-material/People';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GradeIcon from '@mui/icons-material/Grade';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import { ExamListItem } from '@/services/exams/ExamService';
import Breadcrumb from '@/components/Breadcrumb';
import UserLayout from '@/components/layout/UserLayout';
import ProtectedRoute from '@/components/ProtectedRoute';

// Helper function to check exam time status
function getExamTimeStatus(exam: ExamListItem): {
  hasTimeRestriction: boolean;
  isOngoing: boolean;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  startAt: Date | null;
  endAt: Date | null;
} {
  const startAt = exam.meta?.start_at && typeof exam.meta.start_at === 'string' 
    ? new Date(exam.meta.start_at) 
    : null;
  const endAt = exam.meta?.end_at && typeof exam.meta.end_at === 'string' 
    ? new Date(exam.meta.end_at) 
    : null;
  
  const hasTimeRestriction = startAt !== null || endAt !== null;
  
  if (!hasTimeRestriction) {
    return {
      hasTimeRestriction: false,
      isOngoing: false,
      isBeforeStart: false,
      isAfterEnd: false,
      startAt: null,
      endAt: null,
    };
  }
  
  const now = new Date();
  const isBeforeStart = startAt ? now < startAt : false;
  const isAfterEnd = endAt ? now > endAt : false;
  const isOngoing = !isBeforeStart && !isAfterEnd;
  
  return {
    hasTimeRestriction: true,
    isOngoing,
    isBeforeStart,
    isAfterEnd,
    startAt,
    endAt,
  };
}

export default function ExamsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data, isLoading, error } = useExams({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
    page,
    per_page: 20,
  });

  const exams: ExamListItem[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const handleViewExam = (examId: number) => {
    router.push(`/exams/${examId}`);
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="creator">
        <UserLayout>
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        </UserLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="creator">
        <UserLayout>
          <Alert severity="error">
            {error instanceof Error ? error.message : 'Failed to load exams. Please try again later.'}
          </Alert>
        </UserLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="creator">
      <UserLayout>
      <Stack spacing={4}>
        <Breadcrumb items={[{ label: 'مدیریت آزمون‌ها' }]} />
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
                مدیریت آزمون‌ها
          </Typography>
              <Typography color="text.secondary">
                مشاهده و مدیریت آزمون‌های ایجاد شده
          </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'مخفی کردن فیلتر' : 'نمایش فیلتر'}
              </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/exams/create')}
            >
                ایجاد آزمون جدید
            </Button>
            </Stack>
          </Stack>
        </Box>

        {/* Filters */}
        <Collapse in={showFilters}>
          <Card sx={{ mb: showFilters ? 0 : 0 }}>
            <CardContent>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="جستجو در عنوان آزمون..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <FormControl fullWidth>
                  <InputLabel>وضعیت</InputLabel>
                  <Select
                    value={statusFilter}
                    label="وضعیت"
                    onChange={(e) => {
                      setStatusFilter(e.target.value as 'all' | 'draft' | 'published');
                      setPage(1);
                    }}
                  >
                    <MenuItem value="all">همه</MenuItem>
                    <MenuItem value="draft">پیش‌نویس</MenuItem>
                    <MenuItem value="published">منتشر شده</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>نوع</InputLabel>
                  <Select
                    value={typeFilter}
                    label="نوع"
                    onChange={(e) => {
                      setTypeFilter(e.target.value as 'all' | 'online' | 'offline');
                      setPage(1);
                    }}
                  >
                    <MenuItem value="all">همه</MenuItem>
                    <MenuItem value="offline">آفلاین</MenuItem>
                    <MenuItem value="online">آنلاین</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Collapse>

        {/* Exams List */}
        {exams.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  آزمونی یافت نشد
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                  برای شروع، اولین آزمون خود را ایجاد کنید.
                </Typography>
                  <Button
                    variant="contained"
                  onClick={() => router.push('/exams/create')}
                    startIcon={<AddIcon />}
                >
                  ایجاد آزمون جدید
                  </Button>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <>
          <Box 
            sx={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: 3 
            }}
          >
            {exams.map((exam) => {
              const timeStatus = getExamTimeStatus(exam);
              
              return (
              <Card 
                key={exam.id}
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                    transition: 'all 0.2s ease-in-out',
                    overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                      '& .exam-action-area': {
                        bgcolor: 'primary.main',
                        '& .action-icon': {
                          color: 'primary.contrastText',
                        },
                        '& .action-text': {
                          color: 'primary.contrastText',
                        },
                      },
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Stack spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <SchoolIcon color="primary" />
                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {exam.title}
                      </Typography>
                        <Chip 
                          label={exam.status === 'published' ? 'منتشر شده' : 'پیش‌نویس'} 
                          color={exam.status === 'published' ? 'success' : 'default'}
                          size="small"
                        />
                        {!exam.is_active && (
                      <Chip 
                            label="غیرفعال" 
                            color="error"
                        size="small"
                          />
                        )}
                        {timeStatus.isOngoing && exam.status === 'published' && (
                          <Chip 
                            icon={<PlayCircleIcon />}
                            label="در حال برگزاری" 
                            color="warning"
                            size="small"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip 
                          label={exam.type === 'online' ? 'آنلاین' : 'آفلاین'} 
                          size="small"
                          variant="outlined"
                      />
                    </Stack>

                      {/* آمار اصلی */}
                      <Box sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, 
                        gap: 1.5,
                        p: 1.5,
                        bgcolor: 'grey.50',
                        borderRadius: 1
                      }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <QuizIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                          <Typography variant="body2" fontWeight="medium">
                            سوالات:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="primary.main">
                            {exam.questions_count || 0}
                          </Typography>
                        </Stack>
                        
                        {exam.status === 'published' && (
                          <>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <PeopleIcon sx={{ fontSize: 18, color: 'info.main' }} />
                              <Typography variant="body2" fontWeight="medium">
                                شرکت‌کنندگان:
                              </Typography>
                              <Typography variant="body2" fontWeight="bold" color="info.main">
                                {exam.participants_count || 0}
                              </Typography>
                            </Stack>
                            
                            {exam.completed_participants_count > 0 && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main' }} />
                                <Typography variant="body2" fontWeight="medium">
                                  تکمیل شده:
                                </Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {exam.completed_participants_count}
                                </Typography>
                              </Stack>
                            )}
                          </>
                        )}
                      </Box>

                      {/* تنظیمات آزمون */}
                      <Stack spacing={1}>
                        {exam.meta?.duration_minutes && typeof exam.meta.duration_minutes === 'number' && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              مدت زمان: {exam.meta.duration_minutes} دقیقه
                            </Typography>
                          </Stack>
                        )}
                        
                        {exam.meta?.passing_score && typeof exam.meta.passing_score === 'number' && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <GradeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              نمره قبولی: {exam.meta.passing_score}%
                            </Typography>
                          </Stack>
                        )}
                      </Stack>

                      {/* زمان برگزاری */}
                      {timeStatus.hasTimeRestriction && (
                        <Box sx={{ 
                          p: 1.5, 
                          bgcolor: timeStatus.isOngoing ? 'warning.light' : 'info.light', 
                          borderRadius: 1,
                          border: `1px solid ${timeStatus.isOngoing ? 'warning.main' : 'info.main'}`,
                        }}>
                          <Stack spacing={1}>
                            {timeStatus.isOngoing && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <PlayCircleIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                                <Typography variant="body2" fontWeight="bold" color="warning.dark">
                                  در حال برگزاری
                                </Typography>
                              </Stack>
                            )}
                            
                            {timeStatus.startAt && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  شروع: {timeStatus.startAt.toLocaleDateString('fa-IR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Stack>
                            )}
                            
                            {timeStatus.endAt && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                                  پایان: {timeStatus.endAt.toLocaleDateString('fa-IR', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </Typography>
                              </Stack>
                            )}
                            
                            {timeStatus.isBeforeStart && timeStatus.startAt && (
                              <Typography variant="caption" color="info.main" sx={{ fontStyle: 'italic' }}>
                                آزمون هنوز شروع نشده است
                      </Typography>
                    )}

                            {timeStatus.isAfterEnd && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                زمان آزمون به پایان رسیده است
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      )}

                      <Divider />

                      {/* اطلاعات اضافی */}
                      <Stack spacing={1}>
                      {exam.creator && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                          ایجادکننده: {exam.creator.name}
                      </Typography>
                          </Stack>
                    )}

                        {exam.partner && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <PersonIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              شریک: {exam.partner.name}
                            </Typography>
                          </Stack>
                        )}

                        <Stack direction="row" spacing={1} alignItems="center">
                          <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                            ایجاد: {new Date(exam.created_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                      </Typography>
                        </Stack>

                        {exam.updated_at && exam.updated_at !== exam.created_at && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                              آخرین به‌روزرسانی: {new Date(exam.updated_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                    </Typography>
                          </Stack>
                      )}
                      </Stack>
                    </Stack>
                  </CardContent>
                  
                  <Divider />
                  
                  <Box
                    className="exam-action-area"
                    onClick={() => handleViewExam(exam.id)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease-in-out',
                      bgcolor: 'action.hover',
                      '&:hover': {
                        bgcolor: 'primary.main',
                        '& .action-icon': {
                          color: 'primary.contrastText',
                        },
                        '& .action-text': {
                          color: 'primary.contrastText',
                        },
                      },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
                      <VisibilityIcon 
                        className="action-icon"
                        fontSize="small" 
                        sx={{ color: 'primary.main', transition: 'color 0.2s' }}
                      />
                      <Typography 
                        className="action-text"
                        variant="body2" 
                        fontWeight="medium" 
                        sx={{ color: 'primary.main', transition: 'color 0.2s' }}
                      >
                        مشاهده و مدیریت
                      </Typography>
                  </Stack>
                  </Box>
              </Card>
            );
            })}
          </Box>

            {/* Pagination */}
            {meta && meta.last_page > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Stack spacing={2} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                    نمایش {((meta.current_page - 1) * meta.per_page) + 1} تا {Math.min(meta.current_page * meta.per_page, meta.total)} از {meta.total} آزمون
              </Typography>
                  <Pagination
                    count={meta.last_page}
                    page={meta.current_page}
                    onChange={(_, newPage) => setPage(newPage)}
                    color="primary"
                    size="large"
                  />
            </Stack>
              </Box>
            )}
          </>
        )}
      </Stack>
    </UserLayout>
    </ProtectedRoute>
  );
}
