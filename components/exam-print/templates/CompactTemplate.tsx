"use client";

import { Box, Typography } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";
import { getExamDurationMinutes } from "@/lib/exam-utils";
import { toPersianDigits } from "@/lib/exam-print/to-persian-digits";

export default function CompactTemplate({ exam, printInteraction }: ExamTemplateProps) {
  const duration = getExamDurationMinutes(exam as Parameters<typeof getExamDurationMinutes>[0]);
  const count = exam.exam_questions?.length ?? 0;

  return (
    <ExamTemplateShell sx={{ padding: "8mm", fontSize: "0.85rem" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid #000",
          pb: 1,
          mb: 2,
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1rem" }}>{exam.title}</Typography>
        <Box sx={{ fontSize: "0.75rem", textAlign: "left" }}>
          {duration ? <Box>مدت: {toPersianDigits(duration)} دقیقه</Box> : null}
          <Box>تعداد: {toPersianDigits(count)} سوال</Box>
        </Box>
      </Box>
      <QuestionsSection exam={exam} variant="compact" twoColumn printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
