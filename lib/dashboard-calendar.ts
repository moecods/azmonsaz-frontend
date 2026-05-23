/** Shared week calendar types and builders for student & teacher dashboards. */

export interface CalendarExam {
  id: number;
  title: string;
  exam_start_at?: string | null;
  exam_end_at?: string | null;
  /** Precomputed navigation target for dashboard calendar chips */
  href?: string;
}

export interface WeekCalendarExamItem {
  exam: CalendarExam;
  timeLabel: string | null;
}

export interface WeekCalendarDay {
  key: string;
  date: Date;
  weekdayLabel: string;
  dayLabel: string;
  isToday: boolean;
  exams: WeekCalendarExamItem[];
}

const TEHRAN_TZ = "Asia/Tehran";

function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function examOnDay(exam: CalendarExam, dayStart: Date, dayEnd: Date): boolean {
  let windowStart: Date | null = null;
  let windowEnd: Date | null = null;

  try {
    if (exam.exam_start_at) windowStart = new Date(exam.exam_start_at);
    if (exam.exam_end_at) windowEnd = new Date(exam.exam_end_at);
  } catch {
    return false;
  }

  if (!windowStart && !windowEnd) return false;

  const rangeStart = windowStart ?? windowEnd!;
  const rangeEnd = windowEnd ?? windowStart!;

  return rangeStart < dayEnd && rangeEnd >= dayStart;
}

function formatTimeOnDay(iso: string | null | undefined): string | null {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: TEHRAN_TZ,
    });
  } catch {
    return null;
  }
}

function calendarTimeLabel(exam: CalendarExam, dayStart: Date): string | null {
  const dayEnd = addDays(dayStart, 1);
  let start: Date | null = null;
  let end: Date | null = null;
  try {
    if (exam.exam_start_at) start = new Date(exam.exam_start_at);
    if (exam.exam_end_at) end = new Date(exam.exam_end_at);
  } catch {
    return null;
  }

  const startsToday = start !== null && start >= dayStart && start < dayEnd;
  const endsToday = end !== null && end >= dayStart && end < dayEnd;

  if (startsToday) {
    const t = formatTimeOnDay(exam.exam_start_at);
    return t ? `شروع ${t}` : "شروع";
  }
  if (endsToday) {
    const t = formatTimeOnDay(exam.exam_end_at);
    return t ? `پایان ${t}` : "پایان";
  }
  return "در جریان";
}

export function buildWeekCalendar(
  exams: CalendarExam[],
  daysCount = 7,
  filterExam?: (exam: CalendarExam) => boolean
): WeekCalendarDay[] {
  const today = startOfLocalDay(new Date());
  const activeExams = exams.filter((exam) => (filterExam ? filterExam(exam) : true));

  const days: WeekCalendarDay[] = [];

  for (let i = 0; i < daysCount; i++) {
    const date = addDays(today, i);
    const dayStart = startOfLocalDay(date);
    const dayEnd = addDays(dayStart, 1);
    const isToday = i === 0;

    const dayExams: WeekCalendarExamItem[] = [];
    for (const exam of activeExams) {
      if (examOnDay(exam, dayStart, dayEnd)) {
        dayExams.push({
          exam,
          timeLabel: calendarTimeLabel(exam, dayStart),
        });
      }
    }

    days.push({
      key: dayKey(date),
      date,
      isToday,
      weekdayLabel: date.toLocaleDateString("fa-IR", { weekday: "short", timeZone: TEHRAN_TZ }),
      dayLabel: date.toLocaleDateString("fa-IR", {
        day: "numeric",
        month: "short",
        timeZone: TEHRAN_TZ,
      }),
      exams: dayExams,
    });
  }

  return days;
}

export function formatExamScheduleFromIso(exam: CalendarExam): string | null {
  if (!exam.exam_start_at) return null;
  try {
    const start = new Date(exam.exam_start_at);
    const date = start.toLocaleDateString("fa-IR", { month: "short", day: "numeric", timeZone: TEHRAN_TZ });
    const time = start.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: TEHRAN_TZ,
    });
    return `${date} · ${time}`;
  } catch {
    return null;
  }
}

export function formatExamDeadlineFromIso(exam: CalendarExam): string | null {
  if (!exam.exam_end_at) return null;
  try {
    const end = new Date(exam.exam_end_at);
    const now = new Date();
    const diffMs = end.getTime() - now.getTime();
    if (diffMs <= 0) return "مهلت به پایان رسیده";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours >= 48) {
      const days = Math.floor(hours / 24);
      return `${days.toLocaleString("fa-IR")} روز تا پایان مهلت`;
    }
    if (hours >= 1) {
      return `${hours.toLocaleString("fa-IR")} ساعت و ${minutes.toLocaleString("fa-IR")} دقیقه مانده`;
    }
    return `${minutes.toLocaleString("fa-IR")} دقیقه مانده`;
  } catch {
    return null;
  }
}
