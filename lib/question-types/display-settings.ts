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

export const DEFAULT_DISPLAY_SETTINGS: DisplaySettings = {
  optionsPerRow: 1,
  optionLabelStyle: "latin",
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
  partial?: Record<string, unknown> | null
): DisplaySettings {
  return { ...DEFAULT_DISPLAY_SETTINGS, ...(partial as DisplaySettings) };
}
