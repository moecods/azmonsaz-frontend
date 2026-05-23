import {
  buildTeacherDashboardData,
  getTeacherFocusContext,
  type TeacherDashboardData,
} from "@/lib/teacher-dashboard";
import type { CreatorDashboardExam, CreatorDashboardPayload } from "@/services/exams/ExamService";

export interface AdminDashboardData extends TeacherDashboardData {
  isAdminView: boolean;
  focusExams: CreatorDashboardExam[];
}

export function buildAdminDashboardData(payload: CreatorDashboardPayload): AdminDashboardData {
  const base = buildTeacherDashboardData({
    exams: payload.exams ?? [],
    stats: payload.stats ?? {
      live_count: 0,
      pending_grading_exams_count: 0,
      total_published: 0,
      participants_today: 0,
      participants_next_7_days: 0,
    },
  });

  const focusExams = payload.focus_exams ?? [];
  const focusFromApi =
    focusExams.length > 0
      ? {
          exam: focusExams[0],
          mode: (focusExams[0].is_live
            ? "live"
            : focusExams[0].pending_grading_participants_count > 0
              ? "grading"
              : "upcoming") as "live" | "grading" | "upcoming",
          others: focusExams.slice(1),
        }
      : base.focus;

  return {
    ...base,
    isAdminView: payload.is_admin_view ?? true,
    focusExams,
    focus: focusFromApi ?? getTeacherFocusContext(base.liveExams, base.needsGrading, base.upcoming),
  };
}
