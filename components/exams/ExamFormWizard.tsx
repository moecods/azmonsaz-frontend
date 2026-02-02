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
  Typography,
} from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';
import { PersianDateTimePicker } from '@/components/exams/PersianDateTimePicker';
import { Controller } from 'react-hook-form';
import { TextField, Autocomplete, Chip, Divider } from '@mui/material';

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

export function ExamFormWizard({ form, onSubmit, isSubmitting, existingExam }: ExamFormWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const { control, handleSubmit, formState: { errors }, trigger } = form;

  const handleNext = async () => {
    let fieldsToValidate: (keyof ExamFormData)[] = [];
    
    if (activeStep === 0) {
      fieldsToValidate = ['title', 'description', 'subject'];
    } else if (activeStep === 1) {
      fieldsToValidate = ['duration_minutes', 'passing_score', 'max_attempts', 'instructions', 'tags'];
    } else if (activeStep === 2) {
      fieldsToValidate = ['start_at', 'end_at'];
    }

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
        return (
          <Stack spacing={3}>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="عنوان آزمون"
                  fullWidth
                  required
                  error={!!errors.title}
                  helperText={errors.title?.message}
                  placeholder="مثال: آزمون ریاضی پایه دهم"
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="توضیحات"
                  fullWidth
                  multiline
                  rows={3}
                  error={!!errors.description}
                  helperText={errors.description?.message}
                  placeholder="توضیحات مربوط به آزمون را اینجا وارد کنید..."
                />
              )}
            />

            <Controller
              name="subject"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="موضوع"
                  fullWidth
                  error={!!errors.subject}
                  helperText={errors.subject?.message}
                  placeholder="مثال: ریاضی، فیزیک، شیمی"
                />
              )}
            />
          </Stack>
        );

      case 1:
        return (
          <Stack spacing={3}>
            <Stack direction="row" spacing={2}>
              <Controller
                name="duration_minutes"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="مدت زمان (دقیقه)"
                    type="number"
                    fullWidth
                    error={!!errors.duration_minutes}
                    helperText={errors.duration_minutes?.message}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                )}
              />

              <Controller
                name="passing_score"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="نمره قبولی (%)"
                    type="number"
                    fullWidth
                    error={!!errors.passing_score}
                    helperText={errors.passing_score?.message}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    inputProps={{ min: 0, max: 100 }}
                  />
                )}
              />

              <Controller
                name="max_attempts"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="حداکثر تلاش"
                    type="number"
                    fullWidth
                    error={!!errors.max_attempts}
                    helperText={errors.max_attempts?.message}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                    inputProps={{ min: 1 }}
                  />
                )}
              />
            </Stack>

            <Controller
              name="instructions"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="دستورالعمل آزمون"
                  fullWidth
                  multiline
                  rows={4}
                  error={!!errors.instructions}
                  helperText={errors.instructions?.message}
                  placeholder="دستورالعمل‌های آزمون را اینجا وارد کنید..."
                  value={field.value ?? ''}
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
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="تگ‌ها"
                      placeholder="تگ اضافه کنید و Enter بزنید"
                      error={!!errors.tags}
                      helperText={errors.tags?.message}
                    />
                  )}
                />
              )}
            />
          </Stack>
        );

      case 2:
        return (
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              زمان‌بندی آزمون اختیاری است. در صورت تعیین، شرکت‌کنندگان فقط در بازه زمانی مشخص شده می‌توانند در آزمون شرکت کنند.
            </Typography>

            <Stack direction="row" spacing={2}>
              <Controller
                name="start_at"
                control={control}
                render={({ field }) => (
                  <PersianDateTimePicker
                    label="زمان شروع"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    error={!!errors.start_at}
                    errorMessage={errors.start_at?.message}
                  />
                )}
              />

              <Controller
                name="end_at"
                control={control}
                render={({ field }) => (
                  <PersianDateTimePicker
                    label="زمان پایان"
                    value={field.value ?? null}
                    onChange={field.onChange}
                    error={!!errors.end_at}
                    errorMessage={errors.end_at?.message}
                  />
                )}
              />
            </Stack>
          </Stack>
        );

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

