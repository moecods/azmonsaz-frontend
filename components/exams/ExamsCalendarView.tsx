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
  const meta = exam.meta || {};
  let startAt: Date | null = null;
  let endAt: Date | null = null;

  const examDate = meta.date && typeof meta.date === 'string' ? meta.date : null;
  const startTime = meta.start_time && typeof meta.start_time === 'string' ? meta.start_time : null;
  const endTime = meta.end_time && typeof meta.end_time === 'string' ? meta.end_time : null;

  if (examDate && startTime) {
    try {
      startAt = new Date(`${examDate}T${startTime}:00`);
    } catch {
      // invalid
    }
  }
  if (examDate && endTime) {
    try {
      endAt = new Date(`${examDate}T${endTime}:00`);
    } catch {
      // invalid
    }
  }

  if (!startAt && meta.start_at && typeof meta.start_at === 'string') {
    try {
      startAt = new Date(meta.start_at);
    } catch {
      // invalid
    }
  }
  if (!endAt && meta.end_at && typeof meta.end_at === 'string') {
    try {
      endAt = new Date(meta.end_at);
    } catch {
      // invalid
    }
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
