"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Stack,
} from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';
import { BasicInfoStep, ExamSettingsStep, SchedulingStep } from './ExamFormSteps';

interface ExamFormWizardProps {
  form: UseFormReturn<ExamFormData>;
  onSubmit: (data: ExamFormData, redirectToQuestions: boolean) => void;
  isSubmitting: boolean;
  existingExam?: boolean;
}

const steps = [
  'اطلاعات پایه',
  'تنظیمات آزمون',
  'زمان‌بندی',
];

const stepValidationFields: (keyof ExamFormData)[][] = [
  ['title', 'description', 'subject'],
  ['duration_minutes', 'passing_score', 'max_attempts', 'instructions', 'tags'],
  ['start_at', 'end_at'],
];

export function ExamFormWizard({ form, onSubmit, isSubmitting, existingExam }: ExamFormWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { handleSubmit, trigger } = form;

  const handleNext = async () => {
    const fieldsToValidate = stepValidationFields[activeStep] || [];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleFormSubmit = (data: ExamFormData, redirectToQuestions: boolean) => {
    onSubmit(data, redirectToQuestions);
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return <BasicInfoStep form={form} />;
      case 1:
        return <ExamSettingsStep form={form} />;
      case 2:
        return <SchedulingStep form={form} />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: 300 }}>
          {renderStepContent(activeStep)}
        </Box>

        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 4 }}>
          {activeStep > 0 && (
            <Button onClick={handleBack} disabled={isSubmitting}>
              قبلی
            </Button>
          )}
          {activeStep < steps.length - 1 ? (
            <Button variant="contained" onClick={handleNext}>
              بعدی
            </Button>
          ) : (
            <>
              {!existingExam && (
                <>
                  <Button
                    variant="contained"
                    onClick={handleSubmit((data) => handleFormSubmit(data, false))}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'در حال ایجاد...' : 'ایجاد آزمون'}
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit((data) => handleFormSubmit(data, true))}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'در حال ایجاد...' : 'ایجاد و افزودن سوال'}
                  </Button>
                </>
              )}
              {existingExam && (
                <Button
                  variant="contained"
                  onClick={handleSubmit((data) => handleFormSubmit(data, false))}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'در حال ذخیره...' : 'به‌روزرسانی آزمون'}
                </Button>
              )}
            </>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

