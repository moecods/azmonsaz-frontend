"use client";

import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import { Controller } from 'react-hook-form';
import LiveHelpOutlinedIcon from '@mui/icons-material/LiveHelpOutlined';
import TuneIcon from '@mui/icons-material/Tune';
import EditNoteIcon from '@mui/icons-material/EditNote';
import RuleFolderIcon from '@mui/icons-material/RuleFolder';

import { useQuestionCategories, useQuestion } from '@/hooks';
import { getDescriptor } from '@/lib/question-types';
import type { QuestionFormData } from '@/lib/validation';
import Breadcrumb from '@/components/Breadcrumb';
import { useQuestionForm } from '@/hooks/useQuestionForm';
import { useQuestionSubmit } from '@/hooks/useQuestionSubmit';
import { TypeFormRenderer } from './create-question/type-forms';
import DisplaySettingsPanel from './create-question/DisplaySettingsPanel';
import { QuestionTypeSelector } from './create-question/QuestionTypeSelector';
import { getQuestionTypeDefaults } from '@/lib/question-types/type-defaults';
import type { QuestionTypeId } from '@/lib/question-types/constants';
import { QuestionPreview, type PreviewAnswer } from './create-question/QuestionPreview';
import { BLANK_PLACEHOLDER } from './create-question/QuestionTextInput';

const QuestionTextInput = dynamic(
  () => import('./create-question/QuestionTextInput').then((m) => m.QuestionTextInput),
  { ssr: false, loading: () => null }
);
import { QUESTION_TYPE_LABELS, DIFFICULTY_CONFIG } from '@/constants/question';
import { flattenFormErrors, focusFirstFormError } from '@/lib/form-errors';
import { generateOptionId } from '@/lib/option-ids';
import { FormValidationAlerts } from '@/components/forms/FormValidationAlerts';

interface CreateQuestionContentProps {
  examId?: number;
  returnUrl?: string;
  questionId?: number;
  /** When editing an exam question (not bank), pass the exam_question id and its payload */
  examQuestionId?: number;
  examQuestionPayload?: Record<string, unknown>;
}

