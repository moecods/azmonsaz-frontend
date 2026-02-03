"use client";

import React from 'react';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  IconButton,
  Typography,
  Box,
  Autocomplete,
  Chip,
} from '@mui/material';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { QuestionFormData } from '@/lib/validation';
import { QuestionType } from '@/types';
import { Modal } from '@/components/ui';
import { FormCategorySelect } from '@/components/forms';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

interface QuestionFormDialogProps {
  open: boolean;
  editingQuestion: any;
  control: Control<QuestionFormData>;
  errors: FieldErrors<QuestionFormData>;
  questionType: QuestionType;
  options: Array<{ text: string; is_correct: boolean }>;
  categories: Array<{ id: number; name: string }>;
  allTags: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onAddOption: () => void;
  onRemoveOption: (index: number) => void;
  onToggleCorrect: (index: number) => void;
  onTypeChange: (type: QuestionType) => void;
}

export const QuestionFormDialog = React.memo(function QuestionFormDialog({
  open,
  editingQuestion,
  control,
  errors,
  questionType,
  options,
  allTags,
  isSubmitting,
  onClose,
  onSubmit,
  onAddOption,
  onRemoveOption,
  onToggleCorrect,
  onTypeChange,
}: QuestionFormDialogProps) {
  return (
    <form id="question-form" onSubmit={onSubmit}>
      <Modal
        open={open}
        onClose={onClose}
        title={editingQuestion ? 'ویرایش سوال' : 'ایجاد سوال جدید'}
        maxWidth="md"
        fullWidth
        actions={
          <>
            <Button onClick={onClose}>انصراف</Button>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              {isSubmitting ? 'در حال ذخیره...' : editingQuestion ? 'به‌روزرسانی' : 'ایجاد'}
            </Button>
          </>
        }
      >
        <Stack spacing={3}>
          <Controller
            name="text"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="متن سوال"
                fullWidth
                multiline
                rows={3}
                error={!!errors.text}
                helperText={errors.text?.message}
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
                  <Select
                    {...field}
                    label="نوع سوال"
                    onChange={(e) => {
                      field.onChange(e);
                      onTypeChange(e.target.value as QuestionType);
                    }}
                  >
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

          <FormCategorySelect
            name="category_id"
            control={control}
            label="دسته‌بندی"
            error={!!errors.category_id}
            helperText={errors.category_id?.message}
            required
          />

          {/* Essay type info */}
          {questionType === 'essay' && (
            <Alert severity="info">
              سوالات تشریحی نیازی به گزینه یا پاسخ صحیح ندارند. پاسخ‌ها به صورت دستی بررسی می‌شوند.
            </Alert>
          )}

          {/* Options Management */}
          {(questionType === 'multiple_choice' ||
            questionType === 'true_false' ||
            questionType === 'multiple_select') && (
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1">گزینه‌ها</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={onAddOption}
                  disabled={questionType === 'true_false'}
                >
                  افزودن گزینه
                </Button>
              </Stack>
              <Controller
                name="options"
                control={control}
                render={({ field }) => (
                  <Stack spacing={2}>
                    {(field.value || []).map((option, index) => (
                      <Stack key={index} direction="row" spacing={1} alignItems="center">
                        <TextField
                          fullWidth
                          value={option.text}
                          onChange={(e) => {
                            const currentOptions = field.value || [];
                            const newOptions = [...currentOptions];
                            newOptions[index] = { ...newOptions[index], text: e.target.value };
                            field.onChange(newOptions);
                          }}
                          label={`گزینه ${index + 1}`}
                          error={!!errors.options?.[index]}
                          helperText={errors.options?.[index]?.text?.message}
                        />
                        <IconButton
                          onClick={() => onToggleCorrect(index)}
                          color={option.is_correct ? 'success' : 'default'}
                          disabled={!option.text}
                          title={option.is_correct ? 'پاسخ صحیح' : 'علامت‌گذاری به عنوان پاسخ صحیح'}
                        >
                          {option.is_correct ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                        </IconButton>
                        <IconButton
                          onClick={() => onRemoveOption(index)}
                          color="error"
                          disabled={(field.value?.length || 0) <= 2 || questionType === 'true_false'}
                        >
                          <RemoveIcon />
                        </IconButton>
                      </Stack>
                    ))}
                  </Stack>
                )}
              />
              {errors.options && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.options.message}
                </Typography>
              )}
            </Box>
          )}

          {/* Tags Input */}
          <Controller
            name="tags"
            control={control}
            render={({ field }) => (
              <Autocomplete
                multiple
                freeSolo
                options={allTags}
                value={field.value || []}
                onChange={(_, newValue) => {
                  const filteredValue = newValue
                    .map((v) => (typeof v === 'string' ? v.trim() : v))
                    .filter((v, index, self) => v && self.indexOf(v) === index);
                  field.onChange(filteredValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="برچسب‌ها"
                    placeholder="برچسب اضافه کنید یا از پیشنهادها انتخاب کنید"
                    helperText="می‌توانید برچسب جدید اضافه کنید (Enter) یا از برچسب‌های موجود انتخاب کنید"
                  />
                )}
                sx={{ width: '100%' }}
              />
            )}
          />

          {errors.correct_answer && (
            <Alert severity="error">{errors.correct_answer.message}</Alert>
          )}
        </Stack>
      </Modal>
    </form>
  );
});

