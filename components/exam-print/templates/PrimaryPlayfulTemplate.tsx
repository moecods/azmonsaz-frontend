"use client";

import { Box, Typography } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import SchoolHeader from "./_shared/SchoolHeader";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function PrimaryPlayfulTemplate({ exam, headerOverrides, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell
      sx={{ border: "3px dashed #333", borderRadius: 2, bgcolor: "#fff" }}
    >
      <SchoolHeader exam={exam} header={headerOverrides} showBismillah={false} borderStyle="dashed" />
      <Typography sx={{ textAlign: "center", fontWeight: 700, mb: 2, fontSize: "1.1rem" }}>
        {exam.title}
      </Typography>
      <Box sx={{ textAlign: "center", mb: 2, fontSize: "0.9rem" }}>★ موفق باشی! ★</Box>
      <QuestionsSection exam={exam} variant="playful" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
