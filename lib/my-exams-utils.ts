import type { AvailableExam } from "@/services/exams/ExamService";
import {
  buildStudentDashboardData,
  formatExamDeadline,
  formatExamSchedule,
  formatResultScoreLabel,
  getExamDisplayStatus,
  getFocusExamContext,
  isExamStartable,
  normalizeAvailableExams,
  type ExamDisplayStatus,
} from "@/lib/student-dashboard";
import { getExamStatusChipColor, getExamStatusLabel } from "@/lib/profile-utils";

export type MyExamsFilter =
  | "all"
  | "action"
  | "upcoming"
  | "completed"
  | "awaiting"
  | "closed";

export interface MyExamsListFilters {
  search: string;
  status: MyExamsFilter;
}

export interface MyExamAction {
  href: string;
  label: string;
  disabled: boolean;
  variant: "contained" | "outlined";
  color: "primary" | "secondary" | "success" | "warning" | "error" | "info";
}

export { normalizeAvailableExams, getExamDisplayStatus, getExamStatusLabel, getExamStatusChipColor };
export { formatExamSchedule, formatExamDeadline, formatResultScoreLabel };

export function computeMyExamsStats(exams: AvailableExam[]) {
  let inProgress = 0;
  let readyToStart = 0;
  let upcoming = 0;
  let completed = 0;
  let awaiting = 0;
  let closed = 0;

  for (const exam of exams) {
    const s = getExamDisplayStatus(exam);
    if (s === "started") inProgress++;
    else if (s === "registered" && isExamStartable(exam, s)) readyToStart++;
    else if (s === "registered") upcoming++;
    else if (s === "completed") completed++;
    else if (s === "time_ended" || s === "absent") closed++;
    if (
      (s === "completed" || s === "time_ended") &&
      !exam.can_view_result
    ) {
      awaiting++;
    }
  }

  return {
    total: exams.length,
    inProgress,
    readyToStart,
    upcoming,
    completed,
    awaiting,
    closed,
    needsAction: inProgress + readyToStart,
  };
}

function matchesSearch(exam: AvailableExam, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (exam.title.toLowerCase().includes(q)) return true;
  if (exam.creator?.name?.toLowerCase().includes(q)) return true;
  return false;
}

function matchesFilter(exam: AvailableExam, filter: MyExamsFilter): boolean {
  const s = getExamDisplayStatus(exam);
  switch (filter) {
    case "action":
      return (
        s === "started" ||
        (s === "registered" && isExamStartable(exam, s)) ||
        (exam.has_grader_notes && !!exam.can_view_result)
      );
    case "upcoming":
      return s === "registered" && !isExamStartable(exam, s);
    case "completed":
      return s === "completed";
    case "awaiting":
      return (s === "completed" || s === "time_ended") && !exam.can_view_result;
    case "closed":
      return s === "absent" || s === "time_ended";
    default:
      return true;
  }
}

export function filterMyExams(
  exams: AvailableExam[],
  filters: MyExamsListFilters
): AvailableExam[] {
  return exams.filter(
    (e) => matchesFilter(e, filters.status) && matchesSearch(e, filters.search)
  );
}

const SORT_PRIORITY: Record<ExamDisplayStatus, number> = {
  started: 1,
  registered: 2,
  completed: 3,
  time_ended: 4,
  absent: 5,
};

export function sortMyExams(exams: AvailableExam[]): AvailableExam[] {
  return [...exams].sort((a, b) => {
    const sa = getExamDisplayStatus(a);
    const sb = getExamDisplayStatus(b);
    const pa = SORT_PRIORITY[sa];
    const pb = SORT_PRIORITY[sb];
    if (pa !== pb) return pa - pb;

    if (sa === "registered" && sb === "registered") {
      const aReady = isExamStartable(a, sa) ? 0 : 1;
      const bReady = isExamStartable(b, sb) ? 0 : 1;
      if (aReady !== bReady) return aReady - bReady;
    }

    const ta = a.exam_start_at ? new Date(a.exam_start_at).getTime() : 0;
    const tb = b.exam_start_at ? new Date(b.exam_start_at).getTime() : 0;
    if (ta !== tb) return ta - tb;

    return a.title.localeCompare(b.title, "fa");
  });
}

export function getMyExamAction(exam: AvailableExam): MyExamAction {
  const displayStatus = getExamDisplayStatus(exam);

  if (displayStatus === "started") {
    return {
      href: `/exams/take/${exam.id}`,
      label: "ادامه آزمون",
      disabled: false,
      variant: "contained",
      color: "warning",
    };
  }

  if (exam.has_grader_notes && exam.can_view_result) {
    return {
      href: `/exams/${exam.id}/result`,
      label: "یادداشت معلم",
      disabled: false,
      variant: "contained",
      color: "info",
    };
  }

  if (displayStatus === "registered" && isExamStartable(exam, displayStatus)) {
    return {
      href: `/exams/take/${exam.id}`,
      label: "شروع آزمون",
      disabled: false,
      variant: "contained",
      color: "success",
    };
  }

  if (displayStatus === "completed") {
    return {
      href: `/exams/${exam.id}/result`,
      label: exam.can_view_result ? "مشاهده کارنامه" : "وضعیت نتیجه",
      disabled: false,
      variant: "outlined",
      color: exam.can_view_result ? (exam.result?.passed ? "success" : "info") : "info",
    };
  }

  if (displayStatus === "time_ended" || displayStatus === "absent") {
    return {
      href: `/exams/${exam.id}/result`,
      label: exam.can_view_result ? "مشاهده کارنامه" : "جزئیات وضعیت",
      disabled: displayStatus === "absent" && !exam.can_view_result,
      variant: "outlined",
      color: "secondary",
    };
  }

  return {
    href: `/exams/available`,
    label: "منتظر زمان شروع",
    disabled: true,
    variant: "outlined",
    color: "info",
  };
}

export function buildMyExamsDashboard(exams: AvailableExam[]) {
  return buildStudentDashboardData(exams);
}

export function getMyExamsFocus(exams: AvailableExam[]) {
  const { inProgress, upcoming } = buildStudentDashboardData(exams);
  return getFocusExamContext(inProgress, upcoming);
}
