import { alpha, type Theme } from "@mui/material/styles";
import type { QuestionTypeId } from "./constants";

type PaletteSlot = "primary" | "secondary" | "success" | "warning" | "error" | "info";
type PaletteShade = "main" | "dark" | "light";

/** Distinct accent per question type, mapped to the app MUI palette. */
export const QUESTION_TYPE_PALETTE: Record<
  QuestionTypeId,
  { slot: PaletteSlot; shade?: PaletteShade }
> = {
  multiple_choice: { slot: "primary", shade: "main" },
  true_false: { slot: "info", shade: "main" },
  multiple_select: { slot: "secondary", shade: "main" },
  essay: { slot: "warning", shade: "main" },
  short_answer: { slot: "success", shade: "main" },
  fill_in_the_blank: { slot: "primary", shade: "dark" },
  matching: { slot: "secondary", shade: "dark" },
  ordering: { slot: "error", shade: "main" },
};

export function getQuestionTypeMainColor(theme: Theme, type: string): string {
  const cfg = QUESTION_TYPE_PALETTE[type as QuestionTypeId];
  if (!cfg) return theme.palette.primary.main;
  const palette = theme.palette[cfg.slot];
  const shade = cfg.shade ?? "main";
  return palette[shade];
}

/** Card / panel border in question bank lists (neutral; type color only on chips). */
export function questionTypeBorderSx(_theme: Theme, _type?: string, _borderWidth?: number) {
  return {};
}

/** Toggle button / chip styling for a question type. */
export function questionTypeAccentSx(
  theme: Theme,
  type: string,
  options?: { selected?: boolean }
) {
  const color = getQuestionTypeMainColor(theme, type);
  const selected = options?.selected ?? false;
  return {
    borderColor: color,
    color: selected ? color : theme.palette.text.primary,
    ...(selected
      ? { bgcolor: alpha(color, 0.12), fontWeight: 600 }
      : { bgcolor: "background.paper" }),
    "&:hover": {
      bgcolor: alpha(color, selected ? 0.16 : 0.08),
    },
    "&.Mui-selected": {
      bgcolor: alpha(color, 0.12),
      color,
      borderColor: color,
      "&:hover": { bgcolor: alpha(color, 0.16) },
    },
    "&.Mui-selected:hover": {
      bgcolor: alpha(color, 0.16),
    },
  };
}
