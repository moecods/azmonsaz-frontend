"use client";

import { Box, Typography } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import ExamMetaBlock from "./_shared/ExamMetaBlock";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function PersianCollegeTemplate({ exam, headerOverrides, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell>
      <Box sx={{ border: "2px solid #000", p: 2, mb: 3 }}>
        <Typography sx={{ textAlign: "center", fontWeight: 800, fontSize: "1.2rem", mb: 1 }}>
          {headerOverrides?.courseName || exam.title}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            fontSize: "0.85rem",
          }}
        >
          <Box>نام دانشجو: _________________________</Box>
          <Box>شماره دانشجویی: ______________</Box>
          <Box>استاد: {headerOverrides?.teacherName || "____________"}</Box>
          <Box>تاریخ: {headerOverrides?.examDate || "____________"}</Box>
        </Box>
      </Box>
      <ExamMetaBlock exam={exam} compact />
      <QuestionsSection exam={exam} variant="default" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
