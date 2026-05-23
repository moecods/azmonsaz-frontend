"use client";

import { Stack } from "@mui/material";
import type { Question } from "@/types";
import QuestionStem from "./QuestionStem";
import QuestionAnswerKey from "./QuestionAnswerKey";
import { normalizeQuestion } from "@/lib/question-types/normalize-question";

export type QuestionDisplayMode = "bank" | "manage" | "print" | "preview";

interface QuestionDisplayProps {
  source: Question | Record<string, unknown>;
  mode?: QuestionDisplayMode;
  showAnswerKey?: boolean;
  compact?: boolean;
}

/**
 * Unified read-only question renderer (single source for bank, drawer, manage, print).
 */
export default function QuestionDisplay({
  source,
  showAnswerKey = true,
  compact,
}: QuestionDisplayProps) {
  const record = normalizeQuestion(source as Record<string, unknown>);
  const q = source as Question;

  return (
    <Stack spacing={compact ? 1 : 1.5}>
      <QuestionStem
        type={record.type}
        text={record.text}
        difficulty={q.difficulty}
        categoryName={q.category?.name ?? (source as Record<string, unknown>).category_name as string}
        tags={q.tags ?? (source as Record<string, unknown>).tags as string[]}
        points={
          ((source as Record<string, unknown>).points as number | undefined) ??
          (((source as Record<string, unknown>).payload as Record<string, unknown> | undefined)?.points as number | undefined)
        }
        compact={compact}
      />
      {showAnswerKey && <QuestionAnswerKey source={source as Record<string, unknown>} />}
    </Stack>
  );
}
