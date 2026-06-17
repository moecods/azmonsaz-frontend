"use client";

import { Box } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import SchoolHeader from "./_shared/SchoolHeader";
import ExamMetaBlock from "./_shared/ExamMetaBlock";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function HighSchoolTemplate({ exam, headerOverrides, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell>
      <SchoolHeader exam={exam} header={headerOverrides} borderStyle="double" />
      <Box
        sx={{
          borderBottom: "2px solid #000",
          pb: 1,
          mb: 2,
          textAlign: "center",
          fontWeight: 700,
          fontSize: "1rem",
        }}
      >
        آزمون {headerOverrides?.courseName || exam.title}
      </Box>
      <ExamMetaBlock exam={exam} />
      <QuestionsSection exam={exam} variant="default" accentColor="#000" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
