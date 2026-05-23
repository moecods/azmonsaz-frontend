"use client";

import React from "react";
import { Stack } from "@mui/material";
import { UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { FormField, FormSelect } from "@/components/forms";

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

      <FormSelect
        name="type"
        control={control}
        label="نوع آزمون"
        required
        options={[
          { value: "online", label: "آنلاین" },
          { value: "offline", label: "آفلاین" },
        ]}
      />
    </Stack>
  );
});
