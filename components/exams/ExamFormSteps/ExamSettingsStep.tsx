"use client";

import { useEffect } from "react";
import {
  Stack,
  Autocomplete,
  Chip,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import GradeIcon from "@mui/icons-material/Grade";
import PercentIcon from "@mui/icons-material/Percent";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import DescriptionIcon from "@mui/icons-material/Description";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { Controller, UseFormReturn, useWatch } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { FormNumberField, RichTextField } from "@/components/forms";
import { DescriptiveGradingBands } from "@/components/exams/DescriptiveGradingBands";
import {
  getDefaultDescriptiveConfig,
  normalizeDescriptiveConfig,
} from "@/lib/grading";
import { GRADING_MODE_OPTIONS } from "@/lib/exam-form-labels";
import {
  FormStepSection,
  SelectableOptionCard,
} from "@/components/exams/create/form-step-ui";

const GRADING_ICONS = {
  numeric_percent: <PercentIcon />,
  numeric_scale: <LooksOneIcon />,
  descriptive: <DescriptionIcon />,
} as const;

interface ExamSettingsStepProps {
  form: UseFormReturn<ExamFormData>;
}

export function ExamSettingsStep({ form }: ExamSettingsStepProps) {
  const theme = useTheme();
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

  const setGradingMode = (next: ExamFormData["grading_mode"]) => {
    setValue("grading_mode", next, { shouldDirty: true, shouldValidate: true });
    if (next === "descriptive") {
      setValue(
        "grading_config",
        getDefaultDescriptiveConfig() as unknown as Record<string, unknown>,
        { shouldDirty: true }
      );
    } else if (next === "numeric_scale") {
      setValue("grading_config", { scale_max: 20, pass_min: 12 }, { shouldDirty: true });
    } else if (next === "numeric_percent") {
      setValue("grading_config", null, { shouldDirty: true });
    }
  };

  return (
    <Stack spacing={2}>
      <FormStepSection
        title="روش نمره‌دهی"
        description="نحوه محاسبه و نمایش نمره و قبولی شرکت‌کنندگان"
        icon={<GradeIcon fontSize="small" />}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: 1.5,
            mb: 2,
          }}
        >
          {GRADING_MODE_OPTIONS.map((opt) => (
            <SelectableOptionCard
              key={opt.value}
              selected={gradingMode === opt.value}
              onClick={() => setGradingMode(opt.value)}
              title={opt.title}
              description={opt.description}
              icon={GRADING_ICONS[opt.value]}
            />
          ))}
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.03),
          }}
        >
          {gradingMode === "numeric_percent" && (
            <FormNumberField
              name="passing_score"
              control={control}
              label="حداقل درصد قبولی"
              min={0}
              max={100}
              helperText="مثلاً ۵۰ یعنی نمره ۵۰٪ و بالاتر قبول است."
            />
          )}

          {gradingMode === "numeric_scale" && (
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="number"
                label="حداکثر نمره (سقف)"
                value={Number(gradingConfig.scale_max ?? 20)}
                onChange={(e) =>
                  setValue(
                    "grading_config",
                    { ...gradingConfig, scale_max: Number(e.target.value) },
                    { shouldDirty: true }
                  )
                }
                fullWidth
                inputProps={{ min: 1 }}
              />
              <TextField
                type="number"
                label="حداقل نمره قبولی"
                value={Number(gradingConfig.pass_min ?? 12)}
                onChange={(e) =>
                  setValue(
                    "grading_config",
                    { ...gradingConfig, pass_min: Number(e.target.value) },
                    { shouldDirty: true }
                  )
                }
                fullWidth
                inputProps={{ min: 0 }}
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
        </Box>
      </FormStepSection>

      <FormStepSection
        title="دستورالعمل و توضیحات آزمون"
        description="متنی که شرکت‌کننده قبل یا هنگام آزمون می‌بیند (قوانین، نکات، راهنما)"
        icon={<MenuBookIcon fontSize="small" />}
      >
        <Controller
          name="instructions"
          control={control}
          render={({ field }) => (
            <RichTextField
              label="متن دستورالعمل"
              value={field.value ?? ""}
              onChange={field.onChange}
              placeholder="قوانین آزمون، نحوه پاسخ‌دهی، ممنوعیت‌ها و..."
              helperText="این بخش ربطی به زمان انتشار نتیجه ندارد؛ فقط برای راهنمایی شرکت‌کننده است."
              error={!!errors.instructions}
            />
          )}
        />
      </FormStepSection>

      <FormStepSection
        title="انتشار نتیجه"
        description="شرایطی که باید برقرار باشد تا نمره و کارنامه برای شرکت‌کننده نمایش داده شود"
        icon={<VisibilityIcon fontSize="small" />}
      >
        <Stack spacing={0.5}>
          <Controller
            name="result_release_after_exam_end"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={{
                  alignItems: "flex-start",
                  mx: 0,
                  py: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
                control={
                  <Checkbox
                    checked={field.value ?? true}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      پس از پایان زمان برگزاری
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      تا وقتی بازه آزمون تمام نشده، نتیجه نهایی نشان داده نمی‌شود.
                    </Typography>
                  </Box>
                }
              />
            )}
          />
          <Controller
            name="result_release_after_grading_complete"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={{
                  alignItems: "flex-start",
                  mx: 0,
                  py: 1,
                  borderBottom: 1,
                  borderColor: "divider",
                }}
                control={
                  <Checkbox
                    checked={field.value ?? true}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      پس از اتمام تصحیح
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      همه سوالات (به‌ویژه تشریحی) باید نمره‌دهی شده باشند.
                    </Typography>
                  </Box>
                }
              />
            )}
          />
          <Controller
            name="result_release_requires_manual"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                sx={{ alignItems: "flex-start", mx: 0, py: 1 }}
                control={
                  <Checkbox
                    checked={field.value ?? false}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      انتشار دستی توسط برگزارکننده
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      حتی پس از برآورده شدن شرایط بالا، نتیجه تا زمان تأیید شما مخفی می‌ماند.
                    </Typography>
                  </Box>
                }
              />
            )}
          />
        </Stack>
      </FormStepSection>

      <FormStepSection
        title="برچسب‌ها (اختیاری)"
        description="برای جستجو و دسته‌بندی در لیست آزمون‌ها"
        icon={<LocalOfferIcon fontSize="small" />}
      >
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
                  <Chip
                    variant="outlined"
                    size="small"
                    label={option}
                    {...getTagProps({ index })}
                    key={`${option}-${index}`}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="برچسب"
                  placeholder="تایپ کنید و Enter بزنید"
                />
              )}
            />
          )}
        />
      </FormStepSection>
    </Stack>
  );
}
