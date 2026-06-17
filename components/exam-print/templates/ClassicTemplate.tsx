"use client";

import { Box } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import ExamMetaBlock from "./_shared/ExamMetaBlock";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function ClassicTemplate({ exam, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell sx={{ padding: "15mm" }}>
      <Box sx={{ border: "1px solid #000", p: 2, mb: 3 }}>
        <ExamMetaBlock exam={exam} compact />
      </Box>
      <QuestionsSection exam={exam} variant="minimal" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
