"use client";

import { Chip, Stack } from "@mui/material";
import { RichLabel } from "@/components/editor";
import { DIFFICULTY_CONFIG } from "@/constants/question";
import { QuestionTypeChip } from "./QuestionTypeChip";

interface QuestionStemProps {
  type: string;
  text: string;
  difficulty?: keyof typeof DIFFICULTY_CONFIG;
  categoryName?: string | null;
  tags?: string[];
  points?: number | null;
  compact?: boolean;
  /** When false, only question text is shown (meta rendered elsewhere). */
  showMeta?: boolean;
}

export default function QuestionStem({
  type,
  text,
  difficulty,
  categoryName,
  tags,
  points,
  compact,
  showMeta = true,
}: QuestionStemProps) {
  const diff = difficulty ? DIFFICULTY_CONFIG[difficulty] : null;

  return (
    <Stack spacing={compact ? 0.75 : 1}>
      {showMeta && (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
          <QuestionTypeChip type={type} />
          {diff && <Chip label={diff.label} size="small" color={diff.color} />}
          {categoryName && <Chip label={categoryName} size="small" variant="outlined" />}
          {points != null && (
            <Chip label={`${points} نمره`} size="small" variant="outlined" />
          )}
          {(tags ?? []).map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
      )}
      <RichLabel html={text || ""} fontSize={compact ? "0.9rem" : "1rem"} sx={{ fontWeight: 500 }} />
    </Stack>
  );
}
