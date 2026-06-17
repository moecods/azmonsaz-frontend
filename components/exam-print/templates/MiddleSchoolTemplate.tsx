"use client";

import { Box } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import SchoolHeader from "./_shared/SchoolHeader";
import ExamMetaBlock from "./_shared/ExamMetaBlock";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function MiddleSchoolTemplate({ exam, headerOverrides, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell>
      <SchoolHeader exam={exam} header={headerOverrides} />
      <Box
        sx={{
          border: "1px solid #000",
          p: 1.5,
          mb: 2,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          fontSize: "10pt",
        }}
      >
        <Box>نام و نام خانوادگی: ___________________________</Box>
        <Box>کد ملی: __________________</Box>
      </Box>
      <ExamMetaBlock exam={exam} compact />
      <QuestionsSection exam={exam} variant="default" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
