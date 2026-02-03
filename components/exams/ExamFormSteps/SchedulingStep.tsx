"use client";

import React from 'react';
import { Stack, Typography } from '@mui/material';
import { Controller, UseFormReturn } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';
import { PersianDateTimePicker } from '@/components/exams/PersianDateTimePicker';

interface SchedulingStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const SchedulingStep = React.memo(function SchedulingStep({ form }: SchedulingStepProps) {
  const { control, formState: { errors } } = form;

  return (
    <Stack spacing={3}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        زمان‌بندی آزمون اختیاری است. در صورت تعیین، شرکت‌کنندگان فقط در بازه زمانی مشخص شده می‌توانند در آزمون شرکت کنند.
      </Typography>

      <Stack direction="row" spacing={2}>
        <Controller
          name="start_at"
          control={control}
          render={({ field }) => (
            <PersianDateTimePicker
              label="زمان شروع"
              value={field.value ?? null}
              onChange={field.onChange}
              error={!!errors.start_at}
              errorMessage={errors.start_at?.message}
            />
          )}
        />

        <Controller
          name="end_at"
          control={control}
          render={({ field }) => (
            <PersianDateTimePicker
              label="زمان پایان"
              value={field.value ?? null}
              onChange={field.onChange}
              error={!!errors.end_at}
              errorMessage={errors.end_at?.message}
            />
          )}
        />
      </Stack>
    </Stack>
  );
});

