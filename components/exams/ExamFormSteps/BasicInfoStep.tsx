"use client";

import React, { useEffect, useMemo } from "react";
import { Alert, Stack } from "@mui/material";
import { UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { FormField, FormSelect } from "@/components/forms";
import { useUsers } from "@/hooks/useUsers";

interface BasicInfoStepProps {
  form: UseFormReturn<ExamFormData>;
  showCreatorSelect?: boolean;
  /** Default exam owner when admin creates an exam (typically the logged-in admin). */
  defaultOwnerUserId?: number | null;
}

export const BasicInfoStep = React.memo(function BasicInfoStep({
  form,
  showCreatorSelect = false,
  defaultOwnerUserId = null,
}: BasicInfoStepProps) {
  const { control, setValue, getValues } = form;
  const { data: usersData, isLoading: usersLoading } = useUsers(
    { per_page: 100 },
    { enabled: showCreatorSelect }
  );

  const ownerOptions = useMemo(() => {
    const list = usersData?.data ?? [];
    return list
      .filter((u) => u.roles?.includes("creator") || u.roles?.includes("admin"))
      .map((u) => {
        const roleLabel = u.roles?.includes("admin") ? "مدیر" : "معلم";
        const base = u.phone_number ? `${u.name} · ${u.phone_number}` : u.name;
        return {
          value: u.id,
          label: `${base} (${roleLabel})`,
        };
      })
      .sort((a, b) => {
        if (defaultOwnerUserId == null) return 0;
        if (a.value === defaultOwnerUserId) return -1;
        if (b.value === defaultOwnerUserId) return 1;
        return 0;
      });
  }, [usersData, defaultOwnerUserId]);

  useEffect(() => {
    if (!showCreatorSelect || defaultOwnerUserId == null) return;
    if (getValues("created_by") == null) {
      setValue("created_by", defaultOwnerUserId, { shouldValidate: true });
    }
  }, [showCreatorSelect, defaultOwnerUserId, getValues, setValue]);

  return (
    <Stack spacing={3}>
      {showCreatorSelect && (
        <>
          <Alert severity="info">
            مسئول آزمون کسی است که مالک آزمون محسوب می‌شود (مدیریت سوالات، نمره‌دهی و
            انتشار). می‌توانید خودتان یا یک معلم دیگر را انتخاب کنید؛ پیش‌فرض خود شماست.
          </Alert>
          <FormSelect
            name="created_by"
            control={control}
            label="مسئول آزمون"
            required
            disabled={usersLoading || ownerOptions.length === 0}
            options={ownerOptions}
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
