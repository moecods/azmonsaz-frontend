"use client";

import React from 'react';
import { Stack } from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';
import { FormField, FormSelect } from '@/components/forms';

interface BasicInfoStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const BasicInfoStep = React.memo(function BasicInfoStep({ form }: BasicInfoStepProps) {
  const { control } = form;

  return (
    <Stack spacing={3}>
      <FormField
        name="title"
        control={control}
        label="عنوان آزمون"
        required
        placeholder="مثال: آزمون ریاضی پایه دهم"
      />

      <FormField
        name="description"
        control={control}
        label="توضیحات"
        multiline
        rows={3}
        placeholder="توضیحات مربوط به آزمون را اینجا وارد کنید..."
      />

      <FormField
        name="subject"
        control={control}
        label="موضوع"
        placeholder="مثال: ریاضی، فیزیک، شیمی"
      />

      <FormSelect
        name="type"
        control={control}
        label="نوع آزمون"
        required
        options={[
          { value: 'online', label: 'آنلاین' },
          { value: 'offline', label: 'آفلاین' },
        ]}
      />
    </Stack>
  );
});

