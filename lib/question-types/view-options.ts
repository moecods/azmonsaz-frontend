/** How a question is rendered across bank, take, and result surfaces. */
export type QuestionViewMode = "authoring" | "take" | "result";

export interface QuestionViewOptions {
  mode: QuestionViewMode;
  /** Show type/difficulty/category chips on stem (bank/manage). */
  showStemMeta?: boolean;
  /** Minimal stem for take mode (no meta chips). */
  compactStem?: boolean;
  showAnswerKey?: boolean;
}

export const DEFAULT_VIEW_OPTIONS: Record<QuestionViewMode, QuestionViewOptions> = {
  authoring: {
    mode: "authoring",
    showStemMeta: true,
    compactStem: false,
    showAnswerKey: true,
  },
  take: {
    mode: "take",
    showStemMeta: false,
    compactStem: true,
    showAnswerKey: false,
  },
  result: {
    mode: "result",
    showStemMeta: false,
    compactStem: true,
    showAnswerKey: false,
  },
};

export function mergeViewOptions(
  mode: QuestionViewMode,
  partial?: Partial<QuestionViewOptions>
): QuestionViewOptions {
  return { ...DEFAULT_VIEW_OPTIONS[mode], ...partial, mode };
}
