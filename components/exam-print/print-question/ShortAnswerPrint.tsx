"use client";

import type { PrintQuestionVariant } from "@/lib/question-types/print/types";
import type { QuestionPrintSettings } from "@/lib/question-types/print-settings";
import AnswerSpacePrint from "./AnswerSpacePrint";

interface ShortAnswerPrintProps {
  variant?: PrintQuestionVariant;
  settings?: QuestionPrintSettings;
}

export default function ShortAnswerPrint({
  variant = "default",
  settings,
}: ShortAnswerPrintProps) {
  const lines = settings?.answerLines ?? 1;

  return (
    <AnswerSpacePrint
      lines={lines}
      lineStyle={settings?.answerLineStyle ?? "solid"}
      spacing={settings?.answerLineSpacing ?? "normal"}
      showLines={settings?.showAnswerLines ?? true}
      variant={variant}
    />
  );
}
