"use client";

import { Box, TextField } from '@mui/material';
import { Controller } from 'react-hook-form';
import type { TypeFormProps } from './types';

export function ShortAnswerForm({ control, errors }: TypeFormProps) {
  return (
    <Box>
      <Controller
        name="correct_answer"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="پاسخ صحیح"
            fullWidth
            error={!!errors.correct_answer}
            helperText={errors.correct_answer?.message || 'پاسخ صحیح را وارد کنید'}
          />
        )}
      />
    </Box>
  );
}
