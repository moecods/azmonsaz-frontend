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
  Grid,
  IconButton,
} from '@mui/material';
import { useExams } from '@/hooks/useExams';
import { useRouter } from 'next/navigation';
import SchoolIcon from '@mui/icons-material/School';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { ExamListItem } from '@/services/exams/ExamService';

export default function ExamsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'draft'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error } = useExams({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    search: searchQuery || undefined,
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
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="جستجو در عنوان آزمون..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>وضعیت</InputLabel>
                  <Select
                    value={statusFilter}
                    label="وضعیت"
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">همه</MenuItem>
                    <MenuItem value="draft">پیش‌نویس</MenuItem>
                    <MenuItem value="completed">تکمیل شده</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>نوع</InputLabel>
                  <Select
                    value={typeFilter}
                    label="نوع"
                    onChange={(e) => setTypeFilter(e.target.value as any)}
                  >
                    <MenuItem value="all">همه</MenuItem>
                    <MenuItem value="offline">آفلاین</MenuItem>
                    <MenuItem value="online">آنلاین</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
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
                        <Chip 
                          label={exam.status === 'completed' ? 'تکمیل شده' : 'پیش‌نویس'} 
                          color={exam.status === 'completed' ? 'success' : 'default'}
                          size="small"
                        />
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

                      <Typography variant="body2" color="text.secondary">
                        تاریخ ایجاد: {new Date(exam.created_at).toLocaleDateString('fa-IR')}
                      </Typography>

                      {exam.completed_at && (
                        <Typography variant="body2" color="text.secondary">
                          تاریخ تکمیل: {new Date(exam.completed_at).toLocaleDateString('fa-IR')}
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

            {/* Pagination Info */}
            {meta && meta.total > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  نمایش {exams.length} از {meta.total} آزمون
                </Typography>
              </Box>
            )}
          </>
        )}
      </Stack>
    </Container>
  );
}
