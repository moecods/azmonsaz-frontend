import { getQuestionTypeKind } from "@/lib/question-types/registry";

/** Per-question display settings stored in exam payload or bank question. */
export type OptionLabelStyle = "numeric" | "persian" | "latin" | "none";

export interface DisplaySettings {
  optionsPerRow?: 1 | 2 | 3 | 4;
  optionLabelStyle?: OptionLabelStyle;
  orderingLayout?: "vertical" | "horizontal" | "grid";
  orderingColumns?: number;
  matchingLayout?: "columns" | "cards";
  matchingMode?: "one_to_one" | "one_to_many";
}

/** Defaults for multiple_choice, multiple_select, and true_false. */
export const OPTION_TYPE_DISPLAY_DEFAULTS: Pick<
  DisplaySettings,
  "optionsPerRow" | "optionLabelStyle"
> = {
  optionsPerRow: 2,
  optionLabelStyle: "persian",
};

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  ...OPTION_TYPE_DISPLAY_DEFAULTS,
  orderingLayout: "vertical",
  orderingColumns: 3,
  matchingLayout: "columns",
  matchingMode: "one_to_one",
};

export function getOptionLabel(index: number, style: OptionLabelStyle = "latin"): string {
  if (style === "none") return "";
  if (style === "numeric") return `${index + 1}.`;
  if (style === "persian") {
    const persian = ["الف", "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "د"];
    return `${persian[index] ?? String(index + 1)}.`;
  }
  return `${String.fromCharCode(65 + index)}.`;
}

export function mergeDisplaySettings(
  partial?: DisplaySettings | Record<string, unknown> | null
): DisplaySettings {
  return { ...DEFAULT_DISPLAY_SETTINGS, ...(partial as DisplaySettings) };
}

/**
 * On mobile, multiple-choice / multi-select options stack in one column
 * (true_false keeps configured columns — usually 2 side by side).
 */
export function effectiveOptionsPerRow(
  questionType: string,
  settings: DisplaySettings,
  isMobile: boolean
): 1 | 2 | 3 | 4 {
  const configured = settings.optionsPerRow ?? OPTION_TYPE_DISPLAY_DEFAULTS.optionsPerRow ?? 2;
  if (!isMobile || questionType === "true_false") {
    return configured;
  }
  const kind = getQuestionTypeKind(questionType);
  if (kind === "options_single" || kind === "options_multiple") {
    return 1;
  }
  return configured;
}

export function optionsGridSx(columns: number) {
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: 1,
  } as const;
}
