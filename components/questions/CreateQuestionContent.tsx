"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  Typography,
  Alert,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useQuestionCategories, useQuestion } from '@/hooks';
import { getDescriptor } from '@/lib/question-types';
import type { QuestionFormData } from '@/lib/validation';
import Breadcrumb from '@/components/Breadcrumb';
import UserLayout from '@/components/layout/UserLayout';
import { useQuestionForm } from '@/hooks/useQuestionForm';
import { useQuestionSubmit } from '@/hooks/useQuestionSubmit';
import { TypeFormRenderer } from './create-question/type-forms';
import { QuestionPreview } from './create-question/QuestionPreview';
import { QuestionTextInput, BLANK_PLACEHOLDER } from './create-question/QuestionTextInput';
import { Controller } from 'react-hook-form';

interface CreateQuestionContentProps {
  examId?: number;
  returnUrl?: string;
  questionId?: number;
}

function flattenErrors(errors: Record<string, unknown>, prefix = ''): string[] {
  const messages: string[] = [];
  for (const [key, value] of Object.entries(errors)) {
    if (value && typeof value === 'object' && 'message' in value && typeof (value as { message: unknown }).message === 'string') {
      messages.push((value as { message: string }).message);
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      messages.push(...flattenErrors(value as Record<string, unknown>, key));
    }
  }
  return messages;
}