export default function CreateQuestionContent({
  examId,
  returnUrl,
  questionId,
  examQuestionId,
  examQuestionPayload,
}: CreateQuestionContentProps) {
  const router = useRouter();
  const [validationAlert, setValidationAlert] = useState<string[] | null>(null);
  const [previewAnswer, setPreviewAnswer] = useState<PreviewAnswer>(null);

  const isExamQuestionEdit = examQuestionId != null && examQuestionPayload != null;
  const { data: categoriesData } = useQuestionCategories();
  const categories = categoriesData || [];
  const { data: questionData } = useQuestion(isExamQuestionEdit ? null : questionId ?? null);
  const isEditMode = !!questionId || isExamQuestionEdit;

  const {
    form,
    optionsFields,
    itemsFields,
    leftItemsFields,
    rightItemsFields,
    matchesFields,
    blanksFields,
  } = useQuestionForm({
    questionId: isExamQuestionEdit ? undefined : questionId,
    questionData: isExamQuestionEdit ? undefined : (questionData ?? undefined),
    examQuestionPayload: isExamQuestionEdit ? examQuestionPayload : undefined,
    categories,
    isEditMode,
  });

  const { control, handleSubmit, formState: { errors }, watch, setValue, setFocus, reset } = form;

  const {
    submit,
    createQuestionMutation,
    updateQuestionMutation,
    addQuestionToExamMutation,
    updateExamQuestionMutation,
  } = useQuestionSubmit({
    examId,
    returnUrl,
    questionId,
    examQuestionId,
    examQuestionPayload,
    isEditMode,
    categories,
  });

  const questionType = watch('type');
  const questionText = watch('text');
  const difficulty = watch('difficulty');
  const categoryId = watch('category_id');
  const formValues = watch();
  const questionOptions = watch('options');
  const items = watch('items');
  const correct_order = watch('correct_order');
  const left_items = watch('left_items');
  const right_items = watch('right_items');
  const matches = watch('matches');
  const blanks = watch('blanks');
  const displaySettings = watch('display_settings') ?? {};

  const previewPayload = useMemo(
    () =>
      formValues?.text
        ? (getDescriptor(questionType).buildExamPayload(
            { ...formValues, display_settings: displaySettings } as QuestionFormData,
            categories,
          ) as unknown as import('@/components/questions/QuestionAnswerInput').QuestionPayload)
        : null,
    [formValues, questionType, categories, displaySettings],
  );

  const handleQuestionTypeChange = (nextType: QuestionTypeId) => {
    const defaults = getQuestionTypeDefaults(nextType);
    const current = form.getValues();
    reset({
      ...current,
      type: nextType,
      ...defaults,
      text: current.text || defaults.text || '',
      category_id: current.category_id,
      difficulty: current.difficulty,
      tags: current.tags,
    });
    setPreviewAnswer(null);
  };

  const categoryName = useMemo(
    () => categories.find((c) => c.id === categoryId)?.name ?? null,
    [categories, categoryId],
  );

  useEffect(() => setPreviewAnswer(null), [questionType]);

  // Auto-create blank fields based on placeholders in the rich text.
  useEffect(() => {
    if (questionType !== 'fill_in_the_blank' || !questionText) return;
    const text = questionText.replace(/<[^>]+>/g, '');
    const count = Math.max(0, text.split(BLANK_PLACEHOLDER).length - 1);
    const currentBlanks = blanks ?? [];
    if (count > currentBlanks.length) {
      for (let i = currentBlanks.length; i < count; i++) {
        blanksFields.append({ position: i, correct_answer: '' });
      }
    }
  }, [questionType, questionText, blanks?.length, blanksFields]);

  const handleAddOption = () =>
    optionsFields.append({ id: generateOptionId(), text: '', is_correct: false });
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

  const isSubmitting = useMemo(
    () =>
      createQuestionMutation.isPending ||
      updateQuestionMutation.isPending ||
      addQuestionToExamMutation.isPending ||
      (updateExamQuestionMutation?.isPending ?? false),
    [
      createQuestionMutation.isPending,
      updateQuestionMutation.isPending,
      addQuestionToExamMutation.isPending,
      updateExamQuestionMutation?.isPending,
    ],
  );

  const mutationError =
    createQuestionMutation.error ||
    updateQuestionMutation.error ||
    addQuestionToExamMutation.error ||
    updateExamQuestionMutation?.error;

  const isLoadingExisting = isEditMode && !isExamQuestionEdit && !questionData;

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Stack spacing={3}>
          <Breadcrumb
            items={
              isExamQuestionEdit && examId
                ? [
                    { label: 'مدیریت آزمون‌ها', href: '/exams' },
                    { label: 'سوالات آزمون', href: `/exams/${examId}/questions` },
                    { label: 'ویرایش سوال' },
                  ]
                : [
                    { label: 'بانک سوالات', href: '/questions' },
                    { label: isEditMode ? 'ویرایش سوال' : 'ایجاد سوال جدید' },
                  ]
            }
          />

          <Stack spacing={0.5}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {isExamQuestionEdit
                ? 'ویرایش سوال آزمون'
                : isEditMode
                ? 'ویرایش سوال'
                : 'ایجاد سوال جدید'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {examId && !isExamQuestionEdit
                ? 'این سوال پس از ایجاد به آزمون اضافه خواهد شد.'
                : 'سوال خود را با متن غنی، فرمول ریاضی، تصویر و جدول طراحی کنید.'}
            </Typography>
          </Stack>

          {isLoadingExisting && (
            <Alert severity="info" icon={<CircularProgress size={18} />}>
              در حال بارگذاری اطلاعات سوال...
            </Alert>
          )}

          <FormValidationAlerts
            messages={validationAlert}
            onClose={() => setValidationAlert(null)}
            variant="top"
          />

          {mutationError instanceof Error && (
            <Alert severity="error">{mutationError.message}</Alert>
          )}

          <form
            onSubmit={handleSubmit(
              (data) => {
                setValidationAlert(null);
                submit(data);
              },
              (errs) => {
                const messages = flattenFormErrors(errs as Record<string, unknown>);
                setValidationAlert(messages);
                focusFirstFormError(errs, setFocus);
              },
            )}
          >
            <Stack spacing={3}>
                  {/* Section: Basic info */}
                  <SectionCard
                    id="section-basic"
                    icon={<TuneIcon color="primary" />}
                    title="اطلاعات پایه"
                    subtitle="نوع سوال، سطح دشواری و دسته‌بندی"
                  >
                    <Stack spacing={2.5}>
                      <QuestionTypeSelector
                        value={questionType}
                        onChange={handleQuestionTypeChange}
                      />
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <Controller
                            name="difficulty"
                            control={control}
                            render={({ field }) => (
                              <FormControl fullWidth>
                                <InputLabel>سطح دشواری</InputLabel>
                                <Select {...field} label="سطح دشواری">
                                  {Object.entries(DIFFICULTY_CONFIG).map(([value, { label }]) => (
                                    <MenuItem key={value} value={value}>
                                      {label}
                                    </MenuItem>
                                  ))}
                                </Select>
                              </FormControl>
                            )}
                          />
                        </Grid>
                      </Grid>

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
                                {categories.length === 0
                                  ? 'در حال بارگذاری...'
                                  : 'دسته‌بندی را انتخاب کنید'}
                              </MenuItem>
                              {categories.map((category) => (
                                <MenuItem key={category.id} value={category.id}>
                                  {category.name}
                                </MenuItem>
                              ))}
                            </Select>
                            {errors.category_id && (
                              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                                {errors.category_id.message}
                              </Typography>
                            )}
                          </FormControl>
                        )}
                      />
                    </Stack>
                  </SectionCard>

                  {/* Section: Question content */}
                  <SectionCard
                    id="section-text"
                    icon={<EditNoteIcon color="primary" />}
                    title="متن سوال"
                    subtitle="می‌توانید از فرمول ریاضی، تصویر، جدول و قالب‌بندی متن استفاده کنید"
                  >
                    <QuestionTextInput
                      control={control}
                      errors={errors}
                      questionType={questionType}
                    />
                  </SectionCard>

                  {/* Section: Type-specific answer config */}
                  <SectionCard
                    id="section-answers"
                    icon={<RuleFolderIcon color="primary" />}
                    title="پاسخ‌ها"
                    subtitle="پاسخ صحیح و گزینه‌های مرتبط با نوع سوال را مشخص کنید"
                  >
                    <TypeFormRenderer
                      {...typeFormProps}
                      questionType={questionType}
                      onAddOption={handleAddOption}
                      onRemoveOption={handleRemoveOption}
                    />
                  </SectionCard>

                  <SectionCard
                    id="section-display"
                    icon={<TuneIcon color="primary" />}
                    title="نمایش سوال"
                    subtitle="چیدمان گزینه‌ها، برچسب‌ها و حالت تطبیق"
                  >
                    <DisplaySettingsPanel
                      questionType={questionType}
                      value={displaySettings}
                      onChange={(s) => setValue('display_settings', s, { shouldDirty: true })}
                    />
                  </SectionCard>

                  <Divider />

                  <Box sx={{ width: '100%' }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <LiveHelpOutlinedIcon fontSize="small" color="action" />
                      <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1 }}>
                        پیش‌نمایش زنده
                      </Typography>
                    </Stack>
                    <QuestionPreview
                      questionText={questionText}
                      questionType={questionType}
                      formValues={formValues as QuestionFormData}
                      previewPayload={previewPayload}
                      previewAnswer={previewAnswer}
                      onPreviewAnswerChange={setPreviewAnswer}
                      categoryName={categoryName}
                      displaySettings={displaySettings}
                    />
                  </Box>

                  <Divider />

                  <FormValidationAlerts
                    messages={validationAlert}
                    onClose={() => setValidationAlert(null)}
                    variant="sticky"
                  />

                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1.5}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      onClick={() => router.back()}
                      disabled={isSubmitting}
                      fullWidth={false}
                    >
                      انصراف
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || isLoadingExisting}
                      size="large"
                      startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                      {isSubmitting
                        ? isEditMode
                          ? 'در حال ذخیره...'
                          : 'در حال ایجاد...'
                        : isEditMode
                        ? 'به‌روزرسانی سوال'
                        : 'تکمیل و ایجاد سوال'}
                    </Button>
                  </Stack>
            </Stack>
          </form>
        </Stack>
    </Container>
  );
}

function SectionCard({
  id,
  icon,
  title,
  subtitle,
  children,
}: {
  id?: string;
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="outlined" id={id}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            {icon && (
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: 'action.hover',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {icon}
              </Box>
            )}
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Stack>
          <Box>{children}</Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
