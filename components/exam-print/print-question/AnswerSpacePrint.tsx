"use client";

import { Box } from "@mui/material";
import type {
  AnswerLineSpacing,
  AnswerLineStyle,
} from "@/lib/question-types/print-settings";
import { lineHeightPx } from "@/lib/question-types/print-settings";
import type { PrintQuestionVariant } from "@/lib/question-types/print/types";

export interface AnswerSpacePrintProps {
  lines: number;
  lineStyle?: AnswerLineStyle;
  spacing?: AnswerLineSpacing;
  showLines?: boolean;
  variant?: PrintQuestionVariant;
}

function singleLineSx(
  lineStyle: AnswerLineStyle,
  height: number
): Record<string, unknown> {
  if (lineStyle === "dotted") {
    return { minHeight: height, mb: 0.5, borderBottom: "1px dotted #000" };
  }
  return { minHeight: height, mb: 0.5, borderBottom: "1px solid #000" };
}

/** Shared ruled answer area for essay / short-answer print. */
export default function AnswerSpacePrint({
  lines,
  lineStyle = "solid",
  spacing = "normal",
  showLines = true,
  variant = "default",
}: AnswerSpacePrintProps) {
  const lineCount = Math.max(1, Math.min(30, lines));
  const height = lineHeightPx(spacing, variant);

  if (!showLines || lineStyle === "none") {
    return (
      <Box
        className="print-answer-space print-answer-space--blank"
        sx={{ mt: 1, minHeight: lineCount * height }}
        aria-hidden="true"
      />
    );
  }

  if (lineStyle === "grid") {
    return (
      <Box
        className="print-answer-line print-answer-line--grid"
        sx={{
          mt: 1,
          minHeight: lineCount * height,
          backgroundImage:
            "repeating-linear-gradient(to bottom, #000 0, #000 1px, transparent 1px, transparent 100%)",
          backgroundSize: `100% ${height}px`,
        }}
      />
    );
  }

  return (
    <Box className="print-answer-lines" sx={{ mt: 1 }}>
      {Array.from({ length: lineCount }).map((_, idx) => (
        <Box
          key={idx}
          className={`print-answer-line print-answer-line--${lineStyle}`}
          sx={singleLineSx(lineStyle, height)}
        />
      ))}
    </Box>
  );
}
