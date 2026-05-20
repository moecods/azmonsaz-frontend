"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
  Alert,
  CircularProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useExams } from '@/hooks/useExams';
import { useRouter } from 'next/navigation';
import SchoolIcon from '@mui/icons-material/School';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import ViewListIcon from '@mui/icons-material/ViewList';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
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
import ExamsCalendarView from '@/components/exams/ExamsCalendarView';
import ProtectedRoute from '@/components/ProtectedRoute';
import PageContentLoader from '@/components/layout/PageContentLoader';
import { FilterContainer } from '@/components/ui/Layout/FilterContainer';

// Helper function to check exam time status
function getExamTimeStatus(exam: ExamListItem): {
  hasTimeRestriction: boolean;
  isOngoing: boolean;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  startAt: Date | null;
  endAt: Date | null;
  examDate: string | null;
  startTime: string | null;
  endTime: string | null;
} {
  const examWithDates = exam as typeof exam & { exam_date?: string; start_time?: string; end_time?: string; start_at?: string; end_at?: string };
  let examDate = examWithDates.exam_date ?? null;
  let startTime = examWithDates.start_time ?? null;
  let endTime = examWithDates.end_time ?? null;
  let startAt: Date | null = null;
  let endAt: Date | null = null;

  if (examDate && startTime) {
    try { startAt = new Date(`${examDate}T${startTime}:00`); } catch { /* invalid */ }
  }
  if (examDate && endTime) {
    try { endAt = new Date(`${examDate}T${endTime}:00`); } catch { /* invalid */ }
  }
  if (!startAt && examWithDates.start_at) {
    try {
      startAt = new Date(examWithDates.start_at);
      if (!examDate) examDate = startAt.toISOString().split('T')[0];
      if (!startTime) startTime = startAt.toTimeString().slice(0, 5);
    } catch { /* invalid */ }
  }
  if (!endAt && examWithDates.end_at) {
    try {
      endAt = new Date(examWithDates.end_at);
      if (!endTime) endTime = endAt.toTimeString().slice(0, 5);
    } catch { /* invalid */ }
  }
  
  const hasTimeRestriction = startAt !== null || endAt !== null;
  
  if (!hasTimeRestriction) {
    return {
      hasTimeRestriction: false,
      isOngoing: false,
      isBeforeStart: false,
      isAfterEnd: false,
      startAt: null,
      endAt: null,
      examDate: null,
      startTime: null,
      endTime: null,
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
    examDate,
    startTime,
    endTime,
  };
}

export default function ExamsPage() {
  return (
    <ProtectedRoute requiredPermission="view exams">
      <ExamsPageContent />
    </ProtectedRoute>
  );
}

function ExamsPageContent() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showExtraFields, setShowExtraFields] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  const { data, isLoading, isFetching, error } = useExams({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
    page: viewMode === 'calendar' ? 1 : page,
    per_page: viewMode === 'calendar' ? 200 : 20,
  });

  const exams: ExamListItem[] = Array.isArray(data?.data) ? data.data : [];
  const meta = data?.meta;

  const handleViewExam = (examId: number) => {
    router.push(`/exams/${examId}`);
  };

  if (error) {
    return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Failed to load exams. Please try again later.'}
      </Alert>
    );
  }

  return (
    <PageContentLoader isLoading={isLoading && !data} isFetching={isFetching}>
      <Stack spacing={4}>
        <Breadcrumb items={[{ label: 'مدیریت آزمون‌ها' }]} />
        <Box>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              مدیریت آزمون‌ها
            </Typography>
            <Typography color="text.secondary">
              مشاهده و مدیریت آزمون‌های ایجاد شده
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }} alignItems="center">
            <Stack direction="row" spacing={0.5}>
              <Button
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                size="small"
                startIcon={isMobile ? undefined : <ViewListIcon />}
                onClick={() => setViewMode('list')}
              >
                {isMobile ? <ViewListIcon /> : 'لیست'}
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
                size="small"
                startIcon={isMobile ? undefined : <CalendarMonthIcon />}
                onClick={() => setViewMode('calendar')}
              >
                {isMobile ? <CalendarMonthIcon /> : 'تقویم'}
              </Button>
            </Stack>
            {isMobile ? (
              <>
                <IconButton
                  color={showFilters ? 'primary' : 'default'}
                  onClick={() => setShowFilters(!showFilters)}
                  title={showFilters ? 'مخفی کردن فیلتر' : 'نمایش فیلتر'}
                >
                  {showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
                </IconButton>
                {viewMode === 'list' && (
                  <IconButton
                    color={showExtraFields ? 'primary' : 'default'}
                    onClick={() => setShowExtraFields(!showExtraFields)}
                    title={showExtraFields ? 'مخفی کردن جزئیات' : 'نمایش جزئیات'}
                  >
                    <VisibilityIcon />
                  </IconButton>
                )}
                <IconButton
                  color="primary"
                  onClick={() => router.push('/exams/create')}
                  title="ایجاد آزمون جدید"
                >
                  <AddIcon />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  startIcon={showFilters ? <FilterListOffIcon /> : <FilterListIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'مخفی کردن فیلتر' : 'نمایش فیلتر'}
                </Button>
                {viewMode === 'list' && (
                  <Button
                    variant="outlined"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setShowExtraFields(!showExtraFields)}
                  >
                    {showExtraFields ? 'مخفی کردن جزئیات' : 'نمایش جزئیات'}
                  </Button>
                )}
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => router.push('/exams/create')}
                >
                  ایجاد آزمون جدید
                </Button>
              </>
            )}
          </Stack>
        </Box>

        {/* Filters */}
        <FilterContainer open={showFilters}>
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
        </FilterContainer>


        {/* Exams List or Calendar */}
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
        ) : viewMode === 'calendar' ? (
          <Card>
            <CardContent>
              <ExamsCalendarView exams={exams} onSelectExam={handleViewExam} />
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
                  border: '1px solid',
                  borderColor: 'divider',
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
                    {/* عنوان آزمون - عرض کامل بالای کارت */}
                    <Typography variant="h6" sx={{ width: '100%' }}>
                      {exam.title}
                    </Typography>

                    {/* بج‌ها زیر عنوان */}
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {exam.status === 'draft' && (
                        <Chip label="پیش‌نویس" color="default" size="small" />
                      )}
                      {!exam.is_active && (
                        <Chip label="غیرفعال" color="error" size="small" />
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
                      <Chip
                        label={exam.type === 'online' ? 'آنلاین' : 'آفلاین'}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>

                    {/* زمان آزمون - بدون بک‌گراند و کانتینر */}
                    {timeStatus.hasTimeRestriction && (
                      <Stack spacing={0.5}>
                        {timeStatus.examDate && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              روز آزمون: {new Date(timeStatus.examDate).toLocaleDateString('fa-IR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                          </Stack>
                        )}
                        {timeStatus.startTime && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              شروع: {timeStatus.startTime}
                            </Typography>
                          </Stack>
                        )}
                        {timeStatus.endTime && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              پایان: {timeStatus.endTime}
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
                    )}

                    {/* جزئیات - نمره قبولی، سوالات، شرکت‌کنندگان، تکمیل شده */}
                    {showExtraFields && (
                      <>
                        <Divider />
                        <Stack spacing={1}>
                          {(() => {
                            const duration = (exam as { duration_minutes?: number }).duration_minutes ?? (exam.meta as { duration_minutes?: number })?.duration_minutes;
                            const passing = (exam as { passing_score?: number }).passing_score ?? (exam.meta as { passing_score?: number })?.passing_score;
                            const hasDuration = duration != null && typeof duration === 'number';
                            const hasPassingScore = passing != null && typeof passing === 'number';
                            return (
                              <>
                                {hasDuration && (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      مدت زمان: {duration} دقیقه
                                    </Typography>
                                  </Stack>
                                )}
                                {hasPassingScore && (
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <GradeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="body2" color="text.secondary">
                                      نمره قبولی: {passing}%
                                    </Typography>
                                  </Stack>
                                )}
                              </>
                            );
                          })()}
                          <Stack direction="row" spacing={1} alignItems="center">
                            <QuizIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              سوالات: {exam.questions_count || 0}
                            </Typography>
                          </Stack>
                          {exam.status === 'published' && (
                            <>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <PeopleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  شرکت‌کنندگان: {exam.participants_count || 0}
                                </Typography>
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <CheckCircleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                <Typography variant="body2" color="text.secondary">
                                  تکمیل شده: {exam.completed_participants_count || 0}
                                </Typography>
                              </Stack>
                            </>
                          )}
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
                      </>
                    )}
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
    </PageContentLoader>
  );
}
