import type { PrintQuestionVariant } from "./print/types";
import type { QuestionTypeKind } from "./registry";
import { getQuestionTypeKind, isEssay } from "./registry";
import type { NormalizedQuestion } from "./normalize-question";

export type AnswerLineStyle = "solid" | "dotted" | "grid" | "none";
export type AnswerLineSpacing = "compact" | "normal" | "wide";
/** Matching question layout on printed exam sheet. */
export type MatchingPrintLayout = "table" | "two_column" | "connect";
/** Ordering question layout on printed exam sheet. */
export type OrderingPrintLayout = "table" | "numbered_list" | "boxes";

/** Per-question print overrides (exam payload or bank question). */
export interface QuestionPrintSettings {
  answerLines?: number;
  answerLineStyle?: AnswerLineStyle;
  answerLineSpacing?: AnswerLineSpacing;
  showAnswerLines?: boolean;
  pageBreakBefore?: boolean;
  printNote?: string;
  matchingPrintLayout?: MatchingPrintLayout;
  orderingPrintLayout?: OrderingPrintLayout;
  showOrderingHint?: boolean;
}

/** Exam-level print customization (stored on exam). */
export interface ExamPrintSettings {
  footerNote?: string;
  footerOnEveryPage?: boolean;
}

const MIN_ANSWER_LINES = 1;
const MAX_ANSWER_LINES = 30;

function clampLines(n: number): number {
  return Math.min(MAX_ANSWER_LINES, Math.max(MIN_ANSWER_LINES, Math.round(n)));
}

function defaultLinesForKind(
  kind: QuestionTypeKind,
  questionType: string,
  variant: PrintQuestionVariant,
  blankCount?: number
): number {
  if (kind === "text" && isEssay(questionType)) {
    if (variant === "formal") return 6;
    if (variant === "playful") return 5;
    if (variant === "compact") return 4;
    return 8;
  }
  if (kind === "text") return 1;
  if (kind === "blanks") return Math.max(blankCount ?? 1, 1);
  return 0;
}

/** Kind-level defaults before any bank/exam override. */
export function getDefaultQuestionPrintSettings(
  kind: QuestionTypeKind,
  questionType: string,
  variant: PrintQuestionVariant = "default",
  blankCount?: number
): QuestionPrintSettings {
  if (kind === "matching") {
    return { matchingPrintLayout: "table" };
  }
  if (kind === "ordering") {
    return { orderingPrintLayout: "table", showOrderingHint: true };
  }

  const lines = defaultLinesForKind(kind, questionType, variant, blankCount);
  if (lines === 0) return {};

  return {
    answerLines: lines,
    answerLineStyle: "solid",
    answerLineSpacing: "normal",
    showAnswerLines: true,
  };
}

export function mergeQuestionPrintSettings(
  partial?: QuestionPrintSettings | Record<string, unknown> | null
): QuestionPrintSettings {
  if (!partial || typeof partial !== "object") return {};
  const p = partial as QuestionPrintSettings;
  const out: QuestionPrintSettings = {};
  if (typeof p.answerLines === "number") out.answerLines = clampLines(p.answerLines);
  if (p.answerLineStyle) out.answerLineStyle = p.answerLineStyle;
  if (p.answerLineSpacing) out.answerLineSpacing = p.answerLineSpacing;
  if (typeof p.showAnswerLines === "boolean") out.showAnswerLines = p.showAnswerLines;
  if (typeof p.pageBreakBefore === "boolean") out.pageBreakBefore = p.pageBreakBefore;
  if (typeof p.printNote === "string" && p.printNote.trim()) out.printNote = p.printNote.trim();
  if (p.matchingPrintLayout) out.matchingPrintLayout = p.matchingPrintLayout;
  if (p.orderingPrintLayout) out.orderingPrintLayout = p.orderingPrintLayout;
  if (typeof p.showOrderingHint === "boolean") out.showOrderingHint = p.showOrderingHint;
  return out;
}

export function mergeExamPrintSettings(
  partial?: ExamPrintSettings | Record<string, unknown> | null
): ExamPrintSettings {
  if (!partial || typeof partial !== "object") return {};
  const p = partial as ExamPrintSettings;
  const out: ExamPrintSettings = {};
  if (typeof p.footerNote === "string" && p.footerNote.trim()) {
    out.footerNote = p.footerNote.trim();
  }
  if (typeof p.footerOnEveryPage === "boolean") {
    out.footerOnEveryPage = p.footerOnEveryPage;
  }
  return out;
}

export interface ResolvePrintSettingsInput {
  source: Record<string, unknown>;
  bankPrintSettings?: QuestionPrintSettings | Record<string, unknown> | null;
  variant?: PrintQuestionVariant;
  normalized?: NormalizedQuestion;
}

/**
 * Resolve effective print settings:
 * payload.print_settings → bank print_settings → kind defaults → variant fallback.
 */
export function resolveQuestionPrintSettings({
  source,
  bankPrintSettings,
  variant = "default",
  normalized,
}: ResolvePrintSettingsInput): QuestionPrintSettings {
  const norm =
    normalized ??
    ({
      kind: getQuestionTypeKind(String(source.type ?? "")) ?? "text",
      type: String(source.type ?? ""),
      blanks: (source.blanks as NormalizedQuestion["blanks"]) ?? [],
    } as Pick<NormalizedQuestion, "kind" | "type" | "blanks">);

  const kind = norm.kind ?? "text";
  const defaults = getDefaultQuestionPrintSettings(
    kind,
    norm.type,
    variant,
    norm.blanks?.length
  );

  const payloadSettings = mergeQuestionPrintSettings(
    (source.print_settings ?? source.printSettings) as QuestionPrintSettings
  );
  const bankSettings = mergeQuestionPrintSettings(bankPrintSettings);

  return {
    ...defaults,
    ...bankSettings,
    ...payloadSettings,
  };
}

/** True when exam question payload stores print_settings overrides. */
export function hasCustomPrintSettings(source: Record<string, unknown>): boolean {
  const raw = source.print_settings ?? source.printSettings;
  if (!raw || typeof raw !== "object") return false;
  return Object.keys(mergeQuestionPrintSettings(raw as QuestionPrintSettings)).length > 0;
}

export function lineHeightPx(
  spacing: AnswerLineSpacing,
  variant: PrintQuestionVariant
): number {
  const base = variant === "playful" ? 28 : variant === "formal" ? 22 : 24;
  if (spacing === "compact") return base - 4;
  if (spacing === "wide") return base + 6;
  return base;
}
