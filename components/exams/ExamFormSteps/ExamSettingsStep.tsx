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
          label="مدت زمان آزمون (دقیقه)"
          min={1}
          helperText="مدت زمان مجاز برای پاسخگویی به آزمون"
        />

        <FormNumberField
          name="passing_score"
          control={control}
          label="نمره قبولی (%)"
          min={0}
          max={100}
          helperText="حداقل نمره برای قبولی در آزمون"
        />
      </Stack>

      <FormNumberField
        name="max_attempts"
        control={control}
        label="حداکثر تعداد تلاش"
        min={1}
        helperText="تعداد دفعاتی که شرکت‌کننده می‌تواند در آزمون شرکت کند"
      />

      <FormField
        name="instructions"
        control={control}
        label="دستورالعمل آزمون"
        multiline
        rows={4}
        placeholder="دستورالعمل‌های آزمون را اینجا وارد کنید..."
        helperText="این دستورالعمل‌ها به شرکت‌کنندگان نمایش داده می‌شود"
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
                helperText={errors.tags?.message || "تگ‌ها برای دسته‌بندی و جستجوی آزمون‌ها استفاده می‌شوند"}
              />
            )}
          />
        )}
      />
    </Stack>
  );
});

