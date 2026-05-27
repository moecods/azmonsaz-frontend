import type { ExamParticipant, ExamWithParticipants } from "@/services/exams/ExamService";
import type { ExamListItem } from "@/services/exams/ExamService";
import { formatExamScheduleSummary, getExamStatusChips } from "@/lib/exams-list-utils";

export function formatExamManageDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function computeParticipantStats(participants: ExamParticipant[]) {
  const passedCount = participants.filter((p) => p.passed).length;
  const total = participants.length;
  const averageScore =
    total > 0
      ? participants.reduce((sum, p) => sum + (p.score ?? 0), 0) / total
      : 0;
  const totalPoints = participants[0]?.total_points ?? 100;
  const completedCount = participants.filter(
    (p) => p.status === "completed" || p.completed_at
  ).length;

  return { passedCount, total, averageScore, totalPoints, completedCount };
}

/** Reuse list chips for manage hero */
export function getManageExamChips(exam: ExamWithParticipants) {
  return getExamStatusChips(exam as unknown as ExamListItem);
}

export function getManageExamSchedule(exam: ExamWithParticipants) {
  return formatExamScheduleSummary(exam as unknown as ExamListItem);
}
