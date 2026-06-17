"use client";

import { Box, Typography } from "@mui/material";
import QuestionPrintBody, { type PrintQuestionVariant } from "@/components/exam-print/QuestionPrintBody";
import { normalizeQuestion, resolveQuestionPrintSettings } from "@/lib/question-types";

interface QuestionPrintBlockProps {
  questionNumber: number;
  source: Record<string, unknown>;
  points?: number;
  accentColor?: string;
  variant?: PrintQuestionVariant;
  showPoints?: boolean;
  showNumber?: boolean;
  interactive?: boolean;
  onQuestionClick?: (questionNumber: number) => void;
  bankPrintSettings?: Record<string, unknown> | null;
}

const VARIANT_STYLES: Record<
  PrintQuestionVariant,
  { border: string; bg: string; numberBg: string; numberColor: string }
> = {
  default: { border: "1px solid #ccc", bg: "#fff", numberBg: "#000", numberColor: "#fff" },
  compact: { border: "1px solid #ddd", bg: "#fff", numberBg: "#333", numberColor: "#fff" },
  formal: { border: "none", bg: "transparent", numberBg: "transparent", numberColor: "#000" },
  playful: { border: "2px dashed #666", bg: "#fefefe", numberBg: "#000", numberColor: "#fff" },
  minimal: { border: "none", bg: "transparent", numberBg: "transparent", numberColor: "#000" },
};

/** Single question block for print templates (skin wrappers supply page chrome). */
export default function QuestionPrintBlock({
  questionNumber,
  source,
  points,
  accentColor = "#000",
  variant = "default",
  showPoints = true,
  showNumber = true,
  interactive = false,
  onQuestionClick,
  bankPrintSettings,
}: QuestionPrintBlockProps) {
  const styles = VARIANT_STYLES[variant];
  const normalized = normalizeQuestion(source);
  const printSettings = resolveQuestionPrintSettings({
    source,
    bankPrintSettings,
    variant,
    normalized,
  });
  const qId =
    typeof source.id === "number"
      ? source.id
      : typeof source.question_id === "number"
        ? source.question_id
        : questionNumber;
  const resolvedPoints =
    points ??
    (source.points as number | undefined) ??
    ((source.payload as Record<string, unknown> | undefined)?.points as number | undefined) ??
    10;

  if (variant === "formal") {
    return (
      <Box
        className="exam-print-question"
        data-question-number={questionNumber}
        data-page-break-before={printSettings.pageBreakBefore ? "true" : undefined}
        onClick={interactive ? () => onQuestionClick?.(questionNumber) : undefined}
        sx={{
          pageBreakInside: "avoid",
          ...(printSettings.pageBreakBefore && { pageBreakBefore: "always" }),
          ...(interactive && {
            cursor: "pointer",
            "&:hover": { outline: "2px dashed", outlineColor: "primary.main" },
          }),
        }}
      >
        <QuestionPrintBody
          source={source}
          questionId={qId}
          variant="formal"
          printSettings={printSettings}
          bankPrintSettings={bankPrintSettings}
        />
        {printSettings.printNote && (
          <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#555" }}>
            {printSettings.printNote}
          </Typography>
        )}
      </Box>
    );
  }

  return (
    <Box
      className="exam-print-question"
      data-question-number={questionNumber}
      data-page-break-before={printSettings.pageBreakBefore ? "true" : undefined}
      onClick={interactive ? () => onQuestionClick?.(questionNumber) : undefined}
      sx={{
        mb: variant === "compact" ? 2 : 3,
        p: variant === "minimal" ? 0 : variant === "compact" ? 1.5 : 2,
        border: styles.border,
        borderRadius: variant === "playful" ? 2 : 0,
        background: styles.bg,
        pageBreakInside: "avoid",
        ...(printSettings.pageBreakBefore && { pageBreakBefore: "always" }),
        ...(interactive && {
          cursor: "pointer",
          "@media print": { cursor: "default", outline: "none !important" },
          "&:hover": { outline: "2px dashed", outlineColor: "primary.main" },
        }),
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25 }}>
        {showNumber && (
          <Box
            sx={{
              background: variant === "default" ? accentColor : styles.numberBg,
              color: styles.numberColor,
              width: variant === "playful" ? 32 : 28,
              height: variant === "playful" ? 32 : 28,
              borderRadius: variant === "playful" ? "50%" : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: variant === "playful" ? 16 : 14,
              flexShrink: 0,
              border: variant === "minimal" ? "1px solid #000" : "none",
            }}
          >
            {questionNumber}
          </Box>
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <QuestionPrintBody
            source={source}
            questionId={qId}
            variant={variant}
            printSettings={printSettings}
            bankPrintSettings={bankPrintSettings}
          />
          {printSettings.printNote && (
            <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#555" }}>
              {printSettings.printNote}
            </Typography>
          )}
          {showPoints && resolvedPoints > 0 && variant !== "minimal" && (
            <Box sx={{ mt: 1, fontSize: "0.75rem", color: "#555" }}>
              بارم: {resolvedPoints}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
