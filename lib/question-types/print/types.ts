import type { ReactNode } from "react";
import type { NormalizedQuestion } from "../normalize-question";
import type { QuestionTypeKind } from "../registry";
import type { QuestionPrintSettings } from "../print-settings";

export type PrintQuestionVariant =
  | "default"
  | "compact"
  | "formal"
  | "playful"
  | "minimal";

export interface StudentPrintContext {
  questionId: number;
  variant: PrintQuestionVariant;
  showStemOnly?: boolean;
  printSettings?: QuestionPrintSettings;
}

/** Per-kind print strategy — teacher key text + student sheet rendering. */
export interface QuestionPrintStrategy {
  kind: QuestionTypeKind;
  /** Compact plain-text answer for teacher key sheet (no question stem). */
  formatTeacherKeyAnswer: (question: NormalizedQuestion) => string;
  /** Student exam sheet body below the stem. */
  renderStudentPrint: (
    question: NormalizedQuestion,
    context: StudentPrintContext
  ) => ReactNode;
}
