"use client";

import { useState, useMemo } from 'react';
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
} from '@mui/material';
import { UseFormReturn } from 'react-hook-form';
import { ExamFormData } from '@/lib/validation';
import { BasicInfoStep, ExamSettingsStep, SchedulingStep } from './ExamFormSteps';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface ExamFormWizardProps {
  form: UseFormReturn<ExamFormData>;
  onSubmit: (data: ExamFormData, redirectToQuestions: boolean) => void;
  isSubmitting: boolean;
  existingExam?: boolean;
}

export function ExamFormWizard({ form, onSubmit, isSubmitting, existingExam }: ExamFormWizardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const { handleSubmit, watch } = form;

  const title = watch('title');
  const description = watch('description');
  const subject = watch('subject');
  const type = watch('type');
  const duration_minutes = watch('duration_minutes');
  const passing_score = watch('passing_score');
  const instructions = watch('instructions');
  const tags = watch('tags');
  const exam_date = watch('exam_date');
  const start_time = watch('start_time');
  const end_time = watch('end_time');

  const formData = useMemo(() => ({
    title,
    description,
    subject,
    type,
    duration_minutes,
    passing_score,
    instructions,
    tags,
    exam_date,
    start_time,
    end_time,
  }), [title, description, subject, type, duration_minutes, passing_score, instructions, tags, exam_date, start_time, end_time]);

  return (
    <Card>
      <CardContent>
        <Stack spacing={4}>
          {/* Form Sections */}
          <Stack spacing={4}>
            {/* Basic Information Section */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                اطلاعات پایه
              </Typography>
              <BasicInfoStep form={form} />
            </Box>

            <Divider />

            {/* Exam Settings Section */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                تنظیمات آزمون
              </Typography>
              <ExamSettingsStep form={form} />
          </Box>

            <Divider />

            {/* Scheduling Section */}
            <Box>
              <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
                زمان‌بندی (اختیاری)
              </Typography>
              <SchedulingStep form={form} />
            </Box>
          </Stack>

          {/* Preview Section */}
          {formData.title && (
            <Box>
              <Divider sx={{ my: 3 }} />
              <Button
                variant="outlined"
                startIcon={<VisibilityIcon />}
                onClick={() => setShowPreview(!showPreview)}
                fullWidth
                sx={{ mb: showPreview ? 2 : 0 }}
              >
                {showPreview ? 'مخفی کردن پیش‌نمایش' : 'پیش‌نمایش آزمون'}
              </Button>
              {showPreview && (
                <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                    پیش‌نمایش آزمون
                  </Typography>
                  <Stack spacing={2.5}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        عنوان
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {formData.title}
                      </Typography>
                    </Box>
                    {formData.description && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          توضیحات
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {formData.description}
                        </Typography>
                      </Box>
                    )}
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                    {formData.subject && (
                        <Chip 
                          label={`موضوع: ${formData.subject}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {formData.type && (
                        <Chip 
                          label={`نوع: ${formData.type === 'online' ? 'آنلاین' : 'آفلاین'}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {formData.duration_minutes && (
                        <Chip 
                          label={`مدت زمان: ${formData.duration_minutes} دقیقه`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {formData.passing_score && (
                        <Chip 
                          label={`نمره قبولی: ${formData.passing_score}%`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {formData.exam_date && (
                        <Chip 
                          label={`تاریخ: ${formData.exam_date}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                      {formData.start_time && formData.end_time && (
                        <Chip 
                          label={`زمان: ${formData.start_time} - ${formData.end_time}`} 
                          size="small" 
                          variant="outlined"
                        />
                      )}
                    </Stack>
                    {formData.instructions && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          دستورالعمل
                        </Typography>
                        <Box
                          dangerouslySetInnerHTML={{
                            __html: formData.instructions
                              .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                              .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ''),
                          }}
                        />
                      </Box>
                    )}
                    {formData.tags && formData.tags.length > 0 && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          تگ‌ها
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 1 }}>
                          {formData.tags.map((tag, index) => (
                            <Chip key={index} label={tag} size="small" />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </Paper>
              )}
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Action Buttons */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
            {!existingExam && (
              <>
                <Button
                  variant="outlined"
                  onClick={handleSubmit((data) => onSubmit(data, false))}
                  disabled={isSubmitting}
                  size="large"
                >
                  {isSubmitting ? 'در حال ایجاد...' : 'ایجاد آزمون'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit((data) => onSubmit(data, true))}
                  disabled={isSubmitting}
                  size="large"
                >
                  {isSubmitting ? 'در حال ایجاد...' : 'ایجاد و افزودن سوال'}
                </Button>
              </>
            )}
            {existingExam && (
              <Button
                variant="contained"
                onClick={handleSubmit((data) => onSubmit(data, false))}
                disabled={isSubmitting}
                size="large"
              >
                {isSubmitting ? 'در حال ذخیره...' : 'به‌روزرسانی آزمون'}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

