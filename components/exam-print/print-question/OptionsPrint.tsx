"use client";

import { Box } from "@mui/material";
import { RichLabel } from "@/components/editor";
import { getOptionLabel, mergeDisplaySettings } from "@/lib/question-types/display-settings";
import { optionText } from "@/lib/question-types/normalize-question";
import type { PrintQuestionVariant } from "@/lib/question-types/print/types";

const PERSIAN_LABELS = ["الف", "ب", "پ", "ت", "ث", "ج", "چ", "ح", "خ", "د"];

interface OptionsPrintProps {
  options: unknown[];
  variant?: PrintQuestionVariant;
  displaySettings?: Record<string, unknown>;
  columns?: 1 | 2 | 3;
}

export default function OptionsPrint({
  options,
  variant = "default",
  displaySettings,
  columns,
}: OptionsPrintProps) {
  const settings = mergeDisplaySettings(displaySettings);
  const cols = columns ?? (variant === "compact" ? 2 : settings.optionsPerRow ?? 2);
  const labelStyle = settings.optionLabelStyle ?? "persian";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: cols === 1 ? "1fr" : `repeat(${cols}, minmax(0, 1fr))`,
        gap: variant === "compact" ? 0.75 : 1.25,
        mt: 1.25,
        mr: variant === "formal" ? 0 : 1,
      }}
    >
      {options.map((opt, idx) => {
        const label =
          labelStyle === "persian"
            ? `${PERSIAN_LABELS[idx] ?? getOptionLabel(idx, "persian")})`
            : `${getOptionLabel(idx, labelStyle)})`;
        return (
          <Box
            key={idx}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 0.75,
              fontSize: variant === "formal" ? "10pt" : "0.9rem",
              minWidth: 0,
            }}
          >
            <Box
              component="span"
              sx={{
                width: variant === "playful" ? 18 : 14,
                height: variant === "playful" ? 18 : 14,
                border: "1.5px solid #000",
                borderRadius: variant === "playful" ? "50%" : "2px",
                flexShrink: 0,
                mt: 0.25,
              }}
            />
            <Box component="span" sx={{ fontWeight: 600, flexShrink: 0, minWidth: 24 }}>
              {label}
            </Box>
            <RichLabel
              html={optionText(opt)}
              fontSize={variant === "formal" ? "10pt" : "0.9rem"}
              sx={{ flex: 1, minWidth: 0 }}
            />
          </Box>
        );
      })}
    </Box>
  );
}
