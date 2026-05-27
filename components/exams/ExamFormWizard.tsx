"use client";

import { useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";
import CheckIcon from "@mui/icons-material/Check";
import { UseFormReturn } from "react-hook-form";
import { ExamFormData } from "@/lib/validation";
import {
  BasicInfoStep,
  ExamSettingsStep,
  SchedulingStep,
  ExamPreviewStep,
} from "./ExamFormSteps";
import { focusFirstFormError } from "@/lib/form-errors";
import {
  EXAM_FORM_PREVIEW_STEP_INDEX,
  EXAM_FORM_STEPS,
} from "@/components/exams/create/exam-form-steps";
import { shadows } from "@/theme/tokens";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeStep, setActiveStep] = useState(0);
  const { handleSubmit, trigger, setFocus } = form;

  const currentStep = EXAM_FORM_STEPS[activeStep];
  const StepIcon = currentStep.icon;
  const isPreviewStep = activeStep === EXAM_FORM_PREVIEW_STEP_INDEX;

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
    const isBeforePreview = activeStep === EXAM_FORM_PREVIEW_STEP_INDEX - 1;
    const fieldsToValidate = isBeforePreview
      ? stepFields.flat()
      : stepFields[activeStep];

    const ok = await trigger(fieldsToValidate);
    if (!ok) {
      focusFirstFormError(form.formState.errors, setFocus);
      return;
    }
    setActiveStep((s) => Math.min(s + 1, EXAM_FORM_PREVIEW_STEP_INDEX));
  };

  const handleBack = () => setActiveStep((s) => Math.max(s - 1, 0));

  const sidebarBg = `linear-gradient(180deg, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.08)} 0%, ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.05 : 0.02)} 100%)`;

  return (
    <Box
      sx={{
        border: 1,
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        boxShadow: (t) =>
          t.palette.mode === "dark" ? shadows.cardDark : shadows.cardLight,
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "minmax(220px, 260px) minmax(0, 1fr)" },
          alignItems: "stretch",
        }}
      >
        {/* Step navigation */}
        <Box
          sx={{
            p: { xs: 2, md: 2.5 },
            borderBottom: { xs: 1, md: 0 },
            borderInlineEnd: { md: 1 },
            borderColor: "divider",
            background: sidebarBg,
            borderStartStartRadius: { md: 12 },
            borderEndStartRadius: { md: 12 },
          }}
        >
          <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={0.6}>
            مراحل ساخت
          </Typography>

          <Stack spacing={0.75} sx={{ mt: 1.5, display: { xs: "none", md: "flex" } }}>
            {EXAM_FORM_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isDone = index < activeStep;

              return (
                <Box
                  key={step.id}
                  component="button"
                  type="button"
                  onClick={() => setActiveStep(index)}
                  sx={{
                    width: "100%",
                    textAlign: "start",
                    p: 1.25,
                    border: 1,
                    borderColor: isActive ? "primary.main" : "transparent",
                    borderRadius: 2,
                    cursor: "pointer",
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, 0.14)
                      : isDone
                        ? alpha(theme.palette.success.main, 0.08)
                        : alpha(theme.palette.background.paper, 0.55),
                    color: "text.primary",
                    transition: "background-color 0.2s, border-color 0.2s",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, isActive ? 0.16 : 0.1),
                      borderColor: isActive ? "primary.main" : alpha(theme.palette.primary.main, 0.35),
                    },
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1.5,
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: isActive
                          ? "primary.main"
                          : isDone
                            ? alpha(theme.palette.success.main, 0.2)
                            : alpha(theme.palette.action.hover, 0.8),
                        color: isActive
                          ? "primary.contrastText"
                          : isDone
                            ? "success.dark"
                            : "text.secondary",
                      }}
                    >
                      {isDone ? (
                        <CheckIcon sx={{ fontSize: 18 }} />
                      ) : (
                        <Icon sx={{ fontSize: 18 }} />
                      )}
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={isActive ? 800 : 600}
                        sx={{ lineHeight: 1.4 }}
                      >
                        {step.label}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.25, lineHeight: 1.5 }}
                      >
                        {step.description}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              );
            })}
          </Stack>

          {/* Mobile: compact horizontal chips */}
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={0.75}
            sx={{ mt: 1.5, display: { xs: "flex", md: "none" } }}
          >
            {EXAM_FORM_STEPS.map((step, index) => (
              <Button
                key={step.id}
                size="small"
                variant={index === activeStep ? "contained" : "outlined"}
                onClick={() => setActiveStep(index)}
                sx={{ minWidth: 0, px: 1.25, fontSize: "0.75rem" }}
              >
                {step.shortLabel}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* Step content — minmax(0,1fr) prevents horizontal clip in RTL */}
        <Stack
          sx={{
            minWidth: 0,
            width: "100%",
            maxWidth: "100%",
            borderStartEndRadius: { md: 12 },
            borderEndEndRadius: { md: 12 },
          }}
        >
          <Box
            sx={{
              width: "100%",
              boxSizing: "border-box",
              px: { xs: 2, md: 3 },
              py: 2,
              borderBottom: 1,
              borderColor: "divider",
              background: `linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ minWidth: 0 }}>
              <Box
                sx={{
                  color: "primary.main",
                  display: "flex",
                  flexShrink: 0,
                  width: 40,
                  height: 40,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <StepIcon fontSize="small" />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle1" fontWeight={800} noWrap={false}>
                  {currentStep.label}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", mt: 0.25, lineHeight: 1.6, wordBreak: "break-word" }}
                >
                  {currentStep.description} — مرحله {(activeStep + 1).toLocaleString("fa-IR")} از{" "}
                  {EXAM_FORM_STEPS.length.toLocaleString("fa-IR")}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box
            sx={{
              flex: 1,
              px: { xs: 2, md: 3 },
              py: 3,
              minHeight: 280,
              bgcolor: (t) =>
                t.palette.mode === "dark"
                  ? alpha(t.palette.background.default, 0.4)
                  : alpha(t.palette.grey[100], 0.65),
            }}
          >
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
          </Box>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{
              width: "100%",
              boxSizing: "border-box",
              px: { xs: 2, md: 3 },
              py: 2,
              borderTop: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowForwardIcon />}
              sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
            >
              مرحله قبل
            </Button>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {!isPreviewStep ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<ArrowBackIcon />}
                  fullWidth={isMobile}
                >
                  مرحله بعد
                </Button>
              ) : (
                <>
                  {!existingExam && (
                    <>
                      <Button
                        variant="outlined"
                        onClick={handleSubmit((data) => onSubmit(data, false))}
                        disabled={isSubmitting}
                        startIcon={
                          isSubmitting ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <SaveIcon />
                          )
                        }
                        fullWidth={isMobile}
                      >
                        {isSubmitting ? "در حال ایجاد..." : "ایجاد آزمون"}
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleSubmit((data) => onSubmit(data, true))}
                        disabled={isSubmitting}
                        startIcon={
                          isSubmitting ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <PlaylistAddIcon />
                          )
                        }
                        fullWidth={isMobile}
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
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )
                      }
                      fullWidth={isMobile}
                    >
                      {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
                    </Button>
                  )}
                </>
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
