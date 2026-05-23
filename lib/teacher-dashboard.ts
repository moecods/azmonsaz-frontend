import {
  buildWeekCalendar,
  formatExamDeadlineFromIso,
  formatExamScheduleFromIso,
  type CalendarExam,
  type WeekCalendarDay,
} from "@/lib/dashboard-calendar";
import type { CreatorDashboardExam, CreatorDashboardStats } from "@/services/exams/ExamService";

export type TeacherFocusMode = "live" | "grading" | "upcoming";

export interface TeacherFocusContext {
  exam: CreatorDashboardExam;
  mode: TeacherFocusMode;
  others: CreatorDashboardExam[];
}

export interface TeacherDashboardData {
  exams: CreatorDashboardExam[];
  stats: CreatorDashboardStats;
  liveExams: CreatorDashboardExam[];
  needsGrading: CreatorDashboardExam[];
  upcoming: CreatorDashboardExam[];
  weekCalendar: WeekCalendarDay[];
  focus: TeacherFocusContext | null;
}

function toCalendarExam(exam: CreatorDashboardExam): CalendarExam {
  const href =
    exam.pending_grading_participants_count > 0 && !exam.is_live
      ? `/exams/${exam.id}/grading`
      : `/exams/${exam.id}`;

  return {
    id: exam.id,
    title: exam.title,
    exam_start_at: exam.start_at,
    exam_end_at: exam.end_at,
    href,
  };
}

function isUpcoming(exam: CreatorDashboardExam): boolean {
  if (!exam.start_at) return false;
  try {
    return new Date() < new Date(exam.start_at);
  } catch {
    return false;
  }
}

export function getTeacherFocusContext(
  liveExams: CreatorDashboardExam[],
  needsGrading: CreatorDashboardExam[],
  upcoming: CreatorDashboardExam[]
): TeacherFocusContext | null {
  if (liveExams.length > 0) {
    const sorted = [...liveExams].sort(
      (a, b) => (b.participants_count ?? 0) - (a.participants_count ?? 0)
    );
    const [exam, ...restLive] = sorted;
    const others = [
      ...restLive,
      ...needsGrading.filter((e) => e.id !== exam.id && !e.is_live),
      ...upcoming.filter((e) => e.id !== exam.id),
    ];
    return { exam, mode: "live", others };
  }

  if (needsGrading.length > 0) {
    const sorted = [...needsGrading].sort(
      (a, b) =>
        (b.pending_grading_participants_count ?? 0) -
        (a.pending_grading_participants_count ?? 0)
    );
    const [exam, ...rest] = sorted;
    const others = [...rest, ...upcoming.filter((e) => e.id !== exam.id)];
    return { exam, mode: "grading", others };
  }

  if (upcoming.length > 0) {
    const sorted = [...upcoming].sort((a, b) => {
      const ta = a.start_at ? new Date(a.start_at).getTime() : 0;
      const tb = b.start_at ? new Date(b.start_at).getTime() : 0;
      return ta - tb;
    });
    const [exam, ...others] = sorted;
    return { exam, mode: "upcoming", others };
  }

  return null;
}

export function formatTeacherExamSchedule(exam: CreatorDashboardExam): string | null {
  return formatExamScheduleFromIso({
    id: exam.id,
    title: exam.title,
    exam_start_at: exam.start_at,
    exam_end_at: exam.end_at,
  });
}

export function formatTeacherExamDeadline(exam: CreatorDashboardExam): string | null {
  return formatExamDeadlineFromIso({
    id: exam.id,
    title: exam.title,
    exam_start_at: exam.start_at,
    exam_end_at: exam.end_at,
  });
}

export function buildTeacherDashboardData(payload: {
  exams: CreatorDashboardExam[];
  stats: CreatorDashboardStats;
}): TeacherDashboardData {
  const exams = payload.exams ?? [];
  const stats = payload.stats ?? {
    live_count: 0,
    pending_grading_exams_count: 0,
    total_published: 0,
  };

  const liveExams = exams.filter((e) => e.is_live);
  const needsGrading = exams.filter((e) => e.pending_grading_participants_count > 0);
  const upcoming = exams.filter((e) => isUpcoming(e) && !e.is_live);

  const calendarExams = exams.filter(
    (e) => e.is_live || isUpcoming(e) || e.pending_grading_participants_count > 0
  );

  return {
    exams,
    stats,
    liveExams,
    needsGrading,
    upcoming,
    weekCalendar: buildWeekCalendar(calendarExams.map(toCalendarExam)),
    focus: getTeacherFocusContext(liveExams, needsGrading, upcoming),
  };
}
