"use client";

import React, { useMemo, useEffect } from "react";
import {
  Stack,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { PersianDatePicker } from "@/components/exams/PersianDatePicker";
import { PersianTimePicker } from "@/components/exams/PersianTimePicker";
import { FormNumberField } from "@/components/forms";
import { EXAM_SCHEDULE_LABELS } from "@/lib/exam-form-labels";

interface SchedulingStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const SchedulingStep = React.memo(function SchedulingStep({
  form,
}: SchedulingStepProps) {
  const { control, formState: { errors }, setValue } = form;

  const scheduleType = useWatch({ control, name: "schedule_type" }) ?? "fixed_window";
  const examDate = useWatch({ control, name: "exam_date" });
  const startTime = useWatch({ control, name: "start_time" });
  const endTime = useWatch({ control, name: "end_time" });
  const durationMinutes = useWatch({ control, name: "duration_minutes" });

  const calculatedDuration = useMemo(() => {
    if (examDate && startTime && endTime) {
      const startDateTime = `${examDate}T${startTime}:00`;
      const endDateTime = `${examDate}T${endTime}:00`;
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);
      if (endDate > startDate) {
        return Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60));
      }
    }
    return null;
  }, [examDate, startTime, endTime]);

  useEffect(() => {
    if (
      scheduleType === "fixed_window" &&
      calculatedDuration !== null &&
      (durationMinutes === undefined || durationMinutes === null || durationMinutes === 0)
    ) {
      setValue("duration_minutes", calculatedDuration, { shouldValidate: true });
    }
  }, [calculatedDuration, durationMinutes, setValue, scheduleType]);

  return (
    <Stack spacing={3}>
      <Controller
        name="schedule_type"
        control={control}
        render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel>نوع زمان‌بندی</InputLabel>
            <Select {...field} label="نوع زمان‌بندی" value={field.value ?? "fixed_window"}>
              {Object.entries(EXAM_SCHEDULE_LABELS).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      />

      {scheduleType === "none" && (
        <Alert severity="info">آزمون بدون محدودیت زمانی آنلاین ذخیره می‌شود.</Alert>
      )}

      {scheduleType === "duration_only" && (
        <FormNumberField
          name="duration_minutes"
          control={control}
          label="مدت آزمون (دقیقه)"
          min={1}
          helperText="زمان شروع هنگام ورود شرکت‌کننده به آزمون ثبت می‌شود."
        />
      )}

      {(scheduleType === "fixed_window" || scheduleType === "registration_deadline") && (
        <Stack spacing={3}>
          <Controller
            name="exam_date"
            control={control}
            render={({ field }) => (
              <PersianDatePicker
                label="تاریخ برگزاری"
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
          />
        </Stack>
      )}

      {scheduleType === "registration_deadline" && (
        <Controller
          name="register_until"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              label="مهلت ثبت‌نام (ISO datetime)"
              fullWidth
              helperText="مثال: 2026-05-25T23:59:00"
            />
          )}
        />
      )}

      {scheduleType === "flexible_until" && (
        <Stack spacing={2}>
          <Controller
            name="available_from"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                label="در دسترس از"
                fullWidth
              />
            )}
          />
          <Controller
            name="due_by"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                value={field.value ?? ""}
                label="مهلت انجام تا"
                fullWidth
              />
            )}
          />
          <FormNumberField
            name="duration_minutes"
            control={control}
            label="مدت هر تلاش (دقیقه)"
            min={1}
          />
        </Stack>
      )}

      {calculatedDuration !== null &&
        durationMinutes != null &&
        durationMinutes > calculatedDuration && (
          <Typography variant="body2" color="warning.main">
            مدت ({durationMinutes} دقیقه) بیشتر از بازه شروع–پایان ({calculatedDuration} دقیقه) است.
          </Typography>
        )}
    </Stack>
  );
});
