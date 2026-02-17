"use client";

import React, { useMemo } from 'react';
import { Stack, Typography, Alert } from '@mui/material';
import { Controller, UseFormReturn, useWatch } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';
import { PersianDatePicker } from '@/components/exams/PersianDatePicker';
import { PersianTimePicker } from '@/components/exams/PersianTimePicker';

interface SchedulingStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const SchedulingStep = React.memo(function SchedulingStep({ form }: SchedulingStepProps) {
  const { control, formState: { errors } } = form;

  // Watch for exam_date, start_time, end_time to show calculated duration
  const examDate = useWatch({ control, name: 'exam_date' });
  const startTime = useWatch({ control, name: 'start_time' });
  const endTime = useWatch({ control, name: 'end_time' });
  const durationMinutes = useWatch({ control, name: 'duration_minutes' });
        
  // Calculate suggested duration from start_time and end_time
  const suggestedDuration = useMemo(() => {
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

        {suggestedDuration !== null && (
          <Alert severity="info">
            بر اساس زمان شروع و پایان، مدت زمان پیشنهادی: <strong>{suggestedDuration} دقیقه</strong>
            {durationMinutes && durationMinutes > suggestedDuration && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 0.5 }}>
                توجه: مدت زمان تعیین شده ({durationMinutes} دقیقه) بیشتر از بازه زمانی است.
              </Typography>
            )}
          </Alert>
        )}
      </Stack>
    </Stack>
  );
});

