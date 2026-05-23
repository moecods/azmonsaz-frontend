"use client";

import { Box, Typography } from "@mui/material";
import { RichLabel } from "@/components/editor";
import {
  mergeDisplaySettings,
  getOptionLabel,
  type DisplaySettings,
} from "@/lib/question-types/display-settings";
import { optionText, isCorrectOptionIndex } from "@/lib/question-types/normalize-question";

interface OptionsListProps {
  questionType: string;
  options: unknown[];
  correctAnswer: unknown;
  displaySettings?: DisplaySettings | Record<string, unknown>;
  /** authoring = answer key highlight; take/result handled elsewhere */
  mode?: "authoring" | "readonly";
}

/** Shared options layout for bank, preview authoring, answer key. */
export default function OptionsList({
  questionType,
  options,
  correctAnswer,
  displaySettings,
  mode = "authoring",
}: OptionsListProps) {
  const settings = mergeDisplaySettings(displaySettings);
  const perRow = settings.optionsPerRow ?? 1;
  const labelStyle = settings.optionLabelStyle ?? "latin";

  if (options.length === 0) return null;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        گزینه‌ها:
      </Typography>
      <Box
        key={`opts-${perRow}-${labelStyle}`}
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${perRow}, minmax(0, 1fr))`,
          gap: 1,
        }}
      >
        {options.map((opt, idx) => {
          const isCorrect = isCorrectOptionIndex(questionType, correctAnswer, idx);
          const showCorrectBorder = mode === "authoring" && isCorrect;
          return (
            <Box
              key={idx}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 0.75,
                p: 1,
                borderRadius: 1,
                bgcolor: "background.paper",
                ...(showCorrectBorder
                  ? { border: "1px solid", borderColor: "success.main" }
                  : {}),
              }}
            >
              {labelStyle !== "none" && (
                <Typography
                  component="span"
                  sx={{ fontWeight: 600, flexShrink: 0, lineHeight: 1.5 }}
                >
                  {getOptionLabel(idx, labelStyle)}
                </Typography>
              )}
              <RichLabel
                html={optionText(opt)}
                fontSize="0.875rem"
                block={false}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  fontWeight: isCorrect ? 600 : 400,
                  display: "inline",
                }}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
