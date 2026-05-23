"use client";

import type { ReactNode } from "react";
import {
  Box,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import type { QuestionTypeId } from "@/lib/question-types/constants";
import { getQuestionPlugin } from "@/lib/question-types/plugins";
import type { DisplaySettings } from "@/lib/question-types/display-settings";
import { mergeDisplaySettings } from "@/lib/question-types/display-settings";

interface DisplaySettingsPanelProps {
  questionType: QuestionTypeId | string;
  value: DisplaySettings | Record<string, unknown>;
  onChange: (settings: DisplaySettings) => void;
}

function SettingRow({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export default function DisplaySettingsPanel({
  questionType,
  value,
  onChange,
}: DisplaySettingsPanelProps) {
  const plugin = getQuestionPlugin(questionType);
  const settings = mergeDisplaySettings(value);
  const kind = plugin?.kind;

  const patch = (partial: Partial<DisplaySettings>) =>
    onChange({ ...settings, ...partial });

  const isOptions =
    kind === "options_single" ||
    kind === "options_multiple" ||
    kind === "options_fixed";

  if (!isOptions && kind !== "ordering" && kind !== "matching") {
    return null;
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>
        نمایش سوال
      </Typography>
      <Stack spacing={2}>
        {isOptions && (
          <>
            <SettingRow label="تعداد گزینه در هر ردیف">
              <ToggleButtonGroup
                exclusive
                size="small"
                value={String(settings.optionsPerRow ?? 1)}
                onChange={(_, v) => {
                  if (v != null) patch({ optionsPerRow: Number(v) as 1 | 2 | 3 | 4 });
                }}
              >
                {[1, 2, 3, 4].map((n) => (
                  <ToggleButton key={n} value={String(n)}>
                    {n}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </SettingRow>
            <SettingRow label="برچسب گزینه‌ها">
              <ToggleButtonGroup
                exclusive
                size="small"
                value={settings.optionLabelStyle ?? "latin"}
                onChange={(_, v) => {
                  if (v) patch({ optionLabelStyle: v as DisplaySettings["optionLabelStyle"] });
                }}
                sx={{ flexWrap: "wrap" }}
              >
                <ToggleButton value="latin">A, B</ToggleButton>
                <ToggleButton value="persian">الف، ب</ToggleButton>
                <ToggleButton value="numeric">۱، ۲</ToggleButton>
                <ToggleButton value="none">بدون</ToggleButton>
              </ToggleButtonGroup>
            </SettingRow>
          </>
        )}
        {kind === "ordering" && (
          <>
            <SettingRow label="چیدمان">
              <ToggleButtonGroup
                exclusive
                size="small"
                value={settings.orderingLayout ?? "vertical"}
                onChange={(_, v) => {
                  if (v) patch({ orderingLayout: v as DisplaySettings["orderingLayout"] });
                }}
              >
                <ToggleButton value="vertical">عمودی</ToggleButton>
                <ToggleButton value="horizontal">افقی</ToggleButton>
                <ToggleButton value="grid">شبکه</ToggleButton>
              </ToggleButtonGroup>
            </SettingRow>
            {settings.orderingLayout === "grid" && (
              <SettingRow label="تعداد ستون">
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={String(settings.orderingColumns ?? 3)}
                  onChange={(_, v) => {
                    if (v != null) patch({ orderingColumns: Number(v) });
                  }}
                >
                  {[2, 3, 4].map((n) => (
                    <ToggleButton key={n} value={String(n)}>
                      {n}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </SettingRow>
            )}
          </>
        )}
        {kind === "matching" && (
          <SettingRow label="حالت تطبیق">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={settings.matchingMode ?? "one_to_one"}
              onChange={(_, v) => {
                if (v) patch({ matchingMode: v as DisplaySettings["matchingMode"] });
              }}
            >
              <ToggleButton value="one_to_one">یک به یک</ToggleButton>
              <ToggleButton value="one_to_many">یک به چند</ToggleButton>
            </ToggleButtonGroup>
          </SettingRow>
        )}
      </Stack>
    </Box>
  );
}
