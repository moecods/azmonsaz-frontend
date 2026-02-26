"use client";

import React, { useMemo, useEffect } from 'react';
import { Stack, Typography, Alert } from '@mui/material';
import { Controller, UseFormReturn, useWatch } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';
import { PersianDatePicker } from '@/components/exams/PersianDatePicker';
import { PersianTimePicker } from '@/components/exams/PersianTimePicker';
import { FormNumberField } from '@/components/forms';

interface SchedulingStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const SchedulingStep = React.memo(function SchedulingStep({ form }: SchedulingStepProps) {
  const { control, formState: { errors }, setValue } = form;

  const examDate = useWatch({ control, name: 'exam_date' });
  const startTime = useWatch({ control, name: 'start_time' });
  const endTime = useWatch({ control, name: 'end_time' });
  const durationMinutes = useWatch({ control, name: 'duration_minutes' });

  const calculatedDuration = useMemo(() => {
    if (examDate && startTime && endTime) {
      const startDateTime = `${examDate}T${startTime}:00`;
      const endDateTime = `${examDate}T${endTime}:00`;
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);
      if (endDate > startDate) {
        const durationMs = endDate.getTime() - startDate.getTime();
        return Math.floor(durationMs / (1000 * 60));
      }
    }
    return null;
  }, [examDate, startTime, endTime]);

  // وقتی ساعت شروع و پایان پر شده و مدت زمان خالی است، خودکار مقداردهی کن
  useEffect(() => {
    if (calculatedDuration !== null && (durationMinutes === undefined || durationMinutes === null || durationMinutes === 0)) {
      setValue('duration_minutes', calculatedDuration, { shouldValidate: true });
    }
  }, [calculatedDuration, durationMinutes, setValue]);

  return (
    <Stack spacing={3}>
      <Alert severity="info" sx={{ mb: 1 }}>
        زمان‌بندی آزمون اختیاری است. در صورت تعیین، شرکت‌کنندگان فقط در بازه زمانی مشخص شده می‌توانند در آزمون شرکت کنند.
      </Alert>

      <Stack spacing={3}>
        <Controller
          name="exam_date"
          control={control}
          render={({ field }) => (
            <PersianDatePicker
              label="تاریخ برگزاری آزمون"
              value={field.value ?? null}
              onChange={field.onChange}
              error={!!errors.exam_date}
              errorMessage={errors.exam_date?.message}
            />
          )}
        />

        <Stack direction="row" spacing={2}>
          <Controller
            name="start_time"
            control={control}
            render={({ field }) => (
              <PersianTimePicker
                label="ساعت شروع"
                value={field.value ?? null}
                onChange={field.onChange}
                error={!!errors.start_time}
                errorMessage={errors.start_time?.message}
              />
            )}
          />

          <Controller
            name="end_time"
            control={control}
            render={({ field }) => (
              <PersianTimePicker
                label="ساعت پایان"
                value={field.value ?? null}
                onChange={field.onChange}
                error={!!errors.end_time}
                errorMessage={errors.end_time?.message}
              />
            )}
          />
        </Stack>

        <FormNumberField
          name="duration_minutes"
          control={control}
          label="مدت زمان آزمون (دقیقه)"
          min={1}
          helperText="اگر ساعت شروع و پایان پر شده باشد، از اختلاف آن‌ها خودکار پر می‌شود؛ در غیر این صورت اختیاری است."
        />

        {calculatedDuration !== null && durationMinutes != null && durationMinutes > calculatedDuration && (
          <Typography variant="body2" color="warning.main">
            مدت زمان تعیین شده ({durationMinutes} دقیقه) بیشتر از بازه زمانی شروع و پایان ({calculatedDuration} دقیقه) است. لطفاً مدت زمان را کاهش دهید.
          </Typography>
        )}
      </Stack>
    </Stack>
  );
});

