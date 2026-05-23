"use client";

import { useState } from "react";
import {
  Box,
  Chip,
  FormLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { RichLabel } from "@/components/editor";
import { optionText } from "@/lib/question-types/normalize-question";
import type { DisplaySettings } from "@/lib/question-types/display-settings";
import { mergeDisplaySettings } from "@/lib/question-types/display-settings";

export type MatchValue =
  | { left_index: number; right_index: number }
  | { left_index: number; right_indices: number[] };

interface MatchingAnswerInputProps {
  leftItems: Array<string | { text?: string }>;
  rightItems: Array<string | { text?: string }>;
  value: MatchValue[] | undefined;
  onChange: (matches: MatchValue[]) => void;
  disabled?: boolean;
  displaySettings?: DisplaySettings | Record<string, unknown>;
}

function normalizeMatches(
  leftLen: number,
  value: MatchValue[] | undefined,
  oneToMany: boolean
): MatchValue[] {
  const base =
    value ??
    Array.from({ length: leftLen }, (_, i) =>
      oneToMany ? { left_index: i, right_indices: [] } : { left_index: i, right_index: 0 }
    );
  return base.slice(0, leftLen);
}

export default function MatchingAnswerInput({
  leftItems,
  rightItems,
  value,
  onChange,
  disabled,
  displaySettings,
}: MatchingAnswerInputProps) {
  const settings = mergeDisplaySettings(displaySettings as DisplaySettings);
  const oneToMany = settings.matchingMode === "one_to_many";
  const matches = normalizeMatches(leftItems.length, value, oneToMany);
  const [activeLeft, setActiveLeft] = useState<number | null>(null);

  const setMatch = (leftIdx: number, rightIdx: number) => {
    if (disabled) return;
    const next = matches.map((m, i) => {
      if (i !== leftIdx) return m;
      if (oneToMany) {
        const prev = "right_indices" in m ? m.right_indices : [];
        const exists = prev.includes(rightIdx);
        const right_indices = exists
          ? prev.filter((r) => r !== rightIdx)
          : [...prev, rightIdx];
        return { left_index: leftIdx, right_indices };
      }
      return { left_index: leftIdx, right_index: rightIdx };
    });
    onChange(next);
    if (!oneToMany) setActiveLeft(null);
  };

  if (!oneToMany) {
    return (
      <Stack spacing={2}>
        <FormLabel>هر مورد چپ را به مورد راست تطبیق دهید</FormLabel>
        {leftItems.map((leftItem, leftIdx) => (
          <Stack key={leftIdx} direction="row" alignItems="center" spacing={2} flexWrap="wrap">
            <Box sx={{ minWidth: 120, flex: 1 }}>
              <RichLabel html={optionText(leftItem)} fontSize="0.9rem" />
            </Box>
            <Select
              size="small"
              disabled={disabled}
              value={
                "right_index" in (matches[leftIdx] ?? {})
                  ? String((matches[leftIdx] as { right_index: number }).right_index)
                  : "0"
              }
              onChange={(e) => setMatch(leftIdx, parseInt(e.target.value, 10))}
              sx={{ minWidth: 180 }}
            >
              {rightItems.map((r, ri) => (
                <MenuItem key={ri} value={String(ri)}>
                  <RichLabel html={optionText(r)} fontSize="0.85rem" block={false} />
                </MenuItem>
              ))}
            </Select>
          </Stack>
        ))}
      </Stack>
    );
  }

  return (
    <Stack spacing={2}>
      <FormLabel>روی مورد چپ کلیک کنید، سپس یک یا چند مورد راست را انتخاب کنید</FormLabel>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            ستون چپ
          </Typography>
          {leftItems.map((item, i) => (
            <Chip
              key={i}
              label={<RichLabel html={optionText(item)} fontSize="0.85rem" block={false} />}
              onClick={() => !disabled && setActiveLeft(i)}
              color={activeLeft === i ? "primary" : "default"}
              variant={activeLeft === i ? "filled" : "outlined"}
              sx={{ height: "auto", py: 1, justifyContent: "flex-start" }}
            />
          ))}
        </Stack>
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            ستون راست
          </Typography>
          {rightItems.map((item, ri) => {
            const selected =
              activeLeft != null &&
              "right_indices" in (matches[activeLeft] ?? {}) &&
              (matches[activeLeft] as { right_indices: number[] }).right_indices.includes(ri);
            return (
              <Chip
                key={ri}
                label={<RichLabel html={optionText(item)} fontSize="0.85rem" block={false} />}
                onClick={() => activeLeft != null && setMatch(activeLeft, ri)}
                color={selected ? "success" : "default"}
                variant={selected ? "filled" : "outlined"}
                disabled={disabled || activeLeft == null}
                sx={{ height: "auto", py: 1, justifyContent: "flex-start" }}
              />
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
}
