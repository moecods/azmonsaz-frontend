"use client";

import { Box } from "@mui/material";
import QuestionPrintBlock from "@/components/questions/QuestionPrintBlock";
import type { ExamForPrint, PrintInteractionOptions } from "@/lib/exam-print/types";
import type { PrintQuestionVariant } from "@/lib/question-types/print/types";
import { getExamPointsPerQuestion } from "@/lib/exam-utils";

interface QuestionsSectionProps {
  exam: ExamForPrint;
  variant?: PrintQuestionVariant;
  accentColor?: string;
  twoColumn?: boolean;
  printInteraction?: PrintInteractionOptions;
}

function payloadFromQuestion(
  eq: NonNullable<ExamForPrint["exam_questions"]>[number]
): Record<string, unknown> {
  const payload = (eq.payload ?? {}) as Record<string, unknown>;
  return {
    ...payload,
    id: eq.question_id ?? eq.id,
    question_id: eq.question_id,
  };
}

export default function QuestionsSection({
  exam,
  variant = "default",
  accentColor = "#000",
  twoColumn = false,
  printInteraction,
}: QuestionsSectionProps) {
  const defaultPoints = getExamPointsPerQuestion(exam as Parameters<typeof getExamPointsPerQuestion>[0]);
  const questions = exam.exam_questions ?? [];

  if (twoColumn) {
    return (
      <Box
        sx={{
          columnCount: 2,
          columnGap: "8mm",
          "& .exam-print-question": { breakInside: "avoid" },
        }}
      >
        {questions.map((eq, index) => {
          const payload = payloadFromQuestion(eq);
          const points = (payload.points as number | undefined) ?? defaultPoints;
          return (
            <QuestionPrintBlock
              key={eq.id}
              questionNumber={index + 1}
              source={payload}
              points={points}
              variant={variant}
              accentColor={accentColor}
              interactive={printInteraction?.interactive}
              onQuestionClick={printInteraction?.onQuestionClick}
            />
          );
        })}
      </Box>
    );
  }

  return (
    <Box>
      {questions.map((eq, index) => {
        const payload = payloadFromQuestion(eq);
        const points = (payload.points as number | undefined) ?? defaultPoints;
        return (
          <QuestionPrintBlock
            key={eq.id}
            questionNumber={index + 1}
            source={payload}
            points={points}
            variant={variant}
            accentColor={accentColor}
            interactive={printInteraction?.interactive}
            onQuestionClick={printInteraction?.onQuestionClick}
          />
        );
      })}
    </Box>
  );
}
