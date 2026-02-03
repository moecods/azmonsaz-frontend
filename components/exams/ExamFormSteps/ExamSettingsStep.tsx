"use client";

import React from 'react';
import { Stack, TextField, Autocomplete, Chip } from '@mui/material';
import { Controller, UseFormReturn } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';

interface ExamSettingsStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const ExamSettingsStep = React.memo(function ExamSettingsStep({ form }: ExamSettingsStepProps) {
  const { control, formState: { errors } } = form;

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={2}>
        <Controller
          name="duration_minutes"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="مدت زمان (دقیقه)"
              type="number"
              fullWidth
              error={!!errors.duration_minutes}
              helperText={errors.duration_minutes?.message}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
            />
          )}
        />

        <Controller
          name="passing_score"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="نمره قبولی (%)"
              type="number"
              fullWidth
              error={!!errors.passing_score}
              helperText={errors.passing_score?.message}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
              inputProps={{ min: 0, max: 100 }}
            />
          )}
        />

        <Controller
          name="max_attempts"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="حداکثر تلاش"
              type="number"
              fullWidth
              error={!!errors.max_attempts}
              helperText={errors.max_attempts?.message}
              value={field.value ?? ''}
              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
              inputProps={{ min: 1 }}
            />
          )}
        />
      </Stack>

      <Controller
        name="instructions"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="دستورالعمل آزمون"
            fullWidth
            multiline
            rows={4}
            error={!!errors.instructions}
            helperText={errors.instructions?.message}
            placeholder="دستورالعمل‌های آزمون را اینجا وارد کنید..."
            value={field.value ?? ''}
          />
        )}
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

