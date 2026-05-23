"use client";

import { useEffect } from "react";
import {
  Stack,
  Autocomplete,
  Chip,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  Typography,
  Divider,
} from "@mui/material";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { FormNumberField, RichTextField } from "@/components/forms";
import { DescriptiveGradingBands } from "@/components/exams/DescriptiveGradingBands";
import {
  getDefaultDescriptiveConfig,
  normalizeDescriptiveConfig,
} from "@/lib/grading";

interface ExamSettingsStepProps {
  form: UseFormReturn<ExamFormData>;
}

export function ExamSettingsStep({ form }: ExamSettingsStepProps) {
  const { control, formState: { errors }, setValue } = form;
  const gradingMode = useWatch({ control, name: "grading_mode" }) ?? "numeric_percent";
  const gradingConfigRaw = useWatch({ control, name: "grading_config" });
  const gradingConfig = (gradingConfigRaw ?? {}) as Record<string, unknown>;

  useEffect(() => {
    if (gradingMode === "descriptive") {
      const normalized = normalizeDescriptiveConfig(
        gradingConfigRaw as Record<string, unknown> | null
      );
      if (!gradingConfigRaw || !Array.isArray((gradingConfigRaw as { bands?: unknown })?.bands)) {
        setValue("grading_config", normalized as unknown as Record<string, unknown>, {
          shouldDirty: true,
        });
      }
    }
  }, [gradingMode, gradingConfigRaw, setValue]);

  const descriptiveConfig = normalizeDescriptiveConfig(gradingConfig);

  return (
    <Stack spacing={3}>
      <Controller
        name="grading_mode"
        control={control}
        render={({ field }) => (
          <FormControl>
            <FormLabel>روش نمره‌دهی</FormLabel>
            <RadioGroup
              value={field.value ?? "numeric_percent"}
              onChange={(e) => {
                const next = e.target.value as ExamFormData["grading_mode"];
                field.onChange(next);
                if (next === "descriptive") {
                  setValue(
                    "grading_config",
                    getDefaultDescriptiveConfig() as unknown as Record<string, unknown>,
                    { shouldDirty: true }
                  );
                } else if (next === "numeric_scale") {
                  setValue(
                    "grading_config",
                    { scale_max: 20, pass_min: 12 },
                    { shouldDirty: true }
                  );
                } else if (next === "numeric_percent") {
                  setValue("grading_config", null, { shouldDirty: true });
                }
              }}
            >
              <FormControlLabel
                value="numeric_percent"
                control={<Radio />}
                label="درصدی (نمره قبولی %)"
              />
              <FormControlLabel
                value="numeric_scale"
                control={<Radio />}
                label="مقیاس عددی (مثلاً از ۲۰)"
              />
              <FormControlLabel
                value="descriptive"
                control={<Radio />}
                label="توصیفی (پانگ‌های نمره: خیلی خوب، خوب، …)"
              />
            </RadioGroup>
          </FormControl>
        )}
      />

      {gradingMode === "numeric_percent" && (
        <FormNumberField
          name="passing_score"
          control={control}
          label="نمره قبولی (%)"
          min={0}
          max={100}
        />
      )}

      {gradingMode === "numeric_scale" && (
        <Stack direction="row" spacing={2}>
          <TextField
            type="number"
            label="حداکثر نمره"
            value={Number(gradingConfig.scale_max ?? 20)}
            onChange={(e) =>
              setValue("grading_config", {
                ...gradingConfig,
                scale_max: Number(e.target.value),
              })
            }
            sx={{ flex: 1 }}
          />
          <TextField
            type="number"
            label="حداقل قبولی"
            value={Number(gradingConfig.pass_min ?? 12)}
            onChange={(e) =>
              setValue("grading_config", {
                ...gradingConfig,
                pass_min: Number(e.target.value),
              })
            }
            sx={{ flex: 1 }}
          />
        </Stack>
      )}

      {gradingMode === "descriptive" && (
        <DescriptiveGradingBands
          value={descriptiveConfig}
          onChange={(config) =>
            setValue("grading_config", config as unknown as Record<string, unknown>, {
              shouldDirty: true,
            })
          }
        />
      )}

      <Divider />
      <Typography variant="subtitle1" fontWeight={600}>
        انتشار نتیجه
      </Typography>
      <Typography variant="body2" color="text.secondary">
        همه گزینه‌های فعال باید برقرار باشند تا شرکت‌کننده نتیجه کامل را ببیند.
      </Typography>
      <Controller
        name="result_release_after_exam_end"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value ?? true}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label="پس از پایان زمان برگزاری آزمون"
          />
        )}
      />
      <Controller
        name="result_release_after_grading_complete"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value ?? true}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label="پس از اتمام تصحیح تمام سوالات"
          />
        )}
      />
      <Controller
        name="result_release_requires_manual"
        control={control}
        render={({ field }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={field.value ?? false}
                onChange={(e) => field.onChange(e.target.checked)}
              />
            }
            label="نیاز به انتشار دستی توسط برگزارکننده"
          />
        )}
      />

      <Controller
        name="instructions"
        control={control}
        render={({ field }) => (
          <RichTextField
            label="توضیحات و دستورالعمل آزمون"
            value={field.value ?? ""}
            onChange={field.onChange}
            placeholder="قوانین، توضیحات و دستورالعمل آزمون"
            helperText="به شرکت‌کنندگان قبل و حین آزمون نمایش داده می‌شود"
            error={!!errors.instructions}
          />
        )}
      />

      <Controller
        name="tags"
        control={control}
        render={({ field }) => (
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={field.value || []}
            onChange={(_, newValue) => field.onChange(newValue)}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} key={index} />
              ))
            }
            renderInput={(params) => (
              <TextField {...params} label="تگ‌ها" placeholder="تگ + Enter" />
            )}
          />
        )}
      />
    </Stack>
  );
}
