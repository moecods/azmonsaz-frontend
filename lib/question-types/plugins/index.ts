import { QUESTION_TYPE_IDS, type QuestionTypeId } from "../constants";
import { getQuestionTypeConfig } from "../registry";
import type { QuestionTypePlugin } from "./types";
import { DEFAULT_DISPLAY_SETTINGS } from "../display-settings";

const plugins: Record<QuestionTypeId, QuestionTypePlugin> = {} as Record<
  QuestionTypeId,
  QuestionTypePlugin
>;

for (const id of QUESTION_TYPE_IDS) {
  const config = getQuestionTypeConfig(id)!;
  plugins[id] = {
    id,
    kind: config.kind,
    labelFa: config.labelFa,
    defaultDisplaySettings:
      id === "multiple_choice" || id === "multiple_select" || id === "true_false"
        ? { optionsPerRow: 1, optionLabelStyle: "latin" }
        : id === "ordering"
          ? { orderingLayout: "vertical", orderingColumns: 3 }
          : id === "matching"
            ? { matchingLayout: "columns", matchingMode: "one_to_one" }
            : DEFAULT_DISPLAY_SETTINGS,
  };
}

export function getQuestionPlugin(type: string): QuestionTypePlugin | undefined {
  if (type in plugins) return plugins[type as QuestionTypeId];
  return undefined;
}

export { plugins };
