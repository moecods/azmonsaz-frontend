"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, QuestionFormData } from '@/lib/validation';
import { useQuestionCategories } from '@/hooks';
import { ExamQuestion, QuestionType, Difficulty } from '@/types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface CreateCustomQuestionProps {
  onAddQuestion: (question: ExamQuestion) => void;
}

export default function CreateCustomQuestion({ onAddQuestion }: CreateCustomQuestionProps) {
  const [open, setOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: '',
      type: 'multiple_choice',
      options: [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ],
      correct_answer: 0,
      category_id: 0,
      tags: [],
      difficulty: 'medium',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const questionType = watch('type');
  const { data: categoriesData } = useQuestionCategories();
  const categories = categoriesData || [];

  const handleCreateCustom = (data: QuestionFormData) => {
    const examQuestion: ExamQuestion = {
      id: Date.now(), // Temporary ID
      exam_id: 0, // Will be set when exam is created
      custom_text: data.text,
      custom_options: data.options,
      custom_correct_answer: data.correct_answer,
      order: 0, // Will be set by parent component
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    onAddQuestion(examQuestion);
    setOpen(false);
    reset();
  };

  const handleAddOption = () => {
    append({ text: '', is_correct: false });
  };

  const handleRemoveOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => setOpen(true)}
        fullWidth
      >
        ایجاد سوال سفارشی
      </Button>

      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          elevation: 8,
        }}
      >
        <DialogTitle>ایجاد سوال سفارشی</DialogTitle>
        <DialogContent>
          <form onSubmit={handleSubmit(handleCreateCustom)}>
            <Stack spacing={3} sx={{ mt: 2 }}>
              <Controller
                name="text"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="متن سوال"
                    fullWidth
                    required
                    multiline
                    rows={3}
                    error={!!errors.text}
                    helperText={errors.text?.message}
                    placeholder="متن سوال را اینجا وارد کنید..."
                  />
                )}
              />

              <Stack direction="row" spacing={2}>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>نوع سوال</InputLabel>
                      <Select {...field} label="نوع سوال">
                        <MenuItem value="multiple_choice">چند گزینه‌ای</MenuItem>
                        <MenuItem value="true_false">صحیح/غلط</MenuItem>
                        <MenuItem value="multiple_select">چند گزینه‌ای (چند پاسخ)</MenuItem>
                        <MenuItem value="essay">تشریحی</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />

                <Controller
                  name="difficulty"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel>سطح دشواری</InputLabel>
                      <Select {...field} label="سطح دشواری">
                        <MenuItem value="easy">آسان</MenuItem>
                        <MenuItem value="medium">متوسط</MenuItem>
                        <MenuItem value="hard">سخت</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>

              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>دسته‌بندی</InputLabel>
                    <Select {...field} label="دسته‌بندی" error={!!errors.category_id}>
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          {category.name}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                        {errors.category_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />

              {/* Options for multiple choice and true/false */}
              {(questionType === 'multiple_choice' || questionType === 'true_false' || questionType === 'multiple_select') && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">گزینه‌ها</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={handleAddOption}
                    >
                      افزودن گزینه
                    </Button>
                  </Stack>
                  <Stack spacing={2}>
                    {fields.map((field, index) => (
                      <Stack key={field.id} direction="row" spacing={2} alignItems="center">
                        <Controller
                          name={`options.${index}.text`}
                          control={control}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              label={`گزینه ${String.fromCharCode(65 + index)}`}
                              fullWidth
                              error={!!errors.options?.[index]?.text}
                              helperText={errors.options?.[index]?.text?.message}
                            />
                          )}
                        />
                        <Controller
                          name={`options.${index}.is_correct`}
                          control={control}
                          render={({ field }) => (
                            <Button
                              variant={field.value ? 'contained' : 'outlined'}
                              color={field.value ? 'success' : 'default'}
                              onClick={() => field.onChange(!field.value)}
                              sx={{ minWidth: 100 }}
                              startIcon={field.value ? <CheckCircleIcon /> : null}
                            >
                              {field.value ? 'صحیح' : 'غلط'}
                            </Button>
                          )}
                        />
                        {fields.length > 2 && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveOption(index)}
                          >
                            <DeleteIcon />
                          </Button>
                        )}
                      </Stack>
                    ))}
                  </Stack>
                  {errors.options && (
                    <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                      {errors.options.message}
                    </Typography>
                  )}
                </Box>
              )}

              {questionType === 'essay' && (
                <Alert severity="info">
                  سوالات تشریحی نیازی به گزینه ندارند و به صورت دستی تصحیح می‌شوند.
                </Alert>
              )}
            </Stack>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>انصراف</Button>
          <Button onClick={handleSubmit(handleCreateCustom)} variant="contained">
            ایجاد سوال
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

