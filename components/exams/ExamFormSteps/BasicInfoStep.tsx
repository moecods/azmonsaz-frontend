"use client";

import React, { useEffect, useMemo } from "react";
import { Alert, Box, Stack, Typography } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import TitleIcon from "@mui/icons-material/Title";
import ComputerIcon from "@mui/icons-material/Computer";
import PrintIcon from "@mui/icons-material/Print";
import { Controller, UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { FormField, FormSelect } from "@/components/forms";
import { useUsers } from "@/hooks/useUsers";
import {
  FormStepSection,
  SelectableOptionCard,
} from "@/components/exams/create/form-step-ui";

interface BasicInfoStepProps {
  form: UseFormReturn<ExamFormData>;
  showCreatorSelect?: boolean;
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
    <Stack spacing={2}>
      {showCreatorSelect && (
        <FormStepSection
          title="مسئول آزمون"
          description="مالک آزمون برای مدیریت سوالات، تصحیح و انتشار"
          icon={<PersonIcon fontSize="small" />}
        >
          <Alert severity="info" sx={{ mb: 2 }}>
            پیش‌فرض خود شماست؛ می‌توانید معلم دیگری را انتخاب کنید.
          </Alert>
          <FormSelect
            name="created_by"
            control={control}
            label="انتخاب مسئول"
            required
            disabled={usersLoading || ownerOptions.length === 0}
            options={ownerOptions}
          />
        </FormStepSection>
      )}

      <FormStepSection
        title="مشخصات آزمون"
        description="عنوان و نحوه برگزاری (آنلاین یا آفلاین)"
        icon={<TitleIcon fontSize="small" />}
      >
        <Stack spacing={2.5}>
          <FormField
            name="title"
            control={control}
            label="عنوان آزمون"
            required
            placeholder="مثال: آزمون ریاضی پایه دهم — نوبت اول"
          />

          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
              نوع برگزاری
            </Typography>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  <SelectableOptionCard
                    selected={field.value === "online"}
                    onClick={() => field.onChange("online")}
                    title="آنلاین"
                    description="شرکت در آزمون از طریق پلتفرم و لینک"
                    icon={<ComputerIcon />}
                  />
                  <SelectableOptionCard
                    selected={field.value === "offline"}
                    onClick={() => field.onChange("offline")}
                    title="آفلاین / چاپی"
                    description="برگه آزمون یا حضوری — بدون آزمون آنلاین"
                    icon={<PrintIcon />}
                  />
                </Box>
              )}
            />
          </Box>
        </Stack>
      </FormStepSection>
    </Stack>
  );
});
