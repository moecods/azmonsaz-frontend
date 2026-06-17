import { getOptionLabel } from "../display-settings";
import { normalizeQuestion } from "../normalize-question";
import { isEssay } from "../registry";
import type { QuestionTypeKind } from "../registry";
import type { NormalizedQuestion } from "../normalize-question";
import { isCorrectOptionId, optionIdFromUnknown } from "@/lib/option-ids";
import type { QuestionPrintStrategy } from "./types";

const PERSIAN_LABELS = ["الف", "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "د"];

function optionLabelAt(index: number): string {
  return PERSIAN_LABELS[index] ?? getOptionLabel(index, "persian").replace(".", "");
}

function formatOptionsKey(question: NormalizedQuestion): string {
  const labels = question.options
    .map((opt, idx) => {
      const id = optionIdFromUnknown(opt, idx);
      return isCorrectOptionId(question.type, question.correct_answer, id) ? optionLabelAt(idx) : null;
    })
    .filter(Boolean);
  return labels.length > 0 ? labels.join("، ") : "—";
}

function formatMatchingKey(question: NormalizedQuestion): string {
  if (question.matches.length === 0) return "—";
  const matchByLeft = new Map(question.matches.map((m) => [m.left_index, m] as const));
  return question.left_items
    .map((_, leftIdx) => {
      const m = matchByLeft.get(leftIdx);
      const rights = m?.right_indices ?? (m?.right_index != null ? [m.right_index] : []);
      const letters = rights.map((ri) => optionLabelAt(ri)).join("،") || "—";
      return `${leftIdx + 1}→${letters}`;
    })
    .join("؛ ");
}

function formatOrderingKey(question: NormalizedQuestion): string {
  if (question.correct_order.length === 0) return "—";
  return question.correct_order.map((idx) => String(idx + 1)).join("، ");
}

function formatBlanksKey(question: NormalizedQuestion): string {
  if (question.blanks.length === 0) return "—";
  return question.blanks
    .map((b, i) => {
      const answers = b.correct_answers ?? (b.correct_answer ? [b.correct_answer] : []);
      if (b.grading === "manual" || answers.length === 0) return `${i + 1}: دستی`;
      return `${i + 1}: ${answers.join(" / ")}`;
    })
    .join("؛ ");
}

function formatShortAnswerKey(question: NormalizedQuestion): string {
  const answers =
    question.correct_answers.length > 0
      ? question.correct_answers
      : typeof question.correct_answer === "string" && question.correct_answer.trim()
        ? [question.correct_answer]
        : [];
  return answers.length > 0 ? answers.join(" / ") : "تصحیح دستی";
}

function formatEssayKey(): string {
  return "تصحیح دستی";
}

type TeacherKeyFormatter = (question: NormalizedQuestion) => string;

const teacherKeyByKind: Record<QuestionTypeKind, TeacherKeyFormatter> = {
  options_single: (q) => (q.options.length > 0 ? formatOptionsKey(q) : "—"),
  options_multiple: (q) => (q.options.length > 0 ? formatOptionsKey(q) : "—"),
  options_fixed: (q) => (q.options.length > 0 ? formatOptionsKey(q) : "—"),
  matching: formatMatchingKey,
  ordering: formatOrderingKey,
  blanks: formatBlanksKey,
  text: (q) => (isEssay(q.type) ? formatEssayKey() : formatShortAnswerKey(q)),
};

/** Per-kind teacher-key formatters — single registry for print strategy. */
export function getTeacherKeyFormatter(kind: QuestionTypeKind): TeacherKeyFormatter {
  return teacherKeyByKind[kind];
}

/** Compact plain-text answer for teacher key sheet (no question stem). */
export function formatTeacherKeyForQuestion(question: NormalizedQuestion): string {
  if (!question.kind) return "—";
  return teacherKeyByKind[question.kind](question);
}

/** Compact teacher-key answer line from raw exam/bank payload. */
export function formatTeacherKeyAnswer(source: Record<string, unknown>): string {
  const question = normalizeQuestion(source);
  if (!question.kind) return "—";
  return formatTeacherKeyForQuestion(question);
}

/** Metadata slice of print strategy (render lives in exam-print components). */
export function getPrintStrategyMeta(kind: QuestionTypeKind): Pick<QuestionPrintStrategy, "kind" | "formatTeacherKeyAnswer"> {
  return {
    kind,
    formatTeacherKeyAnswer: teacherKeyByKind[kind],
  };
}

export function getSupportedPrintKinds(): readonly QuestionTypeKind[] {
  return Object.keys(teacherKeyByKind) as QuestionTypeKind[];
}
