"use client";

import type { ReactNode } from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Tooltip,
} from "@mui/material";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ShortTextIcon from "@mui/icons-material/ShortText";
import ArticleIcon from "@mui/icons-material/Article";
import ReorderIcon from "@mui/icons-material/Reorder";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import EditNoteIcon from "@mui/icons-material/EditNote";
import { QUESTION_TYPE_IDS, type QuestionTypeId } from "@/lib/question-types/constants";
import { QUESTION_TYPE_LABELS } from "@/constants/question";
import { questionTypeAccentSx } from "@/lib/question-types/type-appearance";

const TYPE_ICONS: Record<QuestionTypeId, ReactNode> = {
  multiple_choice: <RadioButtonCheckedIcon fontSize="small" />,
  true_false: <ToggleOnIcon fontSize="small" />,
  multiple_select: <CheckBoxIcon fontSize="small" />,
  essay: <ArticleIcon fontSize="small" />,
  short_answer: <ShortTextIcon fontSize="small" />,
  fill_in_the_blank: <EditNoteIcon fontSize="small" />,
  matching: <CompareArrowsIcon fontSize="small" />,
  ordering: <ReorderIcon fontSize="small" />,
};

interface QuestionTypeSelectorProps {
  value: string;
  onChange: (type: QuestionTypeId) => void;
}

export function QuestionTypeSelector({ value, onChange }: QuestionTypeSelectorProps) {
  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        نوع سوال — با تغییر نوع، یک نمونهٔ پیش‌فرض بارگذاری می‌شود
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        onChange={(_, next) => {
          if (next) onChange(next as QuestionTypeId);
        }}
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          width: "100%",
          "& .MuiToggleButtonGroup-grouped": {
            border: "1px solid",
            borderRadius: "8px !important",
            mx: 0,
          },
        }}
      >
        {QUESTION_TYPE_IDS.map((id) => (
          <ToggleButton
            key={id}
            value={id}
            sx={(theme) => ({
              flex: "0 1 auto",
              width: "100%",
              maxWidth: 148,
              minWidth: 108,
              py: 1.25,
              flexDirection: "column",
              gap: 0.5,
              textTransform: "none",
              ...questionTypeAccentSx(theme, id, { selected: value === id }),
            })}
          >
            <Tooltip title={QUESTION_TYPE_LABELS[id] ?? id}>
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5 }}>
                {TYPE_ICONS[id]}
                <Typography variant="caption" sx={{ lineHeight: 1.2, textAlign: "center" }}>
                  {QUESTION_TYPE_LABELS[id]}
                </Typography>
              </Box>
            </Tooltip>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
}
