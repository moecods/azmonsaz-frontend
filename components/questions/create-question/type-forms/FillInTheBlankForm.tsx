"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
  Chip,
  IconButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Controller } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import type { TypeFormProps } from "./types";
import { getArrayFieldError, getNestedErrorMessage } from "./form-error-utils";
import { fieldPathToElementId } from "@/lib/form-errors";

export function FillInTheBlankForm({
  control,
  errors,
  blanksFields,
  blanks,
  setValue,
  watch,
}: TypeFormProps) {
  const blanksError = getArrayFieldError(errors as never, "blanks");
  const [chipInput, setChipInput] = useState<Record<number, string>>({});

  const addAnswer = (index: number, answers: string[]) => {
    const t = (chipInput[index] ?? "").trim();
    if (!t || !setValue) return;
    setValue(`blanks.${index}.correct_answers`, [...answers, t]);
    setChipInput((s) => ({ ...s, [index]: "" }));
  };

  return (
    <Box id="field-blanks">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box component="span" sx={{ fontSize: "1rem", fontWeight: 500 }}>
          جای خالی‌ها
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() =>
            blanksFields.append({
              position: (blanks ?? []).length,
              correct_answers: [],
              grading: "auto",
            })
          }
        >
          افزودن جای خالی
        </Button>
      </Stack>
      {blanksError && (
        <Typography variant="caption" color="error" display="block" sx={{ mb: 1 }}>
          {blanksError}
        </Typography>
      )}
      <Stack spacing={2}>
        {(blanks ?? []).map((blank, index) => {
          const manual = blank?.grading === "manual";
          const answers = (blank?.correct_answers as string[]) ?? [];
          const blankErr = getNestedErrorMessage(
            errors as never,
            `blanks.${index}.correct_answers`
          );
          return (
            <Stack
              key={blanksFields.fields[index]?.id ?? index}
              spacing={1}
              id={fieldPathToElementId(`blanks.${index}.correct_answers`)}
              sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <Chip size="small" label={`جای خالی ${index + 1}`} />
                <Controller
                  name={`blanks.${index}.grading`}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={field.value === "manual"}
                          onChange={(e) => {
                            const g = e.target.checked ? "manual" : "auto";
                            field.onChange(g);
                            if (e.target.checked && setValue) {
                              setValue(`blanks.${index}.correct_answers`, []);
                            }
                          }}
                        />
                      }
                      label="تصحیح دستی"
                    />
                  )}
                />
                {(blanks ?? []).length > 1 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => blanksFields.remove(index)}
                    sx={{ ml: "auto" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
              {!manual && (
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    size="small"
                    fullWidth
                    value={chipInput[index] ?? ""}
                    onChange={(e) =>
                      setChipInput((s) => ({ ...s, [index]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addAnswer(index, answers);
                      }
                    }}
                    placeholder="پاسخ قابل قبول"
                    error={!!blankErr}
                    helperText={blankErr}
                  />
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => addAnswer(index, answers)}
                    disabled={!(chipInput[index] ?? "").trim()}
                    sx={{ minWidth: 44, height: 40, flexShrink: 0, px: 1.5 }}
                    aria-label="افزودن پاسخ"
                  >
                    <AddIcon fontSize="small" />
                  </Button>
                </Stack>
              )}
              {!manual && (
                <Stack direction="row" flexWrap="wrap" gap={0.5}>
                  {answers.map((a, j) => (
                    <Chip
                      key={j}
                      size="small"
                      label={a}
                      onDelete={() =>
                        setValue?.(
                          `blanks.${index}.correct_answers`,
                          answers.filter((_, k) => k !== j)
                        )
                      }
                    />
                  ))}
                </Stack>
              )}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}
