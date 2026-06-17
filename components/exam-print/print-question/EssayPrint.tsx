"use client";

import type { PrintQuestionVariant } from "@/lib/question-types/print/types";
import type { QuestionPrintSettings } from "@/lib/question-types/print-settings";
import AnswerSpacePrint from "./AnswerSpacePrint";

interface EssayPrintProps {
  variant?: PrintQuestionVariant;
  settings?: QuestionPrintSettings;
}

export default function EssayPrint({ variant = "default", settings }: EssayPrintProps) {
  const lines = settings?.answerLines ?? 8;

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
