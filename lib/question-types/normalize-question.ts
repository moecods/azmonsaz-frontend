import type { Question } from "@/types";
import type { QuestionTypeId } from "./constants";
import { getQuestionTypeKind } from "./registry";

export interface NormalizedQuestion {
  type: string;
  kind: ReturnType<typeof getQuestionTypeKind>;
  text: string;
  options: unknown[];
  correct_answer: unknown;
  items: Array<string | { text?: string }>;
  correct_order: number[];
  left_items: Array<string | { text?: string }>;
  right_items: Array<string | { text?: string }>;
  matches: Array<{ left_index: number; right_index?: number; right_indices?: number[] }>;
  blanks: Array<{
    position: number;
    correct_answer?: string;
    correct_answers?: string[];
    grading?: "auto" | "manual";
  }>;
  correct_answers: string[];
  display_settings: Record<string, unknown>;
}

export function optionText(opt: unknown): string {
  if (typeof opt === "string") return opt;
  if (opt && typeof opt === "object" && "text" in opt) {
    const value = (opt as { text?: unknown }).text;
    return typeof value === "string" ? value : "";
  }
  return "";
}

/** Normalize bank `Question` or exam `payload` into one shape for display/answer widgets. */
export function normalizeQuestion(source: Record<string, unknown>): NormalizedQuestion {
  const type = String(source.type ?? source.question_type ?? "multiple_choice");
  const optionsRaw = source.options;
  const nested =
    optionsRaw && typeof optionsRaw === "object" && !Array.isArray(optionsRaw)
      ? (optionsRaw as Record<string, unknown>)
      : null;

  const items =
    (source.items as NormalizedQuestion["items"]) ??
    (nested?.items as NormalizedQuestion["items"]) ??
    [];

  const left_items =
    (source.left_items as NormalizedQuestion["left_items"]) ??
    (nested?.left_items as NormalizedQuestion["left_items"]) ??
    [];

  const right_items =
    (source.right_items as NormalizedQuestion["right_items"]) ??
    (nested?.right_items as NormalizedQuestion["right_items"]) ??
    [];

  let blanks =
    (source.blanks as NormalizedQuestion["blanks"]) ??
    (nested?.blanks as NormalizedQuestion["blanks"]) ??
    [];

  if (blanks.length === 0 && type === "fill_in_the_blank" && Array.isArray(source.correct_answer)) {
    const nestedAnswers = source.correct_answer as unknown[];
    if (nestedAnswers.length > 0 && Array.isArray(nestedAnswers[0])) {
      blanks = (nestedAnswers as string[][]).map((answers, position) => ({
        position,
        correct_answers: answers.map(String),
        grading: "auto" as const,
      }));
    }
  }

  let correct_answers: string[] = [];
  const ca = source.correct_answers ?? source.correct_answer;
  if (Array.isArray(ca)) {
    correct_answers = ca.map(String).filter((s) => s.trim() !== "");
  } else if (typeof ca === "string" && ca.trim()) {
    correct_answers = [ca];
  }

  return {
    type,
    kind: getQuestionTypeKind(type),
    text: String(source.text ?? source.question_text ?? ""),
    options: Array.isArray(optionsRaw) ? optionsRaw : [],
    correct_answer: source.correct_answer ?? null,
    items,
    correct_order:
      (source.correct_order as number[]) ??
      (type === "ordering" &&
      Array.isArray(source.correct_answer) &&
      (source.correct_answer as unknown[]).length > 0 &&
      (source.correct_answer as unknown[]).every((v) => typeof v === "number")
        ? (source.correct_answer as number[])
        : items.map((_, i) => i)),
    left_items,
    right_items,
    matches:
      (source.matches as NormalizedQuestion["matches"]) ??
      left_items.map((_, i) => ({ left_index: i, right_index: 0 })),
    blanks,
    correct_answers,
    display_settings: (source.display_settings as Record<string, unknown>) ?? {},
  };
}

export function normalizeFromQuestion(question: Question): NormalizedQuestion {
  return normalizeQuestion(question as unknown as Record<string, unknown>);
}

export function isCorrectOptionIndex(
  questionType: string,
  correctAnswer: unknown,
  idx: number
): boolean {
  if (questionType === "multiple_select" && Array.isArray(correctAnswer)) {
    return correctAnswer.includes(idx);
  }
  if (questionType === "true_false" || questionType === "multiple_choice") {
    return (
      correctAnswer === idx ||
      (Array.isArray(correctAnswer) && correctAnswer.includes(idx))
    );
  }
  return false;
}
