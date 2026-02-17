"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
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
import SaveIcon from '@mui/icons-material/Save';

interface ExamFormWizardProps {
  form: UseFormReturn<ExamFormData>;
  onSubmit: (data: ExamFormData, redirectToQuestions: boolean) => void;
  isSubmitting: boolean;
  existingExam?: boolean;
}

const AUTO_SAVE_KEY = 'exam_form_autosave';

export function ExamFormWizard({ form, onSubmit, isSubmitting, existingExam }: ExamFormWizardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { handleSubmit, watch, setValue } = form;
  const hasLoadedRef = useRef(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Watch specific fields instead of all form data to avoid infinite loops
  const title = watch('title');
  const description = watch('description');
  const subject = watch('subject');
  const type = watch('type');
  const duration_minutes = watch('duration_minutes');
  const passing_score = watch('passing_score');
  const max_attempts = watch('max_attempts');
  const instructions = watch('instructions');
  const tags = watch('tags');
  const exam_date = watch('exam_date');
  const start_time = watch('start_time');
  const end_time = watch('end_time');

  // Memoize form data for preview
  const formData = useMemo(() => ({
    title,
    description,
    subject,
    type,
    duration_minutes,
    passing_score,
    max_attempts,
    instructions,
    tags,
    exam_date,
    start_time,
    end_time,
  }), [title, description, subject, type, duration_minutes, passing_score, max_attempts, instructions, tags, exam_date, start_time, end_time]);

  // Load auto-saved data on mount (only once)
  useEffect(() => {
    if (!existingExam && typeof window !== 'undefined' && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (saved) {
        try {
          const savedData = JSON.parse(saved);
          // Only load if saved within last 24 hours
          if (savedData.savedAt) {
          const savedAt = new Date(savedData.savedAt);
          const hoursSinceSave = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60);
          if (hoursSinceSave < 24) {
            Object.keys(savedData).forEach((key) => {
              if (key !== 'savedAt' && savedData[key] !== undefined) {
                  setValue(key as keyof ExamFormData, savedData[key], { shouldDirty: false });
              }
            });
            setLastSaved(savedAt);
            } else {
              // Clear old saved data
              localStorage.removeItem(AUTO_SAVE_KEY);
            }
          }
        } catch (e) {
          // Invalid saved data, clear it
          localStorage.removeItem(AUTO_SAVE_KEY);
        }
      }
    }
  }, [existingExam, setValue]);

  // Auto-save to localStorage with debounce
  useEffect(() => {
    if (existingExam || !title) return;

    // Clear previous timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    // Debounce auto-save by 1 second
    autoSaveTimeoutRef.current = setTimeout(() => {
      const saveData = {
        title,
        description,
        subject,
        type,
        duration_minutes,
        passing_score,
        max_attempts,
        instructions,
        tags,
        exam_date,
        start_time,
        end_time,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(saveData));
      setLastSaved(new Date());
    }, 1000);

    // Cleanup
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [title, description, subject, type, duration_minutes, passing_score, max_attempts, instructions, tags, exam_date, start_time, end_time, existingExam]);

  const handleFormSubmit = (data: ExamFormData, redirectToQuestions: boolean) => {
    // Clear auto-save on successful submit
    if (!existingExam) {
      localStorage.removeItem(AUTO_SAVE_KEY);
    }
    onSubmit(data, redirectToQuestions);
  };

  // Format last saved time
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffMins < 1) {
      return 'همین الان';
    } else if (diffMins < 60) {
      return `${diffMins} دقیقه پیش`;
    } else if (diffHours < 24) {
      return `${diffHours} ساعت پیش`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} روز پیش`;
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={4}>
          {/* Last Saved Indicator */}
          {lastSaved && !existingExam && (
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                <SaveIcon fontSize="small" color="success" />
                <Typography variant="caption" color="text.secondary">
                  آخرین ذخیره خودکار: {formatLastSaved(lastSaved)}
                </Typography>
              </Stack>
            </Box>
          )}

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
                      {formData.max_attempts && (
                        <Chip 
                          label={`حداکثر تلاش: ${formData.max_attempts}`} 
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
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {formData.instructions}
                        </Typography>
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
                  onClick={handleSubmit((data) => handleFormSubmit(data, false))}
                  disabled={isSubmitting}
                  size="large"
                >
                  {isSubmitting ? 'در حال ایجاد...' : 'ایجاد آزمون'}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleSubmit((data) => handleFormSubmit(data, true))}
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
                onClick={handleSubmit((data) => handleFormSubmit(data, false))}
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