export default function CreateQuestionContent({ examId, returnUrl, questionId }: CreateQuestionContentProps) {
  const router = useRouter();
  const [validationAlert, setValidationAlert] = useState<string[] | null>(null);
  const [previewAnswer, setPreviewAnswer] = useState<
    number | number[] | string | string[] | { left_index: number; right_index: number }[] | null
  >(null);

  const { data: categoriesData } = useQuestionCategories();
  const categories = categoriesData || [];
  const { data: questionData } = useQuestion(questionId ?? null);
  const isEditMode = !!questionId;

  const {
    form,
    optionsFields,
    itemsFields,
    leftItemsFields,
    rightItemsFields,
    matchesFields,
    blanksFields,
  } = useQuestionForm({
    questionId,
    questionData: questionData ?? undefined,
    categories,
    isEditMode,
  });

  const { control, handleSubmit, formState: { errors }, watch, setValue } = form;

  const { submit, createQuestionMutation, updateQuestionMutation, addQuestionToExamMutation } = useQuestionSubmit({
    examId,
    returnUrl,
    questionId,
    isEditMode,
    categories,
  });

  const questionType = watch('type');
  const questionText = watch('text');
  const formValues = watch();
  const questionOptions = watch('options');
  const items = watch('items');
  const correct_order = watch('correct_order');
  const left_items = watch('left_items');
  const right_items = watch('right_items');
  const matches = watch('matches');
  const blanks = watch('blanks');

  const previewPayload = formValues?.text
    ? (getDescriptor(formValues.type).buildExamPayload(formValues as QuestionFormData, categories) as unknown as import('@/components/questions/QuestionAnswerInput').QuestionPayload)
    : null;

  useEffect(() => setPreviewAnswer(null), [questionType]);

  useEffect(() => {
    if (questionType !== 'fill_in_the_blank' || !questionText) return;
    const count = Math.max(0, questionText.split(BLANK_PLACEHOLDER).length - 1);
    const currentBlanks = blanks ?? [];
    if (count > currentBlanks.length) {
      for (let i = currentBlanks.length; i < count; i++) {
        blanksFields.append({ position: i, correct_answer: '' });
      }
    }
  }, [questionType, questionText, blanks?.length, blanksFields]);

  const handleAddOption = () => optionsFields.append({ text: '', is_correct: false });
  const handleRemoveOption = (index: number) => {
    if (optionsFields.fields.length > 2) optionsFields.remove(index);
  };

  const typeFormProps = {
    control,
    errors,
    setValue,
    optionsFields,
    itemsFields,
    leftItemsFields,
    rightItemsFields,
    matchesFields,
    blanksFields,
    questionOptions,
    items,
    correct_order,
    left_items,
    right_items,
    matches,
    blanks,
  };

  return (
    <UserLayout>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Breadcrumb items={[{ label: 'بانک سوالات', href: '/questions' }, { label: isEditMode ? 'ویرایش سوال' : 'ایجاد سوال جدید' }]} />
          <Box>
            <Typography variant="h4" gutterBottom>{isEditMode ? 'ویرایش سوال' : 'ایجاد سوال جدید'}</Typography>
            {examId && <Typography variant="body2" color="text.secondary">این سوال پس از ایجاد به آزمون اضافه خواهد شد.</Typography>}
          </Box>

          {isEditMode && !questionData && <Alert severity="info">در حال بارگذاری سوال...</Alert>}

          {validationAlert && validationAlert.length > 0 && (
            <Alert severity="warning" onClose={() => setValidationAlert(null)}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>لطفا خطاهای زیر را برطرف کنید:</Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                {validationAlert.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </Box>
            </Alert>
          )}
          {(createQuestionMutation.isError || updateQuestionMutation.isError || addQuestionToExamMutation.isError) && (
            <Alert severity="error">
              {createQuestionMutation.error instanceof Error && createQuestionMutation.error.message}
              {updateQuestionMutation.error instanceof Error && updateQuestionMutation.error.message}
              {addQuestionToExamMutation.error instanceof Error && addQuestionToExamMutation.error.message}
            </Alert>
          )}

          <form
            onSubmit={handleSubmit(
              (data) => {
                setValidationAlert(null);
                submit(data);
              },
              (errs) => setValidationAlert(flattenErrors(errs as Record<string, unknown>))
            )}
          >
            <Stack spacing={4}>
              <Card>
                <CardContent>
                  <Stack spacing={3}>
                    <QuestionTextInput control={control} errors={errors} questionType={questionType} />

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
                              <MenuItem value="short_answer">پاسخ کوتاه</MenuItem>
                              <MenuItem value="fill_in_the_blank">جای خالی</MenuItem>
                              <MenuItem value="matching">تطبیقی</MenuItem>
                              <MenuItem value="ordering">ترتیب‌دهی</MenuItem>
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
                        <FormControl fullWidth error={!!errors.category_id}>
                          <InputLabel>دسته‌بندی</InputLabel>
                          <Select
                            {...field}
                            label="دسته‌بندی"
                            displayEmpty
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                          >
                            <MenuItem value={0} disabled>
                              {categories.length === 0 ? 'در حال بارگذاری...' : 'دسته‌بندی را انتخاب کنید'}
                            </MenuItem>
                            {categories.map((category) => (
                              <MenuItem key={category.id} value={category.id}>{category.name}</MenuItem>
                            ))}
                          </Select>
                          {errors.category_id && <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>{errors.category_id.message}</Typography>}
                        </FormControl>
                      )}
                    />

                    <TypeFormRenderer
                      {...typeFormProps}
                      questionType={questionType}
                      onAddOption={handleAddOption}
                      onRemoveOption={handleRemoveOption}
                    />

                    <Divider />
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <Button
                        variant="outlined"
                        onClick={() => router.back()}
                        disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending || addQuestionToExamMutation.isPending}
                      >
                        انصراف
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending || addQuestionToExamMutation.isPending || (isEditMode && !questionData)}
                        size="large"
                      >
                        {createQuestionMutation.isPending || updateQuestionMutation.isPending || addQuestionToExamMutation.isPending
                          ? (isEditMode ? 'در حال ذخیره...' : 'در حال ایجاد...')
                          : (isEditMode ? 'به‌روزرسانی سوال' : 'تکمیل و ایجاد سوال')}
                      </Button>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <QuestionPreview
                questionText={questionText}
                questionType={questionType}
                previewPayload={previewPayload}
                previewAnswer={previewAnswer}
                onPreviewAnswerChange={setPreviewAnswer}
              />
            </Stack>
          </form>
        </Stack>
      </Container>
    </UserLayout>
  );
}
