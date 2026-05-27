"use client";

import React, { useMemo } from "react";
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { UseFormReturn, useWatch } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { RichLabel } from "@/components/editor";
import {
  EXAM_SCHEDULE_LABELS,
  EXAM_TYPE_LABELS,
  GRADING_MODE_LABELS,
} from "@/lib/exam-form-labels";
import {
  formatDescriptiveBandLine,
  normalizeDescriptiveConfig,
} from "@/lib/grading";
import { useUsers } from "@/hooks/useUsers";

interface ExamPreviewStepProps {
  form: UseFormReturn<ExamFormData>;
  showCreatorSelect?: boolean;
}

function PreviewRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={{ xs: 0.5, sm: 2 }}
      sx={{ py: 0.75 }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: { sm: 160 }, flexShrink: 0, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle1" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

function formatValue(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

export const ExamPreviewStep = React.memo(function ExamPreviewStep({
  form,
  showCreatorSelect = false,
}: ExamPreviewStepProps) {
  const { control } = form;
  const values = useWatch({ control });

  const { data: usersData } = useUsers(
    { per_page: 100 },
    { enabled: showCreatorSelect || values.created_by != null }
  );

  const ownerLabel = useMemo(() => {
    if (!values.created_by) return null;
    const user = usersData?.data?.find((u) => u.id === Number(values.created_by));
    if (!user) return `شناسه ${values.created_by}`;
    const roleLabel = user.roles?.includes("admin") ? "مدیر" : "معلم";
    return `${user.name} (${roleLabel})`;
  }, [values.created_by, usersData]);

  const gradingMode = values.grading_mode ?? "numeric_percent";
  const gradingConfig = (values.grading_config ?? {}) as Record<string, unknown>;
  const scheduleType = values.schedule_type ?? "fixed_window";

  const resultReleaseSummary = useMemo(() => {
    const parts: string[] = [];
    if (values.result_release_after_exam_end !== false) {
      parts.push("پس از پایان زمان برگزاری");
    }
    if (values.result_release_after_grading_complete !== false) {
      parts.push("پس از اتمام تصحیح");
    }
    if (values.result_release_requires_manual) {
      parts.push("نیاز به انتشار دستی");
    }
    return parts.length > 0 ? parts.join(" • ") : "بدون شرط فعال";
  }, [
    values.result_release_after_exam_end,
    values.result_release_after_grading_complete,
    values.result_release_requires_manual,
  ]);

  const descriptiveConfig =
    gradingMode === "descriptive"
      ? normalizeDescriptiveConfig(gradingConfig)
      : null;

  return (
    <Stack spacing={2.5}>
      <Alert severity="info">
        اطلاعات آزمون را در حالت نهایی بررسی کنید. برای ویرایش هر بخش، به مراحل قبل
        برگردید؛ سپس با دکمه پایین صفحه آزمون را ذخیره کنید.
      </Alert>

      <PreviewSection title="اطلاعات پایه">
        {showCreatorSelect && ownerLabel && (
          <PreviewRow label="مسئول آزمون">
            <Typography variant="body1">{ownerLabel}</Typography>
          </PreviewRow>
        )}
        <PreviewRow label="عنوان آزمون">
          <Typography variant="body1" fontWeight={600}>
            {values.title || "—"}
          </Typography>
        </PreviewRow>
        <PreviewRow label="نوع آزمون">
          <Chip
            size="small"
            label={EXAM_TYPE_LABELS[values.type ?? "online"]}
            color="primary"
            variant="outlined"
          />
        </PreviewRow>
      </PreviewSection>

      <PreviewSection title="روش نمره‌دهی">
        <PreviewRow label="نوع">
          <Typography variant="body1">
            {GRADING_MODE_LABELS[gradingMode] ?? gradingMode}
          </Typography>
        </PreviewRow>

        {gradingMode === "numeric_percent" && (
          <PreviewRow label="حداقل درصد قبولی">
            <Typography variant="body1">
              {values.passing_score != null
                ? `${values.passing_score}%`
                : "—"}
            </Typography>
          </PreviewRow>
        )}

        {gradingMode === "numeric_scale" && (
          <>
            <PreviewRow label="حداکثر نمره">
              <Typography variant="body1">
                {formatValue(gradingConfig.scale_max as number)}
              </Typography>
            </PreviewRow>
            <PreviewRow label="حداقل قبولی">
              <Typography variant="body1">
                {formatValue(gradingConfig.pass_min as number)}
              </Typography>
            </PreviewRow>
          </>
        )}

        {descriptiveConfig && (
          <PreviewRow label="پانگ‌های نمره">
            <Stack spacing={0.5}>
              {descriptiveConfig.bands.map((band, i) => (
                <Typography key={i} variant="body2">
                  {formatDescriptiveBandLine(band, descriptiveConfig.scale_max)}
                </Typography>
              ))}
            </Stack>
          </PreviewRow>
        )}
      </PreviewSection>

      <PreviewSection title="دستورالعمل و توضیحات">
        {values.instructions?.trim() ? (
          <RichLabel html={values.instructions} fontSize="0.95rem" />
        ) : (
          <Typography variant="body2" color="text.secondary">
            دستورالعملی ثبت نشده است.
          </Typography>
        )}
      </PreviewSection>

      <PreviewSection title="انتشار نتیجه">
        <Typography variant="body2">{resultReleaseSummary}</Typography>
      </PreviewSection>

      {(values.tags ?? []).length > 0 && (
        <PreviewSection title="برچسب‌ها">
          <Stack direction="row" flexWrap="wrap" gap={0.5}>
            {(values.tags ?? []).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" />
            ))}
          </Stack>
        </PreviewSection>
      )}

      <PreviewSection title="زمان‌بندی">
        <PreviewRow label="نوع زمان‌بندی">
          <Typography variant="body1">
            {EXAM_SCHEDULE_LABELS[scheduleType]}
          </Typography>
        </PreviewRow>

        {scheduleType === "duration_only" && (
          <PreviewRow label="مدت آزمون">
            <Typography variant="body1">
              {values.duration_minutes != null
                ? `${values.duration_minutes} دقیقه`
                : "—"}
            </Typography>
          </PreviewRow>
        )}

        {(scheduleType === "fixed_window" ||
          scheduleType === "registration_deadline") && (
          <>
            <PreviewRow label="تاریخ برگزاری">
              <Typography variant="body1">{formatValue(values.exam_date)}</Typography>
            </PreviewRow>
            <PreviewRow label="ساعت شروع">
              <Typography variant="body1">{formatValue(values.start_time)}</Typography>
            </PreviewRow>
            <PreviewRow label="ساعت پایان">
              <Typography variant="body1">{formatValue(values.end_time)}</Typography>
            </PreviewRow>
            <PreviewRow label="مدت آزمون">
              <Typography variant="body1">
                {values.duration_minutes != null
                  ? `${values.duration_minutes} دقیقه`
                  : "—"}
              </Typography>
            </PreviewRow>
          </>
        )}

        {scheduleType === "registration_deadline" && (
          <PreviewRow label="مهلت ثبت‌نام">
            <Typography variant="body1">{formatValue(values.register_until)}</Typography>
          </PreviewRow>
        )}

        {scheduleType === "flexible_until" && (
          <>
            <PreviewRow label="در دسترس از">
              <Typography variant="body1">{formatValue(values.available_from)}</Typography>
            </PreviewRow>
            <PreviewRow label="مهلت انجام تا">
              <Typography variant="body1">{formatValue(values.due_by)}</Typography>
            </PreviewRow>
            <PreviewRow label="مدت هر تلاش">
              <Typography variant="body1">
                {values.duration_minutes != null
                  ? `${values.duration_minutes} دقیقه`
                  : "—"}
              </Typography>
            </PreviewRow>
          </>
        )}
      </PreviewSection>
    </Stack>
  );
});
