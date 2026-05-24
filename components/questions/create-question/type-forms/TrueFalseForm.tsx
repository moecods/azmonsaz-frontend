"use client";

import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Controller } from "react-hook-form";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { TypeFormProps } from "./types";
import { getArrayFieldError } from "./form-error-utils";

export function TrueFalseForm({ control, errors, setValue, questionOptions }: TypeFormProps) {
  const optionsError = getArrayFieldError(errors as never, "options");

  return (
    <Box id="field-options">
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        گزینه صحیح را انتخاب کنید
      </Typography>
      {optionsError && (
        <Typography variant="caption" color="error" display="block" sx={{ mb: 1 }}>
          {optionsError}
        </Typography>
      )}
      <Stack spacing={2}>
        {[0, 1].map((index) => (
          <Stack key={index} direction="row" spacing={2} alignItems="center">
            <TextField
              value={questionOptions?.[index]?.text ?? (index === 0 ? "صحیح" : "غلط")}
              label={`گزینه ${index + 1}`}
              fullWidth
              disabled
              size="small"
            />
            <Controller
              name={`options.${index}.is_correct`}
              control={control}
              render={({ field: f }) => (
                <Button
                  variant={f.value ? "contained" : "outlined"}
                  color={f.value ? "success" : "inherit"}
                  onClick={() => {
                    const opts = questionOptions ?? [];
                    const trueId = opts[0]?.id;
                    const falseId = opts[1]?.id;
                    setValue("options.0.is_correct", index === 0, { shouldDirty: true, shouldValidate: true });
                    setValue("options.1.is_correct", index === 1, { shouldDirty: true, shouldValidate: true });
                    if (trueId && falseId) {
                      setValue("correct_answer", index === 0 ? trueId : falseId, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }
                  }}
                  sx={{ minWidth: 100 }}
                  startIcon={f.value ? <CheckCircleIcon /> : null}
                >
                  {f.value ? "صحیح" : "غلط"}
                </Button>
              )}
            />
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}
