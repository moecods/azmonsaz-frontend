"use client";

import { useState } from "react";
import type { Question } from "@/types";
import type { QuestionBankViewMode } from "@/lib/question-bank-view";
import QuestionDisplay from "./QuestionDisplay";
import QuestionView from "./QuestionView";
import type { PreviewAnswerValue } from "./QuestionAnswerInput";

interface QuestionBankItemDisplayProps {
  source: Question | Record<string, unknown>;
  viewMode: QuestionBankViewMode;
  compact?: boolean;
  /** Hide stem chips when the parent card renders metadata once. */
  suppressStemMeta?: boolean;
}

/**
 * Renders a bank question either with answer key (bank) or as in exam take (student).
 */
export function QuestionBankItemDisplay({
  source,
  viewMode,
  compact = false,
  suppressStemMeta = false,
}: QuestionBankItemDisplayProps) {
  const [previewAnswer, setPreviewAnswer] = useState<PreviewAnswerValue>(null);
  const record = source as Record<string, unknown>;

  if (viewMode === "student") {
    return (
      <QuestionView
        mode="take"
        source={record}
        answerValue={previewAnswer}
        onAnswerChange={setPreviewAnswer}
      />
    );
  }

  return (
    <QuestionDisplay
      source={source}
      compact={compact}
      showAnswerKey
      showStemMeta={!suppressStemMeta}
    />
  );
}
