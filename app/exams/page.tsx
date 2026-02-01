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
} from '@mui/material';
import { useExams } from '@/hooks/useExams';
import { useRouter } from 'next/navigation';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { ExamListItem } from '@/services/exams/ExamService';
import Breadcrumb from '@/components/Breadcrumb';

export default function ExamsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

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

  const handleEditExam = (examId: number) => {
    router.push(`/exams/edit?exam_id=${examId}`);
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Failed to load exams. Please try again later.'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Breadcrumb items={[{ label: 'مدیریت آزمون‌ها' }]} />
        <Box>
          <Typography variant="h4" gutterBottom>
            مدیریت آزمون‌ها
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            مشاهده و مدیریت آزمون‌های ایجاد شده
          </Typography>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/exams/create')}
            sx={{ mb: 3 }}
          >
            ایجاد آزمون جدید
          </Button>
        </Box>

        {/* Filters */}
        <Card>
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
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
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

                      <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 2 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleViewExam(exam.id)}
                          startIcon={<VisibilityIcon />}
                          fullWidth
                        >
                          مشاهده
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleEditExam(exam.id)}
                          startIcon={<EditIcon />}
                          fullWidth
                        >
                          ویرایش
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
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
    </Container>
  );
}
