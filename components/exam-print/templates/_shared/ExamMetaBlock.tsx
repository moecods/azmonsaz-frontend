"use client";

import { Box, Typography } from "@mui/material";
import {
  getExamDurationMinutes,
  getExamInstructions,
  getExamPassingScore,
} from "@/lib/exam-utils";
import type { ExamForPrint } from "@/lib/exam-print/types";
import { toPersianDigits } from "@/lib/exam-print/to-persian-digits";

interface ExamMetaBlockProps {
  exam: ExamForPrint;
  compact?: boolean;
}

export default function ExamMetaBlock({ exam, compact }: ExamMetaBlockProps) {
  const duration = getExamDurationMinutes(exam as Parameters<typeof getExamDurationMinutes>[0]);
  const passing = getExamPassingScore(exam as Parameters<typeof getExamPassingScore>[0]);
  const instructions = getExamInstructions(exam as Parameters<typeof getExamInstructions>[0]);

  return (
    <Box sx={{ mb: compact ? 2 : 3 }}>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 800,
          textAlign: "center",
          mb: 1.5,
          fontSize: compact ? "1.1rem" : "1.35rem",
        }}
      >
        {exam.title}
      </Typography>
      {(duration || passing != null) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 3,
            flexWrap: "wrap",
            fontSize: "0.85rem",
            mb: 1,
          }}
        >
          {duration ? <span>مدت: {toPersianDigits(duration)} دقیقه</span> : null}
          {passing != null ? <span>نمره قبولی: {toPersianDigits(passing)}</span> : null}
        </Box>
      )}
      {instructions ? (
        <Box
          sx={{
            border: "1px solid #ccc",
            p: 1.5,
            borderRadius: 1,
            fontSize: "0.85rem",
            bgcolor: "#fafafa",
          }}
        >
          <Box component="strong" sx={{ display: "block", mb: 0.5 }}>
            دستورالعمل:
          </Box>
          {instructions}
        </Box>
      ) : null}
    </Box>
  );
}
