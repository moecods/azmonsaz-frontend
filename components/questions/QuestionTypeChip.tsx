"use client";

import { Chip, type ChipProps } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { getQuestionTypeLabel } from "@/lib/question-types";
import { getQuestionTypeMainColor } from "@/lib/question-types/type-appearance";

interface QuestionTypeChipProps extends Omit<ChipProps, "label"> {
  type: string;
  label?: string;
}

export function QuestionTypeChip({ type, label, sx, ...rest }: QuestionTypeChipProps) {
  const theme = useTheme();
  const color = getQuestionTypeMainColor(theme, type);

  return (
    <Chip
      label={label ?? getQuestionTypeLabel(type)}
      size="small"
      variant="outlined"
      sx={{
        borderColor: color,
        color,
        fontWeight: 600,
        ...sx,
      }}
      {...rest}
    />
  );
}
