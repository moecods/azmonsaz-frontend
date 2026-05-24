import type { Exam, ExamQuestion } from "@/types";

type ExamWithQuestions = Exam & {
  exam_questions?: Array<{ question_id?: number | null }>;
  questions?: Array<{ question_id?: number | null }>;
};

/** Bank question IDs already attached to this exam. */
export function getInExamBankQuestionIds(
  exam: ExamWithQuestions | null | undefined
): Set<number> {
  const ids = new Set<number>();
  if (!exam) return ids;
  const rows = exam.exam_questions ?? exam.questions ?? [];
  for (const row of rows) {
    if (row.question_id != null) {
      ids.add(row.question_id);
    }
  }
  return ids;
}

export function mapExamQuestionsFromApi(
  exam: ExamWithQuestions,
  examId: number
): ExamQuestion[] {
  const examQuestionsData =
    exam.exam_questions ?? (exam.questions as ExamWithQuestions["exam_questions"]) ?? [];
  return examQuestionsData.map((eq) => ({
    id: (eq as { id: number }).id,
    exam_id: examId,
    question_id: eq.question_id ?? undefined,
    payload: (eq as { payload?: Record<string, unknown> }).payload || {},
    order:
      typeof (eq as { payload?: { order?: number } }).payload?.order === "number"
        ? (eq as { payload: { order: number } }).payload.order
        : (eq as { id: number }).id,
    created_at: (eq as { created_at?: string }).created_at || new Date().toISOString(),
    updated_at: (eq as { updated_at?: string }).updated_at || new Date().toISOString(),
    question: (eq as { question?: ExamQuestion["question"] }).question,
  }));
}
