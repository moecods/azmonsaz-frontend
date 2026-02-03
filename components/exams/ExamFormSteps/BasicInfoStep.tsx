"use client";

import React from 'react';
import { Stack, TextField } from '@mui/material';
import { Controller, UseFormReturn } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';

interface BasicInfoStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const BasicInfoStep = React.memo(function BasicInfoStep({ form }: BasicInfoStepProps) {
  const { control, formState: { errors } } = form;

  return (
    <Stack spacing={3}>
      <Controller
        name="title"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="عنوان آزمون"
            fullWidth
            required
            error={!!errors.title}
            helperText={errors.title?.message}
            placeholder="مثال: آزمون ریاضی پایه دهم"
          />
        )}
      />

      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="توضیحات"
            fullWidth
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
            placeholder="توضیحات مربوط به آزمون را اینجا وارد کنید..."
          />
        )}
      />

      <Controller
        name="subject"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="موضوع"
            fullWidth
            error={!!errors.subject}
            helperText={errors.subject?.message}
            placeholder="مثال: ریاضی، فیزیک، شیمی"
          />
        )}
      />
    </Stack>
  );
});

