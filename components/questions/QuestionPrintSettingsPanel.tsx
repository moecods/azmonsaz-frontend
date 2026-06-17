"use client";

import type { ReactNode } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import type { QuestionTypeId } from "@/lib/question-types/constants";
import { getQuestionTypeKind } from "@/lib/question-types/registry";
import {
  getDefaultQuestionPrintSettings,
  mergeQuestionPrintSettings,
  type AnswerLineSpacing,
  type AnswerLineStyle,
  type MatchingPrintLayout,
  type OrderingPrintLayout,
  type QuestionPrintSettings,
} from "@/lib/question-types/print-settings";
import type { PrintQuestionVariant } from "@/lib/question-types/print/types";

export interface QuestionPrintSettingsPanelProps {
  questionType: QuestionTypeId | string;
  value: QuestionPrintSettings | Record<string, unknown>;
  onChange: (settings: QuestionPrintSettings) => void;
  variant?: PrintQuestionVariant;
  blankCount?: number;
  showAdvanced?: boolean;
}

const LINE_STYLE_LABELS: Record<AnswerLineStyle, string> = {
  solid: "خط پیوسته",
  dotted: "خط‌چین",
  grid: "شبکه",
  none: "بدون خط",
};

const SPACING_LABELS: Record<AnswerLineSpacing, string> = {
  compact: "فشرده",
  normal: "معمولی",
  wide: "گشاد",
};

const MATCHING_LAYOUT_LABELS: Record<MatchingPrintLayout, string> = {
  table: "جدولی",
  two_column: "دو ستون",
  connect: "اتصال با خط",
};

const ORDERING_LAYOUT_LABELS: Record<OrderingPrintLayout, string> = {
  table: "جدولی",
  numbered_list: "لیست با شماره",
  boxes: "خانه‌های شماره‌دار",
};

function SettingRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75 }}>
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export function supportsQuestionPrintSettings(questionType: string): boolean {
  const kind = getQuestionTypeKind(questionType);
  return (
    kind === "text" ||
    kind === "blanks" ||
    kind === "matching" ||
    kind === "ordering"
  );
}

