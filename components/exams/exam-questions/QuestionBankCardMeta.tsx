"use client";

import { Chip, Stack } from "@mui/material";
import { QuestionTypeChip } from "@/components/questions/QuestionTypeChip";
import type { QuestionBankViewMode } from "@/lib/question-bank-view";
import type { Question, Difficulty } from "@/types";
import { DIFFICULTY_CONFIG } from "@/constants/question";

interface QuestionBankCardMetaProps {
  question: Question;
  viewMode: QuestionBankViewMode;
  alreadyInExam?: boolean;
}

/** Single metadata row for bank picker cards (type, difficulty, category, status). */
export function QuestionBankCardMeta({
  question,
  viewMode,
  alreadyInExam = false,
}: QuestionBankCardMetaProps) {
  const questionType = question.type || "multiple_choice";
  const difficulty = (question.difficulty || "medium") as Difficulty;
  const diffCfg = DIFFICULTY_CONFIG[difficulty];
  const categoryName = question.category?.name;

  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
      {viewMode === "student" && (
        <Chip
          label="نمای دانش‌آموز"
          size="small"
          color="info"
          variant="outlined"
          sx={{ height: 22, fontSize: "0.7rem" }}
        />
      )}
      <QuestionTypeChip type={questionType} />
      {diffCfg && <Chip label={diffCfg.label} size="small" color={diffCfg.color} />}
      {categoryName && (
        <Chip label={categoryName} size="small" variant="outlined" />
      )}
      {(question.tags ?? []).map((tag) => (
        <Chip key={tag} label={tag} size="small" variant="outlined" />
      ))}
      {alreadyInExam && (
        <Chip label="در آزمون" size="small" color="success" variant="outlined" />
      )}
    </Stack>
  );
}
