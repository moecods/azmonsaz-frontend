"use client";

import React from "react";
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
  Typography,
} from "@mui/material";
import { Controller, UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { FormNumberField, RichTextField } from "@/components/forms";

interface ExamSettingsStepProps {
  form: UseFormReturn<ExamFormData>;
}

export const ExamSettingsStep = React.memo(function ExamSettingsStep({
  form,
}: ExamSettingsStepProps) {
  const { control, formState: { errors }, watch, setValue } = form;
  const gradingMode = watch("grading_mode") ?? "numeric_percent";
  const gradingConfig = (watch("grading_config") ?? {}) as Record<string, unknown>;

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
              onChange={(e) => field.onChange(e.target.value)}
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
                label="توصیفی (بدون عدد)"
              />
              <FormControlLabel
                value="banded"
                control={<Radio />}
                label="پانگ‌های توصیفی"
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

      {gradingMode === "banded" && (
        <Typography variant="body2" color="text.secondary">
          پانگ‌ها در فیلد grading_config ذخیره می‌شوند (قابل گسترش در ویرایش پیشرفته).
        </Typography>
      )}

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
});
