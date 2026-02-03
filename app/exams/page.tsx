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
import { ExamListItem } from '@/services/exams/ExamService';
import Breadcrumb from '@/components/Breadcrumb';
import UserLayout from '@/components/layout/UserLayout';

export default function ExamsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft'>('all');
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

  const exams: ExamListItem[] = data?.data || [];
  const meta = data?.meta;

  const handleViewExam = (examId: number) => {
    router.push(`/exams/${examId}`);
  };

  if (isLoading) {
    return (
      <UserLayout>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </UserLayout>
    );
  }

  if (error) {
    return (
      <UserLayout>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load exams. Please try again later.'}
        </Alert>
      </UserLayout>
    );
  }

  return (
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
                      setStatusFilter(e.target.value as any);
                      setPage(1);
                    }}
                  >
                    <MenuItem value="all">همه</MenuItem>
                    <MenuItem value="draft">پیش‌نویس</MenuItem>
                    <MenuItem value="completed">تکمیل شده</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>نوع</InputLabel>
                  <Select
                    value={typeFilter}
                    label="نوع"
                    onChange={(e) => {
                      setTypeFilter(e.target.value as any);
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
            {exams.map((exam) => (
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
                        {exam.status !== 'completed' && (
                      <Chip 
                            label="پیش‌نویس" 
                            color="default"
                        size="small"
                          />
                        )}
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        <Chip 
                          label={exam.type === 'online' ? 'آنلاین' : 'آفلاین'} 
                          size="small"
                          variant="outlined"
                      />
                    </Stack>

                      {exam.partner && (
                      <Typography variant="body2" color="text.secondary">
                          شریک: {exam.partner.name}
                      </Typography>
                    )}

                      {exam.creator && (
                      <Typography variant="body2" color="text.secondary">
                          ایجادکننده: {exam.creator.name}
                      </Typography>
                    )}

                      {(exam.meta && typeof exam.meta === 'object' && 'start_at' in exam.meta) && (
                    <Typography variant="body2" color="text.secondary">
                          تاریخ شروع: {new Date((exam.meta as any).start_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                      </Typography>
                    )}

                      {(exam.meta && typeof exam.meta === 'object' && 'end_at' in exam.meta) && (
                    <Typography variant="body2" color="text.secondary">
                          تاریخ پایان: {new Date((exam.meta as any).end_at).toLocaleDateString('fa-IR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                    </Typography>
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
            ))}
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
  );
}
