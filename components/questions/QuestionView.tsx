"use client";

import { Stack } from "@mui/material";
import type { QuestionViewMode, QuestionViewOptions } from "@/lib/question-types/view-options";
import { mergeViewOptions } from "@/lib/question-types/view-options";
import { normalizeQuestion } from "@/lib/question-types/normalize-question";
import QuestionDisplay from "./QuestionDisplay";
import { RichLabel } from "@/components/editor";
import QuestionStem from "./QuestionStem";
import { QuestionAnswerInput, type QuestionPayload } from "./QuestionAnswerInput";
import {
  QuestionResultDisplay,
  type ResultQuestion,
} from "./QuestionResultDisplay";
import type { PreviewAnswerValue } from "./QuestionAnswerInput";

export interface QuestionViewProps {
  source: Record<string, unknown>;
  mode: QuestionViewMode;
  options?: Partial<QuestionViewOptions>;
  /** take mode */
  answerValue?: PreviewAnswerValue;
  onAnswerChange?: (value: PreviewAnswerValue) => void;
  disabled?: boolean;
  /** result mode — full result row from API */
  resultQuestion?: ResultQuestion;
}

function toTakePayload(source: Record<string, unknown>): QuestionPayload {
  const norm = normalizeQuestion(source);
  return {
    question_text: norm.text,
    type: norm.type,
    options: norm.options as string[],
    items: norm.items,
    correct_order: norm.correct_order,
    left_items: norm.left_items,
    right_items: norm.right_items,
    matches: norm.matches,
    blanks: norm.blanks,
    display_settings: norm.display_settings,
  };
}

/**
 * Unified question renderer for authoring (bank), take, and result modes.
 */
export default function QuestionView({
  source,
  mode,
  options: optionsPartial,
  answerValue,
  onAnswerChange,
  disabled,
  resultQuestion,
}: QuestionViewProps) {
  const options = mergeViewOptions(mode, optionsPartial);
  const norm = normalizeQuestion(source);

  if (mode === "authoring") {
    return (
      <QuestionDisplay
        source={source}
        mode="bank"
        compact={options.compactStem}
        showAnswerKey={options.showAnswerKey}
      />
    );
  }

  if (mode === "result" && resultQuestion) {
    return <QuestionResultDisplay question={resultQuestion} />;
  }

  if (mode === "take") {
    const payload = toTakePayload(source);
    return (
      <Stack spacing={2}>
        {options.showStemMeta ? (
          <QuestionStem
            type={norm.type}
            text={norm.text}
            compact={options.compactStem}
          />
        ) : (
          <RichLabel
            html={norm.text}
            fontSize="1.1rem"
            sx={{ fontWeight: 500, lineHeight: 1.85 }}
          />
        )}
        <QuestionAnswerInput
          payload={payload}
          value={answerValue}
          onChange={(v) => onAnswerChange?.(v)}
          disabled={disabled}
        />
      </Stack>
    );
  }

  return null;
}
