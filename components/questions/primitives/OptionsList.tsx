"use client";

import { Box, Typography, useMediaQuery, useTheme } from "@mui/material";
import { RichLabel } from "@/components/editor";
import {
  mergeDisplaySettings,
  getOptionLabel,
  effectiveOptionsPerRow,
  optionsGridSx,
  type DisplaySettings,
} from "@/lib/question-types/display-settings";
import { optionText, optionIdFromUnknown } from "@/lib/question-types/normalize-question";
import { isCorrectOptionId } from "@/lib/option-ids";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const settings = mergeDisplaySettings(displaySettings);
  const perRow = effectiveOptionsPerRow(questionType, settings, isMobile);
  const labelStyle = settings.optionLabelStyle!;

  if (options.length === 0) return null;

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        گزینه‌ها:
      </Typography>
      <Box
        key={`opts-${perRow}-${labelStyle}-${isMobile}`}
        sx={optionsGridSx(perRow)}
      >
        {options.map((opt, idx) => {
          const optionId = optionIdFromUnknown(opt, idx);
          const isCorrect = isCorrectOptionId(questionType, correctAnswer, optionId);
          const showCorrectBorder = mode === "authoring" && isCorrect;
          return (
            <Box
              key={optionId}
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
