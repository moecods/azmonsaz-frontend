"use client";

import React, { useMemo, useEffect } from "react";
import { Stack, Alert, Box } from "@mui/material";
import ScheduleIcon from "@mui/icons-material/Schedule";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import TimerIcon from "@mui/icons-material/Timer";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import DateRangeIcon from "@mui/icons-material/DateRange";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { PersianDatePicker } from "@/components/exams/PersianDatePicker";
import { PersianTimePicker } from "@/components/exams/PersianTimePicker";
import { PersianDateTimePicker } from "@/components/exams/PersianDateTimePicker";
import { FormNumberField } from "@/components/forms";
import {
  EXAM_SCHEDULE_LABELS,
  EXAM_SCHEDULE_DESCRIPTIONS,
} from "@/lib/exam-form-labels";
import {
  FormStepSection,
  SelectableOptionCard,
} from "@/components/exams/create/form-step-ui";

const SCHEDULE_TYPES = [
  "none",
  "fixed_window",
  "duration_only",
  "registration_deadline",
  "flexible_until",
] as const satisfies readonly NonNullable<ExamFormData["schedule_type"]>[];

const SCHEDULE_ICONS = {
  none: <EventBusyIcon />,
  fixed_window: <ScheduleIcon />,
  duration_only: <TimerIcon />,
  registration_deadline: <HowToRegIcon />,
  flexible_until: <DateRangeIcon />,
} as const;

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
    <Stack spacing={2}>
      <FormStepSection
        title="نوع زمان‌بندی"
        description="نحوه محدودیت زمانی برای شرکت در آزمون"
        icon={<ScheduleIcon fontSize="small" />}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
            gap: 1.5,
          }}
        >
          {SCHEDULE_TYPES.map((type) => (
            <Controller
              key={type}
              name="schedule_type"
              control={control}
              render={({ field }) => (
                <SelectableOptionCard
                  selected={(field.value ?? "fixed_window") === type}
                  onClick={() => field.onChange(type)}
                  title={EXAM_SCHEDULE_LABELS[type]}
                  description={EXAM_SCHEDULE_DESCRIPTIONS[type]}
                  icon={SCHEDULE_ICONS[type]}
                />
              )}
            />
          ))}
        </Box>
      </FormStepSection>

      {scheduleType === "none" && (
        <Alert severity="info" icon={<EventBusyIcon />}>
          این آزمون بدون بازه زمانی آنلاین ذخیره می‌شود. برای چاپ یا استفاده آفلاین مناسب است.
        </Alert>
      )}

      {scheduleType === "duration_only" && (
        <FormStepSection
          title="مدت پاسخ‌دهی"
          description="از لحظه ورود هر شرکت‌کننده به آزمون شمارش می‌شود"
          icon={<TimerIcon fontSize="small" />}
        >
          <FormNumberField
            name="duration_minutes"
            control={control}
            label="مدت آزمون (دقیقه)"
            min={1}
            helperText="مثلاً ۹۰ دقیقه برای کل آزمون از زمان ورود."
          />
        </FormStepSection>
      )}

      {(scheduleType === "fixed_window" || scheduleType === "registration_deadline") && (
        <FormStepSection
          title="بازه برگزاری"
          description="تاریخ و ساعتی که همه شرکت‌کنندگان مشترک دارند"
          icon={<AccessTimeIcon fontSize="small" />}
        >
          <Stack spacing={2.5}>
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
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 2,
              }}
            >
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
            </Box>
            <FormNumberField
              name="duration_minutes"
              control={control}
              label="حداکثر مدت پاسخ (دقیقه)"
              min={1}
              helperText={
                calculatedDuration != null
                  ? `پیشنهاد از بازه: ${calculatedDuration.toLocaleString("fa-IR")} دقیقه`
                  : "حداکثر زمانی که هر نفر می‌تواند در آزمون بماند"
              }
            />
            {calculatedDuration !== null &&
              durationMinutes != null &&
              durationMinutes > calculatedDuration && (
                <Alert severity="warning">
                  مدت پاسخ ({durationMinutes.toLocaleString("fa-IR")} دقیقه) بیشتر از
                  بازه شروع تا پایان ({calculatedDuration.toLocaleString("fa-IR")} دقیقه) است.
                </Alert>
              )}
          </Stack>
        </FormStepSection>
      )}

      {scheduleType === "registration_deadline" && (
        <FormStepSection
          title="مهلت ثبت‌نام"
          description="آخرین زمانی که فرد می‌تواند در آزمون ثبت‌نام کند"
          icon={<HowToRegIcon fontSize="small" />}
        >
          <Controller
            name="register_until"
            control={control}
            render={({ field }) => (
              <PersianDateTimePicker
                label="مهلت ثبت‌نام"
                value={field.value ?? null}
                onChange={field.onChange}
                error={!!errors.register_until}
                errorMessage={errors.register_until?.message}
              />
            )}
          />
        </FormStepSection>
      )}

      {scheduleType === "flexible_until" && (
        <FormStepSection
          title="بازه انعطاف‌پذیر"
          description="از چه زمانی آزمون باز است و تا چه تاریخی باید انجام شود"
          icon={<DateRangeIcon fontSize="small" />}
        >
          <Stack spacing={2.5}>
            <Controller
              name="available_from"
              control={control}
              render={({ field }) => (
                <PersianDateTimePicker
                  label="در دسترس از"
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="due_by"
              control={control}
              render={({ field }) => (
                <PersianDateTimePicker
                  label="مهلت انجام تا"
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
              )}
            />
            <FormNumberField
              name="duration_minutes"
              control={control}
              label="مدت هر بار ورود (دقیقه)"
              min={1}
              helperText="حداکثر زمان هر session پاسخ‌دهی پس از ورود."
            />
          </Stack>
        </FormStepSection>
      )}
    </Stack>
  );
});
