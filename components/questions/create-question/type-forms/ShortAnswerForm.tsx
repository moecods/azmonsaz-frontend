"use client";

import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Stack,
  Chip,
  FormControlLabel,
  Switch,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { Controller } from "react-hook-form";
import type { TypeFormProps } from "./types";
import { getNestedErrorMessage } from "./form-error-utils";

export function ShortAnswerForm({ control, errors, setValue, watch }: TypeFormProps) {
  const manual = watch?.("manual_grading") ?? false;
  const answers = (watch?.("correct_answers") as string[]) ?? [];
  const [input, setInput] = useState("");

  const addAnswer = () => {
    const t = input.trim();
    if (!t || !setValue) return;
    setValue("correct_answers", [...answers, t]);
    setInput("");
  };

  return (
    <Box id="field-correct_answers">
      <Controller
        name="manual_grading"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Switch
                checked={!!field.value}
                onChange={(e) => {
                  field.onChange(e.target.checked);
                  if (e.target.checked && setValue) {
                    setValue("correct_answers", []);
                  }
                }}
              />
            }
            label="بدون پاسخ کلیدی (تصحیح دستی)"
          />
        )}
      />
      {!manual && (
        <Stack spacing={1.5} sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            پاسخ‌های قابل قبول (مترادف‌ها)
          </Typography>
          <Stack direction="row" spacing={1} alignItems="flex-start">
            <TextField
              size="small"
              fullWidth
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAnswer())}
              placeholder="پاسخ قابل قبول"
              error={!!getNestedErrorMessage(errors as never, "correct_answers")}
              helperText={getNestedErrorMessage(errors as never, "correct_answers")}
            />
            <Button
              size="small"
              variant="contained"
              onClick={addAnswer}
              disabled={!input.trim()}
              sx={{ minWidth: 44, height: 40, flexShrink: 0, px: 1.5 }}
              aria-label="افزودن پاسخ"
            >
              <AddIcon fontSize="small" />
            </Button>
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {answers.map((a, i) => (
              <Chip
                key={i}
                label={a}
                onDelete={() =>
                  setValue?.(
                    "correct_answers",
                    answers.filter((_, j) => j !== i)
                  )
                }
              />
            ))}
          </Stack>
        </Stack>
      )}
    </Box>
  );
}
