import type { AvailableExam } from "@/services/exams/ExamService";
import type { ExamListItem } from "@/services/exams/ExamService";
import {
  getExamDisplayStatus,
  normalizeAvailableExams,
  type ExamDisplayStatus,
} from "@/lib/student-dashboard";

export type ProfileRole = "admin" | "content_manager" | "creator" | string;

export function isCreatorRole(roles?: string[] | null): boolean {
  if (!roles?.length) return false;
  return roles.some((r) => r === "admin" || r === "content_manager" || r === "creator");
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case "admin":
      return "مدیر";
    case "content_manager":
      return "مدیر محتوا";
    case "creator":
      return "سازنده";
    case "student":
      return "دانش‌آموز";
    default:
      return role;
  }
}

export function getRoleChipColor(
  role: string
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
  switch (role) {
    case "admin":
      return "error";
    case "content_manager":
      return "primary";
    case "creator":
      return "success";
    default:
      return "default";
  }
}

export function formatProfileDate(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export function getExamStatusLabel(status: ExamDisplayStatus): string {
  switch (status) {
    case "completed":
      return "تکمیل‌شده";
    case "time_ended":
      return "مهلت تمام‌شده";
    case "absent":
      return "غیبت";
    case "started":
      return "در حال انجام";
    case "registered":
      return "ثبت‌نام‌شده";
    default:
      return status;
  }
}

export function getExamStatusChipColor(
  status: ExamDisplayStatus
): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" {
  switch (status) {
    case "completed":
      return "success";
    case "time_ended":
    case "absent":
      return "error";
    case "started":
      return "warning";
    case "registered":
      return "info";
    default:
      return "default";
  }
}

export interface ProfileParticipationStats {
  total: number;
  completed: number;
  inProgress: number;
  upcoming: number;
  absent: number;
  timeEnded: number;
  completionRate: number;
  averagePercent: number | null;
  passedCount: number;
}

export interface ProfileCreatorStats {
  examsTotal: number;
  examsPublished: number;
  examsDraft: number;
  groupsCount: number;
}

export interface ProfileStats {
  participation: ProfileParticipationStats;
  creator?: ProfileCreatorStats;
}

export function buildProfileStats(
  availableExamsRaw: { data?: AvailableExam[] | Record<string, AvailableExam> } | undefined,
  creatorExams?: ExamListItem[] | null,
  creatorExamsTotal?: number,
  groupsCount?: number
): ProfileStats {
  const exams = normalizeAvailableExams(availableExamsRaw);

  let completed = 0;
  let inProgress = 0;
  let upcoming = 0;
  let absent = 0;
  let timeEnded = 0;
  let passedCount = 0;
  const percents: number[] = [];

  for (const exam of exams) {
    const display = getExamDisplayStatus(exam);
    switch (display) {
      case "completed":
        completed++;
        if (exam.result?.passed) passedCount++;
        if (exam.can_view_result && exam.result?.percentage != null) {
          percents.push(exam.result.percentage);
        }
        break;
      case "started":
        inProgress++;
        break;
      case "registered":
        upcoming++;
        break;
      case "absent":
        absent++;
        break;
      case "time_ended":
        timeEnded++;
        break;
      default:
        break;
    }
  }

  const total = exams.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  const averagePercent =
    percents.length > 0
      ? Math.round(percents.reduce((a, b) => a + b, 0) / percents.length)
      : null;

  const participation: ProfileParticipationStats = {
    total,
    completed,
    inProgress,
    upcoming,
    absent,
    timeEnded,
    completionRate,
    averagePercent,
    passedCount,
  };

  const creator: ProfileCreatorStats | undefined =
    creatorExams != null || groupsCount != null
      ? {
          examsTotal: creatorExamsTotal ?? creatorExams?.length ?? 0,
          examsPublished: creatorExams?.filter((e) => e.status === "published").length ?? 0,
          examsDraft: creatorExams?.filter((e) => e.status === "draft").length ?? 0,
          groupsCount: groupsCount ?? 0,
        }
      : undefined;

  return { participation, creator };
}

export function sortExamsForHistory(exams: AvailableExam[]): AvailableExam[] {
  return [...exams].sort((a, b) => {
    const aDate = a.completed_at || a.started_at || a.registered_at;
    const bDate = b.completed_at || b.started_at || b.registered_at;
    return new Date(bDate).getTime() - new Date(aDate).getTime();
  });
}

export function getExamHistoryHref(exam: AvailableExam): string {
  const status = getExamDisplayStatus(exam);
  if (status === "completed" || status === "time_ended") {
    return `/exams/${exam.id}/result`;
  }
  if (status === "started") {
    return `/exams/take/${exam.id}`;
  }
  return `/exams/available`;
}
