"use client";

import { Box, Chip } from "@mui/material";
import { getQuestionTypeLabel } from "@/lib/question-types";
import QuestionDisplay from "./QuestionDisplay";

interface QuestionPrintBlockProps {
  questionNumber: number;
  source: Record<string, unknown>;
  points?: number;
  accentColor?: string;
}

/** Single question block for print templates (skin wrappers supply page chrome). */
export default function QuestionPrintBlock({
  questionNumber,
  source,
  points = 10,
  accentColor = "#2196F3",
}: QuestionPrintBlockProps) {
  const type = String(source.type ?? source.question_type ?? "multiple_choice");

  return (
    <Box
      className="question"
      sx={{
        mb: 3.75,
        p: 2.5,
        border: "2px solid #E0E0E0",
        borderRadius: "8px",
        background: "#FAFAFA",
        pageBreakInside: "avoid",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "start", gap: 1.25, mb: 1.5 }}>
        <Box
          sx={{
            background: accentColor,
            color: "white",
            width: 35,
            height: 35,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {questionNumber}
        </Box>
        <Box sx={{ flex: 1 }}>
          <QuestionDisplay source={source} mode="print" showAnswerKey={false} compact />
          <Box sx={{ display: "flex", gap: 1, mt: 1, flexWrap: "wrap" }}>
            <Chip label={getQuestionTypeLabel(type)} size="small" sx={{ fontSize: 12 }} />
            <Chip label={`بارم: ${points}`} size="small" variant="outlined" sx={{ fontSize: 12 }} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
