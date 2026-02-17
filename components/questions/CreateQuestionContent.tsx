"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
  Alert,
  Divider,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
} from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, QuestionFormData } from '@/lib/validation';
import { useQuestionCategories, useCreateQuestion, useAddQuestionToExam } from '@/hooks';
import { getQuestionTypeLabel, getDescriptor } from '@/lib/question-types';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Breadcrumb from '@/components/Breadcrumb';
import UserLayout from '@/components/layout/UserLayout';
import { handleError } from '@/lib/error-handler';

interface CreateQuestionContentProps {
  examId?: number;
  returnUrl?: string;
}

export default function CreateQuestionContent({ examId, returnUrl }: CreateQuestionContentProps) {
  const router = useRouter();
  const [showPreview, setShowPreview] = useState(true);

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
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
      items: [],
      correct_order: [],
      left_items: [],
      right_items: [],
      matches: [],
      blanks: [],
    },
  });

  const optionsFields = useFieldArray({ control, name: 'options' });
  const itemsFields = useFieldArray({ control, name: 'items' });
  const leftItemsFields = useFieldArray({ control, name: 'left_items' });
  const rightItemsFields = useFieldArray({ control, name: 'right_items' });
  const matchesFields = useFieldArray({ control, name: 'matches' });
  const blanksFields = useFieldArray({ control, name: 'blanks' });

  const questionType = watch('type');
  const questionText = watch('text');
  const questionOptions = watch('options');
  const items = watch('items');
  const correct_order = watch('correct_order');
  const left_items = watch('left_items');
  const right_items = watch('right_items');
  const matches = watch('matches');
  const blanks = watch('blanks');
  const difficulty = watch('difficulty');
  const tags = watch('tags');
  const correctAnswer = watch('correct_answer');

  const { data: categoriesData } = useQuestionCategories();
  const categories = categoriesData || [];
  const createQuestionMutation = useCreateQuestion();
  const addQuestionToExamMutation = useAddQuestionToExam();
  const hasSetDefaultCategory = useRef(false);

  // Set default category when categories load (category_id must be positive for validation)
  useEffect(() => {
    if (categories.length > 0 && !hasSetDefaultCategory.current) {
      hasSetDefaultCategory.current = true;
      setValue('category_id', categories[0].id);
    }
  }, [categories, setValue]);

  // When type changes to true_false, set exactly two fixed options (no add/remove)
  useEffect(() => {
    if (questionType === 'true_false') {
      const opts = questionOptions ?? [];
      const firstCorrect = opts[0]?.is_correct ?? false;
      const secondCorrect = opts[1]?.is_correct ?? false;
      setValue('options', [
        { text: 'صحیح', is_correct: firstCorrect && !secondCorrect },
        { text: 'غلط', is_correct: secondCorrect && !firstCorrect },
      ]);
    }
  }, [questionType, setValue]);

  // When type changes to essay, clear correct_answer (validation requires null)
  useEffect(() => {
    if (questionType === 'essay') {
      setValue('correct_answer', null);
    }
  }, [questionType, setValue]);

  // When type changes to short_answer, set correct_answer to empty string so validation expects string
  useEffect(() => {
    if (questionType === 'short_answer' && typeof correctAnswer !== 'string') {
      setValue('correct_answer', '');
    }
  }, [questionType, setValue, correctAnswer]);

  // Sync matches length with left_items when matching type; each match has left_index and right_index
  useEffect(() => {
    if (questionType === 'matching') {
      const leftLen = left_items?.length ?? 0;
      const currentMatches = (matches ?? []) as { left_index: number; right_index: number }[];
      if (currentMatches.length < leftLen) {
        const newMatches = currentMatches.slice();
        for (let i = currentMatches.length; i < leftLen; i++) {
          newMatches.push({ left_index: i, right_index: 0 });
        }
        setValue('matches', newMatches);
      } else if (currentMatches.length > leftLen) {
        setValue('matches', currentMatches.slice(0, leftLen));
      } else {
        // ensure left_index is set
        const fixed = currentMatches.map((m, i) => ({ ...m, left_index: i }));
        if (JSON.stringify(fixed) !== JSON.stringify(currentMatches)) {
          setValue('matches', fixed);
        }
      }
    }
  }, [questionType, left_items?.length, matches?.length, setValue]);

  const handleAddOption = () => {
    optionsFields.append({ text: '', is_correct: false });
  };

  const handleRemoveOption = (index: number) => {
    if (optionsFields.fields.length > 2) optionsFields.remove(index);
  };

  const onSubmit = async (data: QuestionFormData) => {
    try {
      const descriptor = getDescriptor(data.type);
      if (examId) {
        const payload = descriptor.buildExamPayload(data, categories);
        await addQuestionToExamMutation.mutateAsync({ examId, data: { payload } });
        router.push(`/exams/${examId}?tab=questions`);
        return;
      }

      const questionData = descriptor.buildBankPayload
        ? descriptor.buildBankPayload(data)
        : descriptor.buildExamPayload(data, categories);
      await createQuestionMutation.mutateAsync(questionData as Parameters<typeof createQuestionMutation.mutateAsync>[0]);
      if (returnUrl) router.push(returnUrl);
      else router.push('/questions');
    } catch (error) {
      handleError(error, { context: 'Create Question' });
    }
  };

  // ---- Type-specific preview ----
  const QuestionPreview = useMemo(() => {
    if (!questionText) return null;

    const header = (
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
          <Chip label={getQuestionTypeLabel(questionType)} size="small" color="primary" />
          {difficulty && (
            <Chip
              label={`سطح: ${difficulty === 'easy' ? 'آسان' : difficulty === 'medium' ? 'متوسط' : 'سخت'}`}
              size="small"
              variant="outlined"
            />
          )}
        </Stack>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {questionText}
        </Typography>
      </Box>
    );

    if (questionType === 'multiple_choice' || questionType === 'true_false' || questionType === 'multiple_select') {
      const opts = questionOptions ?? [];
      return (
        <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {header}
            {opts.length > 0 && (
              <Stack spacing={1.5}>
                {opts.map((option, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: option.is_correct ? 'success.light' : 'background.paper',
                      border: '1px solid',
                      borderColor: option.is_correct ? 'success.main' : 'divider',
                    }}
                  >
                    <Chip
                      label={String.fromCharCode(65 + index)}
                      size="small"
                      color={option.is_correct ? 'success' : 'default'}
                      sx={{ minWidth: 32 }}
                    />
                    <Typography variant="body1" sx={{ flex: 1 }}>
                      {option.text || 'گزینه...'}
                    </Typography>
                    {option.is_correct && <CheckCircleIcon color="success" fontSize="small" />}
                  </Box>
                ))}
              </Stack>
            )}
          </Stack>
        </Paper>
      );
    }

    if (questionType === 'short_answer') {
      return (
        <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {header}
            <Alert severity="info">
              {correctAnswer ? <>پاسخ صحیح: <strong>{String(correctAnswer)}</strong></> : 'پاسخ صحیح را وارد کنید'}
            </Alert>
          </Stack>
        </Paper>
      );
    }

    if (questionType === 'essay') {
      return (
        <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {header}
            <Alert severity="info">این سوال به صورت دستی تصحیح می‌شود.</Alert>
          </Stack>
        </Paper>
      );
    }

    if (questionType === 'ordering') {
      const order = correct_order ?? [];
      const itemsList = items ?? [];
      const orderedItems = order.length === itemsList.length
        ? order.map(i => itemsList[i]?.text).filter(Boolean)
        : itemsList.map(i => i.text);
      return (
        <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {header}
            <Typography variant="subtitle2" color="text.secondary">ترتیب صحیح:</Typography>
            <Stack spacing={1}>
              {orderedItems.map((text, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Chip label={idx + 1} size="small" color="primary" />
                  <Typography variant="body1">{text || '...'}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Paper>
      );
    }

    if (questionType === 'matching') {
      const left = left_items ?? [];
      const right = right_items ?? [];
      const matchList = matches ?? [];
      return (
        <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {header}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>ستون چپ</Typography>
                <Stack spacing={0.5}>
                  {left.map((item, i) => (
                    <Box key={i} sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      {i + 1}. {item.text || '...'}
                    </Box>
                  ))}
                </Stack>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>ستون راست</Typography>
                <Stack spacing={0.5}>
                  {right.map((item, i) => (
                    <Box key={i} sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                      {String.fromCharCode(65 + i)}. {item.text || '...'}
                    </Box>
                  ))}
                </Stack>
              </Grid>
            </Grid>
            {matchList.length > 0 && (
              <Typography variant="caption" color="text.secondary">
                تطبیق: {matchList.map((m: { left_index: number; right_index: number }) =>
                  `(${m.left_index + 1} → ${String.fromCharCode(65 + m.right_index)})`
                ).join(', ')}
              </Typography>
            )}
          </Stack>
        </Paper>
      );
    }

    if (questionType === 'fill_in_the_blank') {
      const blanksList = blanks ?? [];
      return (
        <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2}>
            {header}
            <Typography variant="subtitle2" color="text.secondary">جای خالی‌ها:</Typography>
            <Stack spacing={1}>
              {blanksList.map((b, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip label={idx + 1} size="small" />
                  <Typography variant="body2">{b.correct_answer || '...'}</Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Paper>
      );
    }

    return (
      <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>{header}</Stack>
      </Paper>
    );
  }, [questionText, questionType, questionOptions, difficulty, tags, correctAnswer, items, correct_order, left_items, right_items, matches, blanks]);

  // ---- Type-specific form content ----
  const renderTypeSpecificForm = () => {
    if (questionType === 'true_false') {
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>گزینه صحیح را انتخاب کنید</Typography>
          <Stack spacing={2}>
            {optionsFields.fields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={2} alignItems="center">
                <TextField
                  value={questionOptions?.[index]?.text ?? (index === 0 ? 'صحیح' : 'غلط')}
                  label={`گزینه ${index + 1}`}
                  fullWidth
                  disabled
                  size="small"
                />
                <Controller
                  name={`options.${index}.is_correct`}
                  control={control}
                  render={({ field: f }) => (
                    <Button
                      variant={f.value ? 'contained' : 'outlined'}
                      color={f.value ? 'success' : 'default'}
                      onClick={() => {
                        setValue('options.0.is_correct', index === 0);
                        setValue('options.1.is_correct', index === 1);
                      }}
                      sx={{ minWidth: 100 }}
                      startIcon={f.value ? <CheckCircleIcon /> : null}
                    >
                      {f.value ? 'صحیح' : 'غلط'}
                    </Button>
                  )}
                />
              </Stack>
            ))}
          </Stack>
        </Box>
      );
    }

    if (questionType === 'multiple_choice' || questionType === 'multiple_select') {
      return (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">گزینه‌ها</Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={handleAddOption}>
              افزودن گزینه
            </Button>
          </Stack>
          <Stack spacing={2}>
            {optionsFields.fields.map((field, index) => (
              <Stack key={field.id} direction="row" spacing={2} alignItems="center">
                <Controller
                  name={`options.${index}.text`}
                  control={control}
                  render={({ field: f }) => (
                    <TextField {...f} label={`گزینه ${String.fromCharCode(65 + index)}`} fullWidth size="small" error={!!errors.options?.[index]?.text} helperText={errors.options?.[index]?.text?.message} />
                  )}
                />
                <Controller
                  name={`options.${index}.is_correct`}
                  control={control}
                  render={({ field: f }) => (
                    <Button
                      variant={f.value ? 'contained' : 'outlined'}
                      color={f.value ? 'success' : 'default'}
                      onClick={() => f.onChange(!f.value)}
                      sx={{ minWidth: 100 }}
                      startIcon={f.value ? <CheckCircleIcon /> : null}
                    >
                      {f.value ? 'صحیح' : 'غلط'}
                    </Button>
                  )}
                />
                {optionsFields.fields.length > 2 && (
                  <IconButton size="small" color="error" onClick={() => handleRemoveOption(index)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      );
    }

    if (questionType === 'essay') {
      return <Alert severity="info">سوالات تشریحی نیازی به گزینه ندارند و به صورت دستی تصحیح می‌شوند.</Alert>;
    }

    if (questionType === 'short_answer') {
      return (
        <Box>
          <Controller
            name="correct_answer"
            control={control}
            render={({ field }) => (
              <TextField {...field} label="پاسخ صحیح" fullWidth error={!!errors.correct_answer} helperText={errors.correct_answer?.message || 'پاسخ صحیح را وارد کنید'} />
            )}
          />
        </Box>
      );
    }

    if (questionType === 'ordering') {
      return (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">موارد (ترتیب صحیح = همان ترتیب لیست)</Typography>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => {
                const len = (items ?? []).length;
                itemsFields.append({ text: '', order: len });
                setValue('correct_order', [...((correct_order ?? []) as number[]), len]);
              }}
            >
              افزودن مورد
            </Button>
          </Stack>
          <Stack spacing={2}>
            {(items ?? []).map((_, index) => (
              <Stack key={itemsFields.fields[index]?.id ?? index} direction="row" spacing={2} alignItems="center">
                <Chip size="small" label={index + 1} />
                <Controller
                  name={`items.${index}.text`}
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label={`مورد ${index + 1}`} fullWidth size="small" error={!!(errors as any).items?.[index]} />
                  )}
                />
                {(items ?? []).length > 2 && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      itemsFields.remove(index);
                      const currentOrder = (correct_order ?? []) as number[];
                      const newOrder = currentOrder
                        .filter((_, i) => i !== index)
                        .map((v) => (v > index ? v - 1 : v));
                      setValue('correct_order', newOrder);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      );
    }

    if (questionType === 'matching') {
      return (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>ستون چپ</Typography>
          <Stack direction="row" justifyContent="flex-end">
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => leftItemsFields.append({ text: '' })}>افزودن</Button>
          </Stack>
          <Stack spacing={1} sx={{ mb: 3 }}>
            {(left_items ?? []).map((_, index) => (
              <Stack key={leftItemsFields.fields[index]?.id ?? index} direction="row" spacing={2} alignItems="center">
                <Chip size="small" label={index + 1} />
                <Controller name={`left_items.${index}.text`} control={control} render={({ field }) => <TextField {...field} size="small" fullWidth placeholder={`مورد چپ ${index + 1}`} />} />
                {(left_items ?? []).length > 2 && <IconButton size="small" color="error" onClick={() => leftItemsFields.remove(index)}><DeleteIcon /></IconButton>}
              </Stack>
            ))}
          </Stack>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>ستون راست</Typography>
          <Stack direction="row" justifyContent="flex-end">
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => rightItemsFields.append({ text: '' })}>افزودن</Button>
          </Stack>
          <Stack spacing={1} sx={{ mb: 2 }}>
            {(right_items ?? []).map((_, index) => (
              <Stack key={rightItemsFields.fields[index]?.id ?? index} direction="row" spacing={2} alignItems="center">
                <Chip size="small" label={String.fromCharCode(65 + index)} />
                <Controller name={`right_items.${index}.text`} control={control} render={({ field }) => <TextField {...field} size="small" fullWidth placeholder={`مورد راست ${String.fromCharCode(65 + index)}`} />} />
                {(right_items ?? []).length > 2 && <IconButton size="small" color="error" onClick={() => rightItemsFields.remove(index)}><DeleteIcon /></IconButton>}
              </Stack>
            ))}
          </Stack>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>تطبیق هر مورد چپ با مورد راست</Typography>
          <Stack spacing={1}>
            {(left_items ?? []).map((_, leftIdx) => (
              <Stack key={leftIdx} direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ minWidth: 120 }}>{left_items?.[leftIdx]?.text || `چپ ${leftIdx + 1}`}</Typography>
                <Controller
                  name={`matches.${leftIdx}.right_index`}
                  control={control}
                  render={({ field }) => (
                    <FormControl size="small" sx={{ minWidth: 140 }}>
                      <Select {...field} value={field.value ?? 0}>
                        {(right_items ?? []).map((__, rightIdx) => (
                          <MenuItem key={rightIdx} value={rightIdx}>{right_items?.[rightIdx]?.text || `راست ${String.fromCharCode(65 + rightIdx)}`}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                />
              </Stack>
            ))}
          </Stack>
        </Box>
      );
    }

    if (questionType === 'fill_in_the_blank') {
      return (
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1">جای خالی‌ها (پاسخ صحیح هر جای خالی)</Typography>
            <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => blanksFields.append({ position: (blanks ?? []).length, correct_answer: '' })}>افزودن جای خالی</Button>
          </Stack>
          <Stack spacing={2}>
            {(blanks ?? []).map((_, index) => (
              <Stack key={blanksFields.fields[index]?.id ?? index} direction="row" spacing={2} alignItems="center">
                <Chip size="small" label={index + 1} />
                <Controller
                  name={`blanks.${index}.correct_answer`}
                  control={control}
                  render={({ field }) => <TextField {...field} size="small" fullWidth label={`پاسخ جای خالی ${index + 1}`} />}
                />
                {(blanks ?? []).length > 1 && (
                  <IconButton size="small" color="error" onClick={() => blanksFields.remove(index)}><DeleteIcon /></IconButton>
                )}
              </Stack>
            ))}
          </Stack>
        </Box>
      );
    }

    return null;
  };

  return (
    <UserLayout>
      <Container maxWidth="lg">
        <Stack spacing={4}>
          <Breadcrumb items={[{ label: 'بانک سوالات', href: '/questions' }, { label: 'ایجاد سوال جدید' }]} />
          <Box>
            <Typography variant="h4" gutterBottom>ایجاد سوال جدید</Typography>
            {examId && <Typography variant="body2" color="text.secondary">این سوال پس از ایجاد به آزمون اضافه خواهد شد.</Typography>}
          </Box>

          {(createQuestionMutation.isError || addQuestionToExamMutation.isError) && (
            <Alert severity="error">
              {createQuestionMutation.error instanceof Error && createQuestionMutation.error.message}
              {addQuestionToExamMutation.error instanceof Error && addQuestionToExamMutation.error.message}
            </Alert>
          )}

          {Object.keys(errors).length > 0 && (
            <Alert severity="warning">
              لطفا فیلدهای الزامی را تکمیل کنید و خطاهای نشان داده شده زیر فیلدها را برطرف کنید.
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={showPreview ? 6 : 12} sx={{ display: 'flex', flexDirection: 'column' }}>
                <Card sx={{ height: showPreview ? '100%' : 'auto', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flex: 1 }}>
                    <Stack spacing={3}>
                      <Controller
                        name="text"
                        control={control}
                        render={({ field }) => (
                          <TextField {...field} label="متن سوال" fullWidth required multiline rows={3} error={!!errors.text} helperText={errors.text?.message} placeholder="متن سوال را اینجا وارد کنید..." />
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
                            <Select {...field} label="دسته‌بندی" displayEmpty>
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
                      {renderTypeSpecificForm()}
                      <Divider />
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button variant="outlined" onClick={() => router.back()} disabled={createQuestionMutation.isPending || addQuestionToExamMutation.isPending}>انصراف</Button>
                        <Button type="submit" variant="contained" disabled={createQuestionMutation.isPending || addQuestionToExamMutation.isPending} size="large">
                          {createQuestionMutation.isPending || addQuestionToExamMutation.isPending ? 'در حال ایجاد...' : 'تکمیل و ایجاد سوال'}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              {showPreview && (
                <Grid item xs={12} md={6} sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <Stack spacing={2} sx={{ flex: 1 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6">پیش‌نمایش زنده</Typography>
                          <Button size="small" onClick={() => setShowPreview(!showPreview)}>{showPreview ? 'مخفی' : 'نمایش'}</Button>
                        </Stack>
                        <Divider />
                        <Box sx={{ flex: 1, overflow: 'auto' }}>
                          {QuestionPreview || <Alert severity="info">متن سوال را وارد کنید تا پیش‌نمایش نمایش داده شود.</Alert>}
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </form>
        </Stack>
      </Container>
    </UserLayout>
  );
}
