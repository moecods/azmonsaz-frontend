"use client";

import React, { useMemo } from "react";
import { Alert, Stack } from "@mui/material";
import { UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { FormField, FormSelect } from "@/components/forms";
import { useUsers } from "@/hooks/useUsers";

interface BasicInfoStepProps {
  form: UseFormReturn<ExamFormData>;
  showCreatorSelect?: boolean;
}

export const BasicInfoStep = React.memo(function BasicInfoStep({
  form,
  showCreatorSelect = false,
}: BasicInfoStepProps) {
  const { control } = form;
  const { data: usersData, isLoading: usersLoading } = useUsers(
    { per_page: 100 },
    { enabled: showCreatorSelect }
  );

  const creatorOptions = useMemo(() => {
    const list = usersData?.data ?? [];
    return list
      .filter((u) => u.roles?.includes("creator"))
      .map((u) => ({
        value: u.id,
        label: u.phone_number ? `${u.name} · ${u.phone_number}` : u.name,
      }));
  }, [usersData]);

  return (
    <Stack spacing={3}>
      {showCreatorSelect && (
        <>
          <Alert severity="info">
            به‌عنوان مدیر، آزمون را برای حساب یک معلم ایجاد می‌کنید. فقط مدیر می‌تواند
            آزمون را به نام معلم دیگر ثبت کند.
          </Alert>
          <FormSelect
            name="created_by"
            control={control}
            label="معلم مسئول آزمون"
            required
            disabled={usersLoading || creatorOptions.length === 0}
            options={creatorOptions}
            placeholder="انتخاب معلم…"
          />
        </>
      )}

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
