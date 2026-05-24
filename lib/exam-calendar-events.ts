import { EXAM_SCHEDULE_LABELS } from "@/lib/exam-form-labels";
import type { ExamListItem } from "@/services/exams/ExamService";

const TEHRAN_TZ = "Asia/Tehran";

export type ExamScheduleType =
  | "none"
  | "fixed_window"
  | "duration_only"
  | "registration_deadline"
  | "flexible_until";

export interface ExamCalendarWindow {
  start: Date;
  end: Date;
  allDay: boolean;
}

export interface ExamCalendarPlacement {
  exam: ExamListItem;
  window: ExamCalendarWindow;
  scheduleType: ExamScheduleType;
  timeLabel: string | null;
  scheduleLabel: string;
}

function parseIso(value: string | null | undefined): Date | null {
  if (!value) return null;
  try {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function normalizeWindow(
  start: Date | null,
  end: Date | null,
  allDay: boolean
): ExamCalendarWindow | null {
  if (!start && !end) return null;

  const resolvedStart = start ?? end!;
  let resolvedEnd = end ?? start!;

  if (resolvedEnd.getTime() <= resolvedStart.getTime()) {
    resolvedEnd = new Date(resolvedStart.getTime() + (allDay ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000));
  }

  return { start: resolvedStart, end: resolvedEnd, allDay };
}

export function resolveExamCalendarWindow(exam: ExamListItem): ExamCalendarWindow | null {
  const schedule = (exam.schedule_type ?? "fixed_window") as ExamScheduleType;

  if (schedule === "none") return null;

  const calendarStart = parseIso(exam.calendar_start_at);
  const calendarEnd = parseIso(exam.calendar_end_at);
  if (calendarStart || calendarEnd) {
    return normalizeWindow(calendarStart, calendarEnd, exam.calendar_all_day ?? false);
  }

  if (schedule === "flexible_until") {
    return normalizeWindow(
      parseIso(exam.available_from),
      parseIso(exam.due_by),
      true
    );
  }

  let start = parseIso(exam.start_at);
  let end = parseIso(exam.end_at);

  if (!start && exam.exam_date && exam.start_time) {
    start = parseIso(`${exam.exam_date}T${exam.start_time}:00`);
  }
  if (!end && exam.exam_date && exam.end_time) {
    end = parseIso(`${exam.exam_date}T${exam.end_time}:00`);
  }

  return normalizeWindow(start, end, false);
}

export function startOfLocalDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Week starts on Saturday (Iran). */
export function startOfWeekSaturday(date: Date): Date {
  const day = startOfLocalDay(date);
  const weekday = day.getDay();
  const daysFromSaturday = (weekday + 1) % 7;
  return addDays(day, -daysFromSaturday);
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function examOverlapsDay(window: ExamCalendarWindow, dayStart: Date, dayEnd: Date): boolean {
  return window.start < dayEnd && window.end >= dayStart;
}

function formatTime(iso: Date): string {
  return iso.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TEHRAN_TZ,
  });
}

export function calendarTimeLabel(window: ExamCalendarWindow, dayStart: Date): string | null {
  if (window.allDay) return "تمام‌روز";

  const dayEnd = addDays(dayStart, 1);
  const startsToday = window.start >= dayStart && window.start < dayEnd;
  const endsToday = window.end >= dayStart && window.end < dayEnd;

  if (startsToday && endsToday) {
    return `${formatTime(window.start)} – ${formatTime(window.end)}`;
  }
  if (startsToday) return `شروع ${formatTime(window.start)}`;
  if (endsToday) return `پایان ${formatTime(window.end)}`;
  return "در جریان";
}

export function formatWeekRangeLabel(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  const startLabel = weekStart.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "long",
    timeZone: TEHRAN_TZ,
  });
  const endLabel = weekEnd.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TEHRAN_TZ,
  });
  return `${startLabel} – ${endLabel}`;
}

export function buildExamPlacementsForDay(
  exams: ExamListItem[],
  dayStart: Date
): ExamCalendarPlacement[] {
  const dayEnd = addDays(dayStart, 1);
  const placements: ExamCalendarPlacement[] = [];

  for (const exam of exams) {
    const window = resolveExamCalendarWindow(exam);
    if (!window || !examOverlapsDay(window, dayStart, dayEnd)) continue;

    const scheduleType = (exam.schedule_type ?? "fixed_window") as ExamScheduleType;
    placements.push({
      exam,
      window,
      scheduleType,
      timeLabel: calendarTimeLabel(window, dayStart),
      scheduleLabel: EXAM_SCHEDULE_LABELS[scheduleType] ?? scheduleType,
    });
  }

  placements.sort((a, b) => a.window.start.getTime() - b.window.start.getTime());
  return placements;
}

export interface ExamWeekDay {
  key: string;
  date: Date;
  weekdayLabel: string;
  dayLabel: string;
  isToday: boolean;
  placements: ExamCalendarPlacement[];
}

export function buildExamWeekDays(
  exams: ExamListItem[],
  weekStart: Date
): ExamWeekDay[] {
  const todayKey = dayKey(startOfLocalDay(new Date()));
  const days: ExamWeekDay[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const dayStart = startOfLocalDay(date);
    const key = dayKey(dayStart);

    days.push({
      key,
      date: dayStart,
      weekdayLabel: dayStart.toLocaleDateString("fa-IR", {
        weekday: "short",
        timeZone: TEHRAN_TZ,
      }),
      dayLabel: dayStart.toLocaleDateString("fa-IR", {
        day: "numeric",
        month: "short",
        timeZone: TEHRAN_TZ,
      }),
      isToday: key === todayKey,
      placements: buildExamPlacementsForDay(exams, dayStart),
    });
  }

  return days;
}

export interface ExamAgendaGroup {
  key: string;
  date: Date;
  weekdayLabel: string;
  dayLabel: string;
  isToday: boolean;
  placements: ExamCalendarPlacement[];
}

export function buildExamAgendaGroups(
  exams: ExamListItem[],
  rangeStart: Date,
  rangeEnd: Date
): ExamAgendaGroup[] {
  const groups: ExamAgendaGroup[] = [];
  const todayKey = dayKey(startOfLocalDay(new Date()));
  let cursor = startOfLocalDay(rangeStart);
  const end = startOfLocalDay(rangeEnd);

  while (cursor <= end) {
    const placements = buildExamPlacementsForDay(exams, cursor);
    if (placements.length > 0) {
      groups.push({
        key: dayKey(cursor),
        date: cursor,
        weekdayLabel: cursor.toLocaleDateString("fa-IR", {
          weekday: "long",
          timeZone: TEHRAN_TZ,
        }),
        dayLabel: cursor.toLocaleDateString("fa-IR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: TEHRAN_TZ,
        }),
        isToday: dayKey(cursor) === todayKey,
        placements,
      });
    }
    cursor = addDays(cursor, 1);
  }

  return groups;
}

export function listUnscheduledExams(exams: ExamListItem[]): ExamListItem[] {
  return exams.filter((exam) => resolveExamCalendarWindow(exam) === null);
}
