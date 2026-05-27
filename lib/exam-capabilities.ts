import type { ExamCapabilities, ExamWithParticipants } from "@/services/exams/ExamService";

export function getExamCapabilities(exam: ExamWithParticipants): ExamCapabilities {
  return (
    exam.capabilities ?? {
      can_manage_schedule: false,
      can_manage_content: false,
      can_grade: false,
      can_manage_participants: false,
      can_publish: false,
      can_delete: false,
      can_activate: false,
      can_deactivate: false,
      can_release_results: false,
      can_view_reports: false,
    }
  );
}
