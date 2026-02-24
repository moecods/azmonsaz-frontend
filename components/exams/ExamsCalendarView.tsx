"use client";

import { useMemo, useState, useCallback } from 'react';
import { Calendar, dayjsLocalizer } from 'react-big-calendar';
import dayjs from 'dayjs';
import jalali from 'jalali-dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import 'dayjs/locale/fa';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box } from '@mui/material';
import { ExamListItem } from '@/services/exams/ExamService';

// Extend dayjs with Jalali (Shamsi) calendar
dayjs.extend(jalali);
dayjs.extend(updateLocale);
dayjs.locale('fa');
// تقویم شمسی: هفته از شنبه شروع می‌شود (6 = Saturday)
dayjs.updateLocale('fa', { weekStart: 6 });

const localizer = dayjsLocalizer(dayjs);

export interface ExamCalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  resource: ExamListItem;
}

function examToEvent(exam: ExamListItem): ExamCalendarEvent | null {
  const examWithDates = exam as ExamListItem & { exam_date?: string; start_time?: string; end_time?: string; start_at?: string; end_at?: string };
  let startAt: Date | null = null;
  let endAt: Date | null = null;

  if (examWithDates.exam_date && examWithDates.start_time) {
    try {
      startAt = new Date(`${examWithDates.exam_date}T${examWithDates.start_time}:00`);
    } catch { /* invalid */ }
  }
  if (examWithDates.exam_date && examWithDates.end_time) {
    try {
      endAt = new Date(`${examWithDates.exam_date}T${examWithDates.end_time}:00`);
    } catch { /* invalid */ }
  }
  if (!startAt && examWithDates.start_at) {
    try {
      startAt = new Date(examWithDates.start_at);
    } catch { /* invalid */ }
  }
  if (!endAt && examWithDates.end_at) {
    try {
      endAt = new Date(examWithDates.end_at);
    } catch { /* invalid */ }
  }

  if (!startAt) {
    startAt = new Date(exam.created_at);
  }
  if (!endAt) {
    endAt = new Date(startAt.getTime() + 60 * 60 * 1000);
  }

  return {
    id: exam.id,
    title: exam.title,
    start: startAt,
    end: endAt,
    resource: exam,
  };
}

interface ExamsCalendarViewProps {
  exams: ExamListItem[];
  onSelectExam: (examId: number) => void;
}

export default function ExamsCalendarView({ exams, onSelectExam }: ExamsCalendarViewProps) {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'agenda'>('month');

  const events = useMemo(() => {
    return exams
      .map(examToEvent)
      .filter((e): e is ExamCalendarEvent => e !== null);
  }, [exams]);

  const handleSelectEvent = (event: ExamCalendarEvent) => {
    onSelectExam(event.id);
  };

  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView: 'month' | 'week' | 'agenda') => {
    setView(newView);
  }, []);

  const messages = {
    today: 'امروز',
    previous: 'قبلی',
    next: 'بعدی',
    month: 'ماه',
    week: 'هفته',
    day: 'روز',
    agenda: 'برنامه',
    date: 'تاریخ',
    time: 'زمان',
    event: 'رویداد',
    noEventsInRange: 'در این بازه زمانی آزمونی وجود ندارد.',
    showMore: (total: number) => `+${total} بیشتر`,
  };

  return (
    <Box
      sx={{
        height: 600,
        '& .rbc-calendar': {
          fontFamily: 'inherit',
        },
        '& .rbc-header': {
          padding: '10px 3px',
        },
        '& .rbc-today': {
          backgroundColor: 'action.hover',
        },
        '& .rbc-event': {
          backgroundColor: 'primary.main',
          border: 'none',
        },
        '& .rbc-event:focus': {
          outline: 'none',
        },
      }}
    >
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        onSelectEvent={handleSelectEvent}
        messages={messages}
        date={date}
        onNavigate={handleNavigate}
        view={view}
        onView={handleViewChange}
        views={['month', 'week', 'agenda']}
        culture="fa"
        rtl
      />
    </Box>
  );
}
