import type { AvailableExam } from "@/services/exams/ExamService";
import { isDescriptiveGradingMode } from "@/lib/grading";
import {
  buildWeekCalendar as buildWeekCalendarDays,
  type CalendarExam,
  type WeekCalendarDay,
  type WeekCalendarExamItem,
} from "@/lib/dashboard-calendar";

export type { WeekCalendarDay, WeekCalendarExamItem };

export type ExamDisplayStatus =
  | "registered"
  | "started"
  | "completed"
  | "absent"
  | "time_ended";

export type DashboardActionKind =
  | "continue_exam"
  | "start_exam"
  | "view_result"
  | "grader_notes"
  | "awaiting_result";

export interface DashboardAction {
  kind: DashboardActionKind;
  exam: AvailableExam;
  displayStatus: ExamDisplayStatus;
  title: string;
  subtitle: string;
  priority: number;
  ctaLabel: string;
  href: string;
  severity: "error" | "warning" | "info" | "success";
}

export type FocusExamMode = "continue" | "start" | "scheduled";

export interface FocusExamContext {
  exam: AvailableExam;
  mode: FocusExamMode;
  /** Other active exams (not the focus card). */
  others: AvailableExam[];
}

export interface StudentDashboardData {
  exams: AvailableExam[];
  actions: DashboardAction[];
  upcoming: AvailableExam[];
  inProgress: AvailableExam[];
  recentResults: AvailableExam[];
  awaitingResults: AvailableExam[];
  weekCalendar: WeekCalendarDay[];
  focus: FocusExamContext | null;
}

export function getFocusExamContext(
  inProgress: AvailableExam[],
  upcoming: AvailableExam[]
): FocusExamContext | null {
  if (inProgress.length > 0) {
    const [exam, ...restStarted] = inProgress;
    const others = [...restStarted, ...upcoming];
    return { exam, mode: "continue", others };
  }

  const startable = upcoming.filter((e) => isExamStartable(e, "registered"));
  if (startable.length > 0) {
    const [exam, ...rest] = startable;
    const others = [...rest, ...upcoming.filter((e) => e.id !== exam.id)];
    return { exam, mode: "start", others };
  }

  if (upcoming.length > 0) {
    const [exam, ...others] = upcoming;
    return { exam, mode: "scheduled", others };
  }

  return null;
}

function toCalendarExam(exam: AvailableExam): CalendarExam {
  const status = getExamDisplayStatus(exam);
  let href = `/exams/take/${exam.id}`;
  if (status === "completed" || status === "time_ended") {
    href = `/exams/${exam.id}/result`;
  }
  return {
    id: exam.id,
    title: exam.title,
    exam_start_at: exam.exam_start_at,
    exam_end_at: exam.exam_end_at,
    href,
  };
}

export function buildWeekCalendar(exams: AvailableExam[], daysCount = 7): WeekCalendarDay[] {
  const active = exams.filter((exam) => {
    const status = getExamDisplayStatus(exam);
    return status === "registered" || status === "started";
  });
  return buildWeekCalendarDays(active.map(toCalendarExam), daysCount);
}

export function normalizeAvailableExams(
  data: { data?: AvailableExam[] | Record<string, AvailableExam> } | undefined
): AvailableExam[] {
  const raw = data?.data;
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return Object.values(raw);
}

export function getExamDisplayStatus(exam: AvailableExam): ExamDisplayStatus {
  if (exam.status === "completed") return "completed";
  if (exam.status === "absent") return "absent";
  if (exam.status === "started" || exam.status === "registered") {
    if (exam.exam_end_at) {
      try {
        if (new Date() > new Date(exam.exam_end_at)) return "time_ended";
      } catch {
        /* ignore */
      }
    }
  }
  return exam.status;
}

export function isExamStartable(exam: AvailableExam, displayStatus: ExamDisplayStatus): boolean {
  if (displayStatus !== "registered") return false;
  if (exam.exam_start_at) {
    try {
      return new Date() >= new Date(exam.exam_start_at);
    } catch {
      return true;
    }
  }
  return true;
}

