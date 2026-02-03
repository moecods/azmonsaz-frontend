"use client";

import React from 'react';
import { Stack, Autocomplete, Chip, TextField } from '@mui/material';
import { Controller, UseFormReturn } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';
import { FormField, FormNumberField } from '@/components/forms';

interface ExamSettingsStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const ExamSettingsStep = React.memo(function ExamSettingsStep({ form }: ExamSettingsStepProps) {
  const { control, formState: { errors } } = form;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2}>
        <FormNumberField
          name="duration_minutes"
          control={control}
          label="مدت زمان (دقیقه)"
        />

        <FormNumberField
          name="passing_score"
          control={control}
          label="نمره قبولی (%)"
          min={0}
          max={100}
        />

        <FormNumberField
          name="max_attempts"
          control={control}
          label="حداکثر تلاش"
          min={1}
        />
      </Stack>

      <FormField
        name="instructions"
        control={control}
        label="دستورالعمل آزمون"
        multiline
        rows={4}
        placeholder="دستورالعمل‌های آزمون را اینجا وارد کنید..."
      />

      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={field.value || []}
            onChange={(_, newValue) => field.onChange(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="تگ‌ها"
                placeholder="تگ اضافه کنید و Enter بزنید"
                error={!!errors.tags}
                helperText={errors.tags?.message}
              />
            )}
          />
        )}
      />
    </Stack>
  );
});

