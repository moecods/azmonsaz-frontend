"use client";

import { Box } from "@mui/material";
import { RichLabel } from "@/components/editor";
import { normalizeQuestion, resolveQuestionPrintSettings } from "@/lib/question-types";
import { resolvePrintQuestionId } from "@/lib/question-types/print";
import type { PrintQuestionVariant } from "@/lib/question-types/print/types";
import type { QuestionPrintSettings } from "@/lib/question-types/print-settings";
import StudentPrintContent from "./StudentPrintContent";

export type { PrintQuestionVariant };

interface QuestionPrintBodyProps {
  source: Record<string, unknown>;
  questionId?: number;
  variant?: PrintQuestionVariant;
  showStemOnly?: boolean;
  printSettings?: QuestionPrintSettings;
  bankPrintSettings?: QuestionPrintSettings | Record<string, unknown> | null;
}

/** Read-only question body for exam print (dispatches by kind via print strategy). */
export default function QuestionPrintBody({
  source,
  questionId = 0,
  variant = "default",
  showStemOnly = false,
  printSettings: printSettingsProp,
  bankPrintSettings,
}: QuestionPrintBodyProps) {
  const record = normalizeQuestion(source);
  const qId = resolvePrintQuestionId(source, questionId);
  const printSettings =
    printSettingsProp ??
    resolveQuestionPrintSettings({
      source,
      bankPrintSettings,
      variant,
      normalized: record,
    });
  const fontSize = variant === "formal" ? "11pt" : variant === "playful" ? "12pt" : "0.95rem";

  if (showStemOnly) {
    return (
      <RichLabel html={record.text} fontSize={fontSize} sx={{ textAlign: "justify" }} />
    );
  }

  return (
    <Box>
      <RichLabel
        html={record.text}
        fontSize={fontSize}
        sx={{ textAlign: "justify", mb: 0.5 }}
      />
      <StudentPrintContent
        question={record}
        context={{ questionId: qId, variant, showStemOnly, printSettings }}
      />
    </Box>
  );
}
