/** How questions are shown in bank list / pick-from-bank surfaces. */
export type QuestionBankViewMode = "bank" | "student";

export const QUESTION_BANK_VIEW_STORAGE_KEY = "azmonsaz.questionBankViewMode";
/** Exam question management list (`/exams/:id/questions`) — default student preview. */
export const EXAM_QUESTIONS_VIEW_STORAGE_KEY = "azmonsaz.examQuestionsViewMode";

export function loadQuestionBankViewMode(
  storageKey: string = QUESTION_BANK_VIEW_STORAGE_KEY,
  defaultMode: QuestionBankViewMode = "bank"
): QuestionBankViewMode {
  if (typeof window === "undefined") return defaultMode;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw === "student") return "student";
    if (raw === "bank") return "bank";
    return defaultMode;
  } catch {
    return defaultMode;
  }
}

export function saveQuestionBankViewMode(
  mode: QuestionBankViewMode,
  storageKey: string = QUESTION_BANK_VIEW_STORAGE_KEY
): void {
  try {
    localStorage.setItem(storageKey, mode);
  } catch {
    /* ignore */
  }
}
