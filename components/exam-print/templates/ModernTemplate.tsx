"use client";

import { Box } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import ExamMetaBlock from "./_shared/ExamMetaBlock";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function ModernTemplate({ exam, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell
      sx={{
        borderTop: "4px solid #000",
        pt: 3,
      }}
    >
      <ExamMetaBlock exam={exam} />
      <Box sx={{ borderTop: "1px solid #ddd", pt: 2 }}>
        <QuestionsSection exam={exam} variant="default" accentColor="#000" printInteraction={printInteraction} />
      </Box>
    </ExamTemplateShell>
  );
}