export function formatExamDeadline(exam: AvailableExam): string | null {
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

export function formatExamSchedule(exam: AvailableExam): string | null {
  if (!exam.exam_start_at) return null;
  try {
    const start = new Date(exam.exam_start_at);
    const date = start.toLocaleDateString("fa-IR", {
      month: "short",
      day: "numeric",
    });
    const time = start.toLocaleTimeString("fa-IR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${date} · ${time}`;
  } catch {
    return null;
  }
}

export function formatResultScoreLabel(exam: AvailableExam): string | null {
  const r = exam.result;
  if (!r || !exam.can_view_result) return null;
  if (isDescriptiveGradingMode(exam.grading_mode) && r.outcome_label) {
    if (r.scaled_score != null) {
      return `${r.outcome_label} · نمره ${r.scaled_score.toLocaleString("fa-IR")}`;
    }
    return r.outcome_label;
  }
  return `${r.percentage.toLocaleString("fa-IR")}٪ (${r.score}/${r.total_points})`;
}

function buildAction(
  exam: AvailableExam,
  kind: DashboardActionKind,
  displayStatus: ExamDisplayStatus,
  title: string,
  subtitle: string,
  priority: number,
  ctaLabel: string,
  href: string,
  severity: DashboardAction["severity"]
): DashboardAction {
  return {
    kind,
    exam,
    displayStatus,
    title,
    subtitle,
    priority,
    ctaLabel,
    href,
    severity,
  };
}

export function buildStudentDashboardData(exams: AvailableExam[]): StudentDashboardData {
  const withStatus = exams.map((exam) => ({
    exam,
    displayStatus: getExamDisplayStatus(exam),
  }));

  const actions: DashboardAction[] = [];

  for (const { exam, displayStatus } of withStatus) {
    if (displayStatus === "started") {
      actions.push(
        buildAction(
          exam,
          "continue_exam",
          displayStatus,
          exam.title,
          formatExamDeadline(exam) ?? "آزمون را ادامه دهید",
          1,
          "ادامه آزمون",
          `/exams/take/${exam.id}`,
          "warning"
        )
      );
      continue;
    }

    if (exam.has_grader_notes && exam.can_view_result) {
      actions.push(
        buildAction(
          exam,
          "grader_notes",
          displayStatus,
          exam.title,
          "یادداشت معلم را ببینید یا تأیید کنید",
          2,
          "مشاهده یادداشت",
          `/exams/${exam.id}/result`,
          "info"
        )
      );
    }

    if (displayStatus === "registered" && isExamStartable(exam, displayStatus)) {
      actions.push(
        buildAction(
          exam,
          "start_exam",
          displayStatus,
          exam.title,
          formatExamDeadline(exam) ?? "آماده شرکت در آزمون",
          3,
          "شروع آزمون",
          `/exams/take/${exam.id}`,
          "success"
        )
      );
    }

    if (displayStatus === "completed" && exam.can_view_result) {
      const scoreLabel = formatResultScoreLabel(exam);
      actions.push(
        buildAction(
          exam,
          "view_result",
          displayStatus,
          exam.title,
          scoreLabel ?? "کارنامه آماده است",
          4,
          "مشاهده کارنامه",
          `/exams/${exam.id}/result`,
          exam.result?.passed ? "success" : "info"
        )
      );
    }

    if (
      (displayStatus === "completed" || displayStatus === "time_ended") &&
      !exam.can_view_result
    ) {
      actions.push(
        buildAction(
          exam,
          "awaiting_result",
          displayStatus,
          exam.title,
          exam.result_message ??
            (exam.pending_grading_count
              ? `${exam.pending_grading_count.toLocaleString("fa-IR")} سوال در انتظار تصحیح`
              : "نتیجه به‌زودی منتشر می‌شود"),
          5,
          "جزئیات",
          `/exams/${exam.id}/result`,
          "info"
        )
      );
    }
  }

  actions.sort((a, b) => a.priority - b.priority);

  const seenExamIds = new Set<number>();
  const dedupedActions: DashboardAction[] = [];
  for (const action of actions) {
    if (seenExamIds.has(action.exam.id)) continue;
    seenExamIds.add(action.exam.id);
    dedupedActions.push(action);
  }

  const upcoming = withStatus
    .filter(({ displayStatus, exam }) => {
      if (displayStatus !== "registered") return false;
      if (!exam.exam_start_at) return true;
      try {
        return new Date() < new Date(exam.exam_start_at);
      } catch {
        return true;
      }
    })
    .map(({ exam }) => exam)
    .slice(0, 6);

  const inProgress = withStatus
    .filter(({ displayStatus }) => displayStatus === "started")
    .map(({ exam }) => exam);

  const recentResults = withStatus
    .filter(({ exam, displayStatus }) => displayStatus === "completed" && exam.can_view_result)
    .sort((a, b) => {
      const unseenA = a.exam.is_result_unseen ? 1 : 0;
      const unseenB = b.exam.is_result_unseen ? 1 : 0;
      if (unseenB !== unseenA) return unseenB - unseenA;
      const ta = a.exam.completed_at ? new Date(a.exam.completed_at).getTime() : 0;
      const tb = b.exam.completed_at ? new Date(b.exam.completed_at).getTime() : 0;
      return tb - ta;
    })
    .map(({ exam }) => exam)
    .slice(0, 5);

  const awaitingResults = withStatus
    .filter(
      ({ exam, displayStatus }) =>
        (displayStatus === "completed" || displayStatus === "time_ended") && !exam.can_view_result
    )
    .slice(0, 5)
    .map(({ exam }) => exam);

  return {
    exams,
    actions: dedupedActions.slice(0, 6),
    upcoming,
    inProgress,
    recentResults: recentResults.slice(0, 4),
    awaitingResults: awaitingResults.slice(0, 3),
    weekCalendar: buildWeekCalendar(exams),
    focus: getFocusExamContext(inProgress, upcoming),
  };
}
