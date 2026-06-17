"use client";

import { Box, Typography } from "@mui/material";
import ExamTemplateShell from "./_shared/ExamTemplateShell";
import QuestionsSection from "./_shared/QuestionsSection";
import type { ExamTemplateProps } from "@/lib/exam-print/types";

export default function PreschoolTemplate({ exam, headerOverrides, printInteraction }: ExamTemplateProps) {
  return (
    <ExamTemplateShell
      sx={{
        border: "4px solid #000",
        borderRadius: 3,
        bgcolor: "#fffef8",
      }}
      printStyles=".preschool-star { print-color-adjust: exact; }"
    >
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, mb: 0.5 }}>
          {headerOverrides?.schoolName || exam.partner?.name || "مهد کودک"}
        </Typography>
        <Typography sx={{ fontSize: "1.1rem" }}>
          {headerOverrides?.courseName || exam.title}
        </Typography>
        <Box className="preschool-star" sx={{ fontSize: "1.25rem", mt: 1, letterSpacing: 4 }}>
          ★ ☆ ★
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 2,
          fontSize: "1rem",
          flexWrap: "wrap",
        }}
      >
        <Box>نام: _______________</Box>
        <Box>گروه: {headerOverrides?.className || "___"}</Box>
      </Box>

      <QuestionsSection exam={exam} variant="playful" accentColor="#000" printInteraction={printInteraction} />
    </ExamTemplateShell>
  );
}
