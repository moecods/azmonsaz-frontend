"use client";

import { ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import KeyIcon from "@mui/icons-material/Key";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import type { QuestionBankViewMode } from "@/lib/question-bank-view";

interface QuestionBankViewToggleProps {
  value: QuestionBankViewMode;
  onChange: (mode: QuestionBankViewMode) => void;
  size?: "small" | "medium";
}

export function QuestionBankViewToggle({
  value,
  onChange,
  size = "small",
}: QuestionBankViewToggleProps) {
  return (
    <ToggleButtonGroup
      exclusive
      size={size}
      value={value}
      onChange={(_e, next: QuestionBankViewMode | null) => {
        if (next) onChange(next);
      }}
      aria-label="حالت نمایش سوالات"
    >
      <ToggleButton value="bank" aria-label="نمایش بانک با پاسخ کلید">
        <Tooltip title="نمایش بانک — با پاسخ کلید و متادیتا">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <KeyIcon fontSize="small" />
            نمایش بانک
          </span>
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="student" aria-label="نمایش دانش‌آموز در آزمون">
        <Tooltip title="نمایش همان‌طور که دانش‌آموز در آزمون می‌بیند">
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <PersonOutlineIcon fontSize="small" />
            نمایش دانش‌آموز
          </span>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
