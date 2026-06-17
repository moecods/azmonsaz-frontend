"use client";

import { Box, Typography } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";
import { getExamDurationMinutes } from "@/lib/exam-utils";

export default function CollegeTemplate({ exam, printInteraction }: ExamTemplateProps) {
  const duration = getExamDurationMinutes(exam as Parameters<typeof getExamDurationMinutes>[0]);

  return (
    <ExamTemplateShell dir="ltr" sx={{ fontFamily: '"Times New Roman", serif' }}>
      <Box sx={{ borderBottom: "2px solid #000", pb: 2, mb: 3 }}>
        <Typography sx={{ fontSize: "1.25rem", fontWeight: 700, textAlign: "center" }}>
          {exam.title}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, fontSize: "0.85rem" }}>
          <Box>Name: _________________________</Box>
          <Box>Student ID: ______________</Box>
          <Box>Date: ______________</Box>
        </Box>
        {duration ? (
          <Box sx={{ textAlign: "center", mt: 1, fontSize: "0.85rem" }}>
            Time allowed: {duration} minutes
          </Box>
        ) : null}
      </Box>
      <Typography sx={{ fontWeight: 700, mb: 2, fontSize: "0.9rem" }}>
        Instructions: Answer all questions. Write clearly.
      </Typography>
      <QuestionsSection exam={exam} variant="minimal" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
