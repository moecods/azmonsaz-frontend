"use client";

import { useState, useMemo } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Paper,
  Typography,
  Divider,
  Chip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { UseFormReturn, useWatch } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import { BasicInfoStep, ExamSettingsStep, SchedulingStep } from "./ExamFormSteps";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { focusFirstFormError } from "@/lib/form-errors";

const STEPS = ["اطلاعات پایه", "تنظیمات و نمره‌دهی", "زمان‌بندی"];

interface ExamFormWizardProps {
  form: UseFormReturn<ExamFormData>;
  onSubmit: (data: ExamFormData, redirectToQuestions: boolean) => void;
  isSubmitting: boolean;
  existingExam?: boolean;
}

export function ExamFormWizard({
  form,
  onSubmit,
  isSubmitting,
  existingExam,
}: ExamFormWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const { handleSubmit, control, trigger } = form;

  const type = useWatch({ control, name: "type" });
  const durationMinutes = useWatch({ control, name: "duration_minutes" });
  const gradingMode = useWatch({ control, name: "grading_mode" });
  const scheduleType = useWatch({ control, name: "schedule_type" });

  const stepFields: (keyof ExamFormData)[][] = [
    ["title", "type"],
    ["passing_score", "grading_mode", "grading_config", "instructions", "tags"],
    [
      "schedule_type",
      "exam_date",
      "start_time",
      "end_time",
      "duration_minutes",
      "available_from",
      "due_by",
      "register_until",
    ],
  ];

  const handleNext = async () => {
    const ok = await trigger(stepFields[activeStep]);
    if (!ok) {
      focusFirstFormError(form.formState.errors);
      return;
    }
    setActiveStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const previewChips = useMemo(() => {
    const chips: string[] = [];
    if (type) chips.push(type === "online" ? "آنلاین" : "آفلاین");
    if (durationMinutes) chips.push(`${durationMinutes} دقیقه`);
    if (gradingMode) chips.push(gradingMode);
    if (scheduleType) chips.push(scheduleType);
    return chips;
  }, [type, durationMinutes, gradingMode, scheduleType]);

  return (
    <Card>
      <CardContent>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Paper variant="outlined" sx={{ p: 3, mb: 3, minHeight: 280 }}>
          {activeStep === 0 && <BasicInfoStep form={form} />}
          {activeStep === 1 && <ExamSettingsStep form={form} />}
          {activeStep === 2 && <SchedulingStep form={form} />}
        </Paper>

        {formData.title && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => setShowPreview(!showPreview)}
              fullWidth
            >
              {showPreview ? "مخفی کردن پیش‌نمایش" : "پیش‌نمایش آزمون"}
            </Button>
            {showPreview && (
              <Paper sx={{ p: 2, mt: 2, bgcolor: "grey.50" }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {formData.title}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1, gap: 0.5 }}>
                  {previewChips.map((c) => (
                    <Chip key={c} label={c} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Paper>
            )}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          sx={{
            position: "sticky",
            bottom: 0,
            py: 2,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            zIndex: 1,
          }}
        >
          <Button disabled={activeStep === 0} onClick={handleBack}>
            قبلی
          </Button>
          <Stack direction="row" spacing={2}>
            {activeStep < STEPS.length - 1 ? (
              <Button variant="contained" onClick={handleNext}>
                بعدی
              </Button>
            ) : (
              <>
                {!existingExam && (
                  <>
                    <Button
                      variant="outlined"
                      onClick={handleSubmit((data) => onSubmit(data, false))}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "در حال ایجاد..." : "ایجاد آزمون"}
                    </Button>
                    <Button
                      variant="contained"
                      onClick={handleSubmit((data) => onSubmit(data, true))}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "در حال ایجاد..." : "ایجاد و افزودن سوال"}
                    </Button>
                  </>
                )}
                {existingExam && (
                  <Button
                    variant="contained"
                    onClick={handleSubmit((data) => onSubmit(data, false))}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "در حال ذخیره..." : "به‌روزرسانی آزمون"}
                  </Button>
                )}
              </>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
