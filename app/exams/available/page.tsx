"use client";

import { useRouter } from 'next/navigation';
import {
  Box, Button, Card, CardContent, Chip, Stack, Typography, Alert, CircularProgress,
} from '@mui/material';
import { useAvailableExams } from '@/hooks/useExams';
import type { AvailableExam } from '@/services/exams/ExamService';
import SchoolIcon from '@mui/icons-material/School';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Breadcrumb from '@/components/Breadcrumb';
import UserLayout from '@/components/layout/UserLayout';
import { getExamDurationMinutes } from '@/lib/exam-utils';
import { useMemo } from 'react';

export default function AvailableExamsPage() {
  const router = useRouter();
  const { data, isLoading, error } = useAvailableExams();

  const examsData = data?.data;
  const exams: AvailableExam[] = useMemo(() => {
    if (!examsData) return [];
    if (Array.isArray(examsData)) return examsData;
    return Object.values(examsData) as AvailableExam[];
  }, [examsData]);
  const getDisplayStatus = (exam: AvailableExam): string => {
    if (exam.status === 'completed') return 'completed';
    if (exam.status === 'absent') return 'absent';
    if (exam.status === 'started' || exam.status === 'registered') {
      if (exam.exam_end_at) {
        try {
          const endAt = new Date(exam.exam_end_at);
          if (new Date() > endAt) return 'time_ended';
        } catch (e) {
          console.error("Invalid date format", e);
        }
      }
    }
    return exam.status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'time_ended': return 'error';
      case 'absent': return 'error';
      case 'started': return 'warning';
      case 'registered': return 'info';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed': return 'تکمیل شده';
      case 'time_ended': return 'زمان به پایان رسیده';
      case 'absent': return 'غیبت در امتحان';
      case 'started': return 'در حال انجام';
      case 'registered': return 'ثبت‌نام شده';
      default: return status;
    }
  };

  const renderExamDateTime = (exam: AvailableExam) => {
    let dateStr = '';
    let startStr = '';
    let endStr = '';

    try {
      if (exam.exam_start_at) {
        const startAt = new Date(exam.exam_start_at);
        dateStr = startAt.toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' });
        startStr = startAt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      }
      if (exam.exam_end_at) {
        const endAt = new Date(exam.exam_end_at);
        endStr = endAt.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' });
      }
    } catch (e) {
      return null;
    }

    if (!dateStr && !startStr && !endStr) return null;

    return (
      <Stack spacing={0.5}>
        {dateStr && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">روز آزمون: {dateStr}</Typography>
          </Stack>
        )}
        <Stack direction="row" spacing={2}>
          {startStr && (
            <Stack direction="row" spacing={1} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">شروع: {startStr}</Typography>
            </Stack>
          )}
          {endStr && (
            <Stack direction="row" spacing={1} alignItems="center">
              <ScheduleIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">پایان: {endStr}</Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    );
  };

  const handleStartExam = (examId: number, displayStatus: string) => {
    if (displayStatus === 'completed') {
      router.push(`/exams/${examId}/result`);
    } else if (displayStatus === 'absent' || displayStatus === 'time_ended') {
      router.push(`/exams/${examId}/result`);
    } else {
      router.push(`/exams/take/${examId}`);
    }
  };

  return (
    <UserLayout>
      <Stack spacing={4}>
        <Breadcrumb items={[{ label: 'آزمون‌های من' }]} />
        <Box>
          <Typography variant="h4" gutterBottom>آزمون‌های من</Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>لیست آزمون‌هایی که در آن‌ها ثبت‌نام کرده‌اید</Typography>
        </Box>

        {isLoading ? (
          <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error">{error instanceof Error ? error.message : 'خطا در بارگذاری آزمون‌ها'}</Alert>
        ) : exams.length === 0 ? (
          <Card>
            <CardContent>
              <Box textAlign="center" py={4}>
                <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">هیچ آزمونی یافت نشد</Typography>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 3 }}>
            {exams.map((exam) => {
              const displayStatus = getDisplayStatus(exam);
              const isDisabled = displayStatus === 'absent' || displayStatus === 'time_ended';

              return (
                <Card
                  key={exam.id} // اصلاح شده: استفاده از ID به جای index
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 } }}
                >
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Stack spacing={2} sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <SchoolIcon color="primary" />
                        <Typography variant="h6" sx={{ flexGrow: 1 }}>{exam.title}</Typography>
                        <Chip label={getStatusLabel(displayStatus)} color={getStatusColor(displayStatus)} size="small" />
                      </Stack>

                      {exam.creator && (
                        <Typography variant="body2" color="text.secondary">ایجادکننده: {exam.creator.name}</Typography>
                      )}

                      <Stack direction="row" spacing={1}>
                        <Chip label={exam.type === 'online' ? 'آنلاین' : 'آفلاین'} size="small" variant="outlined" />
                        {getExamDurationMinutes(exam) != null && (
                          <Chip icon={<AccessTimeIcon />} label={`${getExamDurationMinutes(exam)} دقیقه`} size="small" variant="outlined" />
                        )}
                      </Stack>

                      {renderExamDateTime(exam)}
                    </Stack>

                    <Button
                      variant={displayStatus === 'completed' ? 'outlined' : 'contained'}
                      fullWidth
                      disabled={isDisabled} // اصلاح شده: غیرفعال کردن دکمه برای آزمون‌های تمام شده
                      startIcon={displayStatus === 'completed' ? <CheckCircleIcon /> : <PlayArrowIcon />}
                      onClick={() => handleStartExam(exam.id, displayStatus)}
                      sx={{ mt: 2 }}
                    >
                      {displayStatus === 'completed'
                        ? 'مشاهده نتایج'
                        : displayStatus === 'started'
                          ? 'ادامه آزمون'
                          : isDisabled
                            ? 'غیرقابل دسترسی'
                            : 'شروع آزمون'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Stack>
    </UserLayout>
  );
}