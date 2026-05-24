import {
  resolveExamCalendarWindow,
  type ExamCalendarWindow,
} from "@/lib/exam-calendar-events";
import type { ExamListItem } from "@/services/exams/ExamService";

const TEHRAN_TZ = "Asia/Tehran";

export type ExamsStatusFilter = "all" | "published" | "draft";
export type ExamsTypeFilter = "all" | "online" | "offline";
export type ExamsSort = "newest" | "oldest" | "title" | "participants_desc";

export interface ExamsListFilters {
  search: string;
  status: ExamsStatusFilter;
  type: ExamsTypeFilter;
  sort: ExamsSort;
}

export interface ExamTimeStatus {
  hasTimeRestriction: boolean;
  isOngoing: boolean;
  isBeforeStart: boolean;
  isAfterEnd: boolean;
  startAt: Date | null;
  endAt: Date | null;
  examDate: string | null;
  startTime: string | null;
  endTime: string | null;
}

export function getExamTimeStatus(exam: ExamListItem): ExamTimeStatus {
  const examWithDates = exam as ExamListItem & {
    exam_date?: string;
    start_time?: string;
    end_time?: string;
    start_at?: string;
    end_at?: string;
  };

  let examDate = examWithDates.exam_date ?? null;
  let startTime = examWithDates.start_time ?? null;
  let endTime = examWithDates.end_time ?? null;
  let startAt: Date | null = null;
  let endAt: Date | null = null;

  if (examDate && startTime) {
    try {
      startAt = new Date(`${examDate}T${startTime}:00`);
    } catch {
      /* invalid */
    }
  }
  if (examDate && endTime) {
    try {
      endAt = new Date(`${examDate}T${endTime}:00`);
    } catch {
      /* invalid */
    }
  }
  if (!startAt && examWithDates.start_at) {
    try {
      startAt = new Date(examWithDates.start_at);
      if (!examDate) examDate = startAt.toISOString().split("T")[0];
      if (!startTime) startTime = startAt.toTimeString().slice(0, 5);
    } catch {
      /* invalid */
    }
  }
  if (!endAt && examWithDates.end_at) {
    try {
      endAt = new Date(examWithDates.end_at);
      if (!endTime) endTime = endAt.toTimeString().slice(0, 5);
    } catch {
      /* invalid */
    }
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

function formatWindowLabel(window: ExamCalendarWindow): string {
  const dateLabel = window.start.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: TEHRAN_TZ,
  });

  if (window.allDay) return `${dateLabel} · تمام‌روز`;

  const startT = window.start.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TEHRAN_TZ,
  });
  const endT = window.end.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TEHRAN_TZ,
  });

  return `${dateLabel} · ${startT}–${endT}`;
}

export function formatExamScheduleSummary(exam: ExamListItem): string {
  const window = resolveExamCalendarWindow(exam);
  if (window) return formatWindowLabel(window);

  const legacy = getExamTimeStatus(exam);
  if (legacy.examDate) {
    const dateLabel = new Date(legacy.examDate).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const parts = [dateLabel];
    if (legacy.startTime) parts.push(`شروع ${legacy.startTime}`);
    if (legacy.endTime) parts.push(`پایان ${legacy.endTime}`);
    return parts.join(" · ");
  }

  return "بدون زمان‌بندی مشخص";
}

export function computeExamsStats(exams: ExamListItem[]) {
  let published = 0;
  let draft = 0;
  let ongoing = 0;
  let inactive = 0;

  for (const exam of exams) {
    if (exam.status === "published") published++;
    if (exam.status === "draft") draft++;
    if (!exam.is_active) inactive++;
    if (exam.status === "published" && getExamTimeStatus(exam).isOngoing) ongoing++;
  }

  return { published, draft, ongoing, inactive, loaded: exams.length };
}

export function sortExamsClient(exams: ExamListItem[], sort: ExamsSort): ExamListItem[] {
  const list = [...exams];
  list.sort((a, b) => {
    switch (sort) {
      case "title":
        return a.title.localeCompare(b.title, "fa");
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "participants_desc":
        return (b.participants_count ?? 0) - (a.participants_count ?? 0);
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });
  return list;
}

export function getExamStatusChips(exam: ExamListItem): Array<{
  label: string;
  color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
  variant?: "filled" | "outlined";
}> {
  const chips: Array<{
    label: string;
    color: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning";
    variant?: "filled" | "outlined";
  }> = [];

  if (exam.status === "draft") {
    chips.push({ label: "پیش‌نویس", color: "default", variant: "filled" });
  } else {
    chips.push({ label: "منتشرشده", color: "success", variant: "filled" });
  }

  if (!exam.is_active) {
    chips.push({ label: "غیرفعال", color: "error", variant: "outlined" });
  }

  const time = getExamTimeStatus(exam);
  if (exam.status === "published" && time.isOngoing) {
    chips.push({ label: "در حال برگزاری", color: "warning", variant: "filled" });
  } else if (exam.status === "published" && time.isBeforeStart) {
    chips.push({ label: "پیشِ رو", color: "info", variant: "outlined" });
  } else if (exam.status === "published" && time.isAfterEnd) {
    chips.push({ label: "پایان‌یافته", color: "default", variant: "outlined" });
  }

  chips.push({
    label: exam.type === "online" ? "آنلاین" : "آفلاین",
    color: exam.type === "online" ? "primary" : "secondary",
    variant: "outlined",
  });

  return chips;
}