function TextAnswerSettings({
  settings,
  defaults,
  patch,
}: {
  settings: QuestionPrintSettings;
  defaults: QuestionPrintSettings;
  patch: (partial: QuestionPrintSettings) => void;
}) {
  return (
    <>
      <SettingRow label={`تعداد خط (${settings.answerLines ?? defaults.answerLines ?? 1})`}>
        <Slider
          value={settings.answerLines ?? defaults.answerLines ?? 1}
          min={1}
          max={30}
          step={1}
          marks={[
            { value: 1, label: "۱" },
            { value: 8, label: "۸" },
            { value: 15, label: "۱۵" },
            { value: 30, label: "۳۰" },
          ]}
          valueLabelDisplay="auto"
          onChange={(_, v) => patch({ answerLines: v as number })}
        />
      </SettingRow>

      <SettingRow label="سبک خط">
        <ToggleButtonGroup
          exclusive
          size="small"
          value={settings.answerLineStyle ?? "solid"}
          onChange={(_, v) => {
            if (v) patch({ answerLineStyle: v as AnswerLineStyle });
          }}
          sx={{ flexWrap: "wrap" }}
        >
          {(Object.keys(LINE_STYLE_LABELS) as AnswerLineStyle[]).map((style) => (
            <ToggleButton key={style} value={style}>
              {LINE_STYLE_LABELS[style]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </SettingRow>

      <SettingRow label="فاصله خطوط">
        <ToggleButtonGroup
          exclusive
          size="small"
          value={settings.answerLineSpacing ?? "normal"}
          onChange={(_, v) => {
            if (v) patch({ answerLineSpacing: v as AnswerLineSpacing });
          }}
        >
          {(Object.keys(SPACING_LABELS) as AnswerLineSpacing[]).map((spacing) => (
            <ToggleButton key={spacing} value={spacing}>
              {SPACING_LABELS[spacing]}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </SettingRow>

      <FormControlLabel
        control={
          <Checkbox
            checked={settings.showAnswerLines ?? true}
            onChange={(e) => patch({ showAnswerLines: e.target.checked })}
          />
        }
        label="نمایش خطوط پاسخ (غیرفعال = فقط فضای خالی)"
      />
    </>
  );
}

export default function QuestionPrintSettingsPanel({
  questionType,
  value,
  onChange,
  variant = "default",
  blankCount,
  showAdvanced = false,
}: QuestionPrintSettingsPanelProps) {
  const kind = getQuestionTypeKind(questionType);
  if (!supportsQuestionPrintSettings(questionType)) {
    return (
      <Typography variant="body2" color="text.secondary">
        برای این نوع سوال تنظیم چاپی وجود ندارد.
      </Typography>
    );
  }

  const defaults = getDefaultQuestionPrintSettings(
    kind ?? "text",
    questionType,
    variant,
    blankCount
  );
  const settings = { ...defaults, ...mergeQuestionPrintSettings(value) };

  const patch = (partial: QuestionPrintSettings) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <Stack spacing={2.5}>
      {(kind === "text" || kind === "blanks") && (
        <>
          <Typography variant="body2" color="text.secondary">
            تعداد خطوط، سبک خط‌کشی و فاصلهٔ فضای پاسخ در برگه چاپی اعمال می‌شود.
          </Typography>
          <TextAnswerSettings settings={settings} defaults={defaults} patch={patch} />
        </>
      )}

      {kind === "matching" && (
        <>
          <Typography variant="body2" color="text.secondary">
            نحوهٔ چیدمان ستون‌های تطبیق در برگه چاپی.
          </Typography>
          <SettingRow label="چیدمان تطبیق">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={settings.matchingPrintLayout ?? "table"}
              onChange={(_, v) => {
                if (v) patch({ matchingPrintLayout: v as MatchingPrintLayout });
              }}
              orientation="vertical"
              sx={{ width: "100%", "& .MuiToggleButton-root": { width: "100%", justifyContent: "flex-start" } }}
            >
              {(Object.keys(MATCHING_LAYOUT_LABELS) as MatchingPrintLayout[]).map((layout) => (
                <ToggleButton key={layout} value={layout}>
                  {MATCHING_LAYOUT_LABELS[layout]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </SettingRow>
          <Typography variant="caption" color="text.secondary">
            «دو ستون»: الف و ب کنار هم — «اتصال با خط»: فضای میانی برای کشیدن خط بین موارد.
          </Typography>
        </>
      )}

      {kind === "ordering" && (
        <>
          <Typography variant="body2" color="text.secondary">
            نحوهٔ دریافت ترتیب صحیح از دانش‌آموز در چاپ.
          </Typography>
          <SettingRow label="چیدمان ترتیب">
            <ToggleButtonGroup
              exclusive
              size="small"
              value={settings.orderingPrintLayout ?? "table"}
              onChange={(_, v) => {
                if (v) patch({ orderingPrintLayout: v as OrderingPrintLayout });
              }}
              orientation="vertical"
              sx={{ width: "100%", "& .MuiToggleButton-root": { width: "100%", justifyContent: "flex-start" } }}
            >
              {(Object.keys(ORDERING_LAYOUT_LABELS) as OrderingPrintLayout[]).map((layout) => (
                <ToggleButton key={layout} value={layout}>
                  {ORDERING_LAYOUT_LABELS[layout]}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </SettingRow>
          <FormControlLabel
            control={
              <Checkbox
                checked={settings.showOrderingHint ?? true}
                onChange={(e) => patch({ showOrderingHint: e.target.checked })}
              />
            }
            label="نمایش راهنمای ترتیب‌دهی"
          />
        </>
      )}

      {showAdvanced && (
        <FormControlLabel
          control={
            <Checkbox
              checked={settings.pageBreakBefore ?? false}
              onChange={(e) => patch({ pageBreakBefore: e.target.checked })}
            />
          }
          label="شروع سوال در صفحه جدید"
        />
      )}
    </Stack>
  );
}
