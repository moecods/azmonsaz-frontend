"use client";

import { Box, Divider, Typography } from "@mui/material";
import { formatTeacherKeyAnswer } from "@/lib/question-types/print";
import type { ExamForPrint } from "@/lib/exam-print/types";
import { toPersianDigits } from "@/lib/exam-print/to-persian-digits";

interface TeacherAnswerKeySheetProps {
  exam: ExamForPrint;
}

/** Compact teacher answer key — one layout for all templates (number + answer only). */
export default function TeacherAnswerKeySheet({ exam }: TeacherAnswerKeySheetProps) {
  const questions = exam.exam_questions ?? [];

  return (
    <Box
      className="exam-print-teacher-key"
      sx={{
        fontFamily: '"Vazirmatn", "Tahoma", "Arial", sans-serif',
        p: "8mm 10mm",
        maxWidth: "210mm",
        margin: "0 auto",
        color: "#000",
        bgcolor: "#fff",
      }}
    >
      <Typography
        sx={{
          textAlign: "center",
          fontWeight: 700,
          fontSize: "0.9rem",
          mb: 0.25,
        }}
      >
        پاسخنامه — {exam.title}
      </Typography>
      <Typography
        sx={{
          textAlign: "center",
          fontSize: "0.7rem",
          color: "#666",
          mb: 1.25,
        }}
      >
        نسخه معلم
      </Typography>

      {questions.map((eq, index) => {
        const payload = (eq.payload ?? {}) as Record<string, unknown>;
        const answer = formatTeacherKeyAnswer({
          ...payload,
          id: eq.question_id ?? eq.id,
        });

        return (
          <Box key={eq.id}>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                gap: 0.75,
                py: 0.4,
                fontSize: "0.82rem",
                lineHeight: 1.45,
              }}
            >
              <Typography
                component="span"
                sx={{ fontWeight: 700, minWidth: 22, flexShrink: 0 }}
              >
                {toPersianDigits(index + 1)}.
              </Typography>
              <Typography component="span" sx={{ flex: 1 }}>
                {answer}
              </Typography>
            </Box>
            {index < questions.length - 1 ? (
              <Divider sx={{ borderColor: "#ddd" }} />
            ) : null}
          </Box>
        );
      })}
    </Box>
  );
}
