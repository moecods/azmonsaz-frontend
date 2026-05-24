"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import {
  BasicInfoStep,
  ExamSettingsStep,
  SchedulingStep,
  ExamPreviewStep,
} from "./ExamFormSteps";
import { focusFirstFormError } from "@/lib/form-errors";

const STEPS = [
  "اطلاعات پایه",
  "تنظیمات و نمره‌دهی",
  "زمان‌بندی",
  "پیش‌نمایش آزمون",
];

const PREVIEW_STEP_INDEX = STEPS.length - 1;

interface ExamFormWizardProps {
  form: UseFormReturn<ExamFormData>;
  onSubmit: (data: ExamFormData, redirectToQuestions: boolean) => void;
  isSubmitting: boolean;
  existingExam?: boolean;
  showCreatorSelect?: boolean;
  defaultOwnerUserId?: number | null;
}

export function ExamFormWizard({
  form,
  onSubmit,
  isSubmitting,
  existingExam,
  showCreatorSelect = false,
  defaultOwnerUserId = null,
}: ExamFormWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { handleSubmit, trigger } = form;

  const stepFields: (keyof ExamFormData)[][] = [
    showCreatorSelect ? ["created_by", "title", "type"] : ["title", "type"],
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
    [],
  ];

  const handleNext = async () => {
    const isBeforePreview = activeStep === PREVIEW_STEP_INDEX - 1;
    const fieldsToValidate = isBeforePreview
      ? stepFields.flat()
      : stepFields[activeStep];

    const ok = await trigger(fieldsToValidate);
    if (!ok) {
      focusFirstFormError(form.formState.errors);
      return;
    }
    setActiveStep((s) => Math.min(s + 1, PREVIEW_STEP_INDEX));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const isPreviewStep = activeStep === PREVIEW_STEP_INDEX;

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
          {activeStep === 0 && (
            <BasicInfoStep
              form={form}
              showCreatorSelect={showCreatorSelect && !existingExam}
              defaultOwnerUserId={defaultOwnerUserId}
            />
          )}
          {activeStep === 1 && <ExamSettingsStep form={form} />}
          {activeStep === 2 && <SchedulingStep form={form} />}
          {isPreviewStep && (
            <ExamPreviewStep
              form={form}
              showCreatorSelect={showCreatorSelect && !existingExam}
            />
          )}
        </Paper>

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
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap justifyContent="flex-end">
            {!isPreviewStep ? (
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
