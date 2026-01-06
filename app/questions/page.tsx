"use client";

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Pagination,
  Checkbox,
  Autocomplete,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, QuestionFormData } from '@/lib/validation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '@/lib/data-service';
import { queryKeys } from '@/lib/query-client';
import { Question, QuestionType, Difficulty, ExamQuestion, CreateQuestionRequest, ApiResponse, PaginatedResponse } from '@/types';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export default function QuestionsPage() {
  const [open, setOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [selectedType, setSelectedType] = useState<QuestionType | ''>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    setError,
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

  const questionType = watch('type');
  const options = watch('options');

  // Fetch questions
  const { data: questionsData, isLoading: questionsLoading } = useQuery({
    queryKey: queryKeys.questions({
      search: searchTerm || undefined,
      category_id: selectedCategory || undefined,
      difficulty: selectedDifficulty || undefined,
      type: selectedType || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sort: sortOrder,
      page,
      per_page: 10,
    }),
    queryFn: () => dataService.getQuestions({
      search: searchTerm || undefined,
      category_id: selectedCategory || undefined,
      difficulty: selectedDifficulty || undefined,
      type: selectedType || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      sort: sortOrder,
      page,
      per_page: 10,
    }),
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => dataService.getCategories(),
  });

  // Get all unique tags from current questions for filter
  const allTags = Array.from(
    new Set(
      (questionsData?.data?.data || [])
        .flatMap(q => q.tags || [])
        .filter(Boolean)
    )
  ).sort();

  // Create question mutation
  const createQuestionMutation = useMutation({
    mutationFn: (data: CreateQuestionRequest) => dataService.createQuestion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions() });
      setOpen(false);
      reset();
    },
    onError: (error: any) => {
      // Handle validation errors from backend
      if (error.errors && error.status === 422) {
        // Set form errors from backend validation
        Object.keys(error.errors).forEach((field) => {
          const fieldName = field as keyof QuestionFormData;
          const errorMessage = Array.isArray(error.errors[field]) 
            ? error.errors[field][0] 
            : error.errors[field];
          
          // Map backend field names to form field names
          if (fieldName === 'options') {
            setError('options', { 
              type: 'server', 
              message: errorMessage 
            });
          } else if (fieldName in control._formValues) {
            setError(fieldName, { 
              type: 'server', 
              message: errorMessage 
            });
          }
        });
      }
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuestionFormData }) => 
      dataService.updateQuestion(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.questions() });
      setOpen(false);
      setEditingQuestion(null);
      reset();
    },
    onError: (error: any) => {
      // Handle validation errors from backend
      if (error.errors && error.status === 422) {
        // Set form errors from backend validation
        Object.keys(error.errors).forEach((field) => {
          const fieldName = field as keyof QuestionFormData;
          const errorMessage = Array.isArray(error.errors[field]) 
            ? error.errors[field][0] 
            : error.errors[field];
          
          // Map backend field names to form field names
          if (fieldName === 'options') {
            setError('options', { 
              type: 'server', 
              message: errorMessage 
            });
          } else if (fieldName in control._formValues) {
            setError(fieldName, { 
              type: 'server', 
              message: errorMessage 
            });
          }
        });
      }
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (id: number) => dataService.deleteQuestion(id),
    onMutate: async (deletedId) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.questions() });

      // Get current query key
      const currentQueryKey = queryKeys.questions({
        search: searchTerm || undefined,
        category_id: selectedCategory || undefined,
        difficulty: selectedDifficulty || undefined,
        type: selectedType || undefined,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        sort: sortOrder,
        page,
        per_page: 10,
      });

      // Snapshot the previous value
      const previousQuestions = queryClient.getQueryData<ApiResponse<PaginatedResponse<Question>>>(currentQueryKey);

      // Optimistically update to remove the question
      if (previousQuestions?.data) {
        queryClient.setQueryData<ApiResponse<PaginatedResponse<Question>>>(
          currentQueryKey,
          {
            ...previousQuestions,
            data: {
              ...previousQuestions.data,
              data: previousQuestions.data.data.filter((q: Question) => q.id !== deletedId),
              meta: {
                ...previousQuestions.data.meta,
                total: Math.max(0, previousQuestions.data.meta.total - 1),
              },
            },
          }
        );
      }

      // Return context with the previous value
      return { previousQuestions, currentQueryKey };
    },
    onError: (err, deletedId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousQuestions && context?.currentQueryKey) {
        queryClient.setQueryData(context.currentQueryKey, context.previousQuestions);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.questions() });
    },
  });

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    reset({
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
    });
    setOpen(true);
  };

  const handleOpenEdit = (question: Question) => {
    setEditingQuestion(question);
    setValue('text', question.text);
    setValue('type', question.type);
    setValue('options', question.options);
    setValue('correct_answer', question.correct_answer);
    setValue('category_id', question.category_id);
    setValue('tags', question.tags);
    setValue('difficulty', question.difficulty);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingQuestion(null);
    reset({
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
    });
  };

  const handleAddOption = () => {
    const currentOptions = watch('options') || [];
    setValue('options', [...currentOptions, { text: '', is_correct: false }]);
  };

  const handleRemoveOption = (index: number) => {
    const currentOptions = watch('options') || [];
    if (currentOptions.length > 2) {
      const newOptions = currentOptions.filter((_, i) => i !== index);
      setValue('options', newOptions);
      
      // Update correct_answer if needed
      const currentCorrect = watch('correct_answer');
      if (typeof currentCorrect === 'number') {
        if (currentCorrect === index) {
          setValue('correct_answer', 0);
        } else if (currentCorrect > index) {
          setValue('correct_answer', currentCorrect - 1);
        }
      } else if (Array.isArray(currentCorrect)) {
        const newCorrect = currentCorrect
          .filter(c => c !== index)
          .map(c => c > index ? c - 1 : c);
        setValue('correct_answer', newCorrect);
      }
    }
  };

  const handleToggleCorrect = (index: number) => {
    const currentOptions = watch('options') || [];
    const currentCorrect = watch('correct_answer');
    
    if (questionType === 'multiple_choice' || questionType === 'true_false') {
      // Single correct answer
      const newOptions = currentOptions.map((opt, i) => ({
        ...opt,
        is_correct: i === index,
      }));
      setValue('options', newOptions);
      setValue('correct_answer', index);
    } else if (questionType === 'multiple_select') {
      // Multiple correct answers
      const isCurrentlyCorrect = Array.isArray(currentCorrect) && currentCorrect.includes(index);
      const newCorrect = isCurrentlyCorrect
        ? currentCorrect.filter(c => c !== index)
        : [...(Array.isArray(currentCorrect) ? currentCorrect : []), index];
      
      const newOptions = currentOptions.map((opt, i) => ({
        ...opt,
        is_correct: newCorrect.includes(i),
      }));
      setValue('options', newOptions);
      setValue('correct_answer', newCorrect);
    }
  };

  const handleTypeChange = (newType: QuestionType) => {
    setValue('type', newType);
    
    if (newType === 'essay') {
      // Essay questions don't need options or correct_answer
      setValue('options', []);
      setValue('correct_answer', null);
    } else if (newType === 'true_false') {
      setValue('options', [
        { text: 'درست', is_correct: false },
        { text: 'نادرست', is_correct: false },
      ]);
      setValue('correct_answer', 0);
    } else if (!options || options.length < 2) {
      setValue('options', [
        { text: '', is_correct: false },
        { text: '', is_correct: false },
      ]);
      setValue('correct_answer', newType === 'multiple_select' ? [] : 0);
    }
  };

  const handleTagsChange = (tags: string[]) => {
    setValue('tags', tags);
  };

  const onSubmit = (data: QuestionFormData) => {
    // For essay type, correct_answer is null and no options needed
    if (data.type === 'essay') {
      const essayData: CreateQuestionRequest = {
        ...data,
        correct_answer: null,
        options: [],
      };
      
      if (editingQuestion) {
        updateQuestionMutation.mutate({ id: editingQuestion.id, data: essayData });
      } else {
        createQuestionMutation.mutate(essayData);
      }
    } else {
      // Ensure correct_answer is properly set based on options
      const correctIndices: number[] = [];
      (data.options || []).forEach((opt, index) => {
        if (opt.is_correct) {
          correctIndices.push(index);
        }
      });

      const questionData: CreateQuestionRequest = {
        ...data,
        options: data.options || [],
        correct_answer: data.type === 'multiple_choice' || data.type === 'true_false' 
          ? (correctIndices[0] ?? 0)
          : correctIndices,
      };

      if (editingQuestion) {
        updateQuestionMutation.mutate({ id: editingQuestion.id, data: questionData });
      } else {
        createQuestionMutation.mutate(questionData);
      }
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این سوال را حذف کنید؟')) {
      deleteQuestionMutation.mutate(id);
    }
  };

  const questions = questionsData?.data?.data || [];
  const categories = categoriesData?.data || [];
  const pagination = questionsData?.data?.meta;

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4">بانک سوالات</Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              افزودن سوال
            </Button>
          </Stack>
        </Stack>

        {/* Filters */}
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="جستجوی سوالات"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
              <Stack direction="row" spacing={2}>
                <FormControl fullWidth>
                  <InputLabel>دسته‌بندی</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value as number | '');
                      setPage(1);
                    }}
                    label="دسته‌بندی"
                  >
                    <MenuItem value="">همه دسته‌بندی‌ها</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>سطح دشواری</InputLabel>
                  <Select
                    value={selectedDifficulty}
                    onChange={(e) => {
                      setSelectedDifficulty(e.target.value as Difficulty | '');
                      setPage(1);
                    }}
                    label="سطح دشواری"
                  >
                    <MenuItem value="">همه سطوح</MenuItem>
                    <MenuItem value="easy">آسان</MenuItem>
                    <MenuItem value="medium">متوسط</MenuItem>
                    <MenuItem value="hard">سخت</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>نوع سوال</InputLabel>
                  <Select
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value as QuestionType | '');
                      setPage(1);
                    }}
                    label="نوع سوال"
                  >
                    <MenuItem value="">همه انواع</MenuItem>
                    <MenuItem value="multiple_choice">چند گزینه‌ای</MenuItem>
                    <MenuItem value="true_false">صحیح/غلط</MenuItem>
                    <MenuItem value="multiple_select">چند گزینه‌ای (چند پاسخ)</MenuItem>
                    <MenuItem value="essay">تشریحی</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>مرتب‌سازی</InputLabel>
                  <Select
                    value={sortOrder}
                    onChange={(e) => {
                      setSortOrder(e.target.value as 'newest' | 'oldest');
                      setPage(1);
                    }}
                    label="مرتب‌سازی"
                  >
                    <MenuItem value="newest">جدیدترین</MenuItem>
                    <MenuItem value="oldest">قدیمی‌ترین</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
              
              {/* Tags Filter */}
              <Autocomplete
                multiple
                options={allTags}
                value={selectedTags}
                onChange={(_, newValue) => {
                  setSelectedTags(newValue);
                  setPage(1);
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
                    placeholder="برچسب‌ها را برای فیلتر انتخاب کنید"
                  />
                )}
                sx={{ width: '100%' }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* Questions Table */}
        <Card>
          <CardContent>
            {questionsLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>سوال</TableCell>
                        <TableCell>نوع</TableCell>
                        <TableCell>دسته‌بندی</TableCell>
                        <TableCell>سطح دشواری</TableCell>
                        <TableCell>برچسب‌ها</TableCell>
                        <TableCell>عملیات</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {questions.map((question) => (
                        <TableRow key={question.id}>
                          <TableCell>
                            <Typography variant="body2" sx={{ maxWidth: 300 }}>
                              {question.text.length > 100 
                                ? `${question.text.substring(0, 100)}...` 
                                : question.text
                              }
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={question.type.replace('_', ' ')} 
                              size="small" 
                              color="primary" 
                            />
                          </TableCell>
                          <TableCell>{question.category?.name}</TableCell>
                          <TableCell>
                            <Chip 
                              label={question.difficulty} 
                              size="small" 
                              color={
                                question.difficulty === 'easy' ? 'success' :
                                question.difficulty === 'medium' ? 'warning' : 'error'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {question.tags.slice(0, 2).map((tag, index) => (
                                <Chip key={index} label={tag} size="small" variant="outlined" />
                              ))}
                              {question.tags.length > 2 && (
                                <Chip label={`+${question.tags.length - 2}`} size="small" />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(question)}
                              >
                                <EditIcon />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(question.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                  <Box display="flex" justifyContent="center" mt={3}>
                    <Pagination
                      count={pagination.last_page}
                      page={page}
                      onChange={(_, newPage) => setPage(newPage)}
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingQuestion ? 'ویرایش سوال' : 'ایجاد سوال جدید'}
          </DialogTitle>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogContent>
              <Stack spacing={3} sx={{ mt: 2 }}>
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
                            handleTypeChange(e.target.value as QuestionType);
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

                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.category_id}>
                      <InputLabel>دسته‌بندی</InputLabel>
                      <Select {...field} label="دسته‌بندی">
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

                {/* Essay type info */}
                {questionType === 'essay' && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    سوالات تشریحی نیازی به گزینه یا پاسخ صحیح ندارند. پاسخ‌ها به صورت دستی بررسی می‌شوند.
                  </Alert>
                )}

                {/* Options Management - Not needed for essay type */}
                {(questionType === 'multiple_choice' || questionType === 'true_false' || questionType === 'multiple_select') && (
                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                      <Typography variant="subtitle1">گزینه‌ها</Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleAddOption}
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
                                onClick={() => handleToggleCorrect(index)}
                                color={option.is_correct ? 'success' : 'default'}
                                disabled={!option.text}
                                title={option.is_correct ? 'پاسخ صحیح' : 'علامت‌گذاری به عنوان پاسخ صحیح'}
                              >
                                {option.is_correct ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
                              </IconButton>
                              <IconButton
                                onClick={() => handleRemoveOption(index)}
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

                {/* Tags Input with Autocomplete */}
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
                        // Filter out empty strings and ensure uniqueness
                        const filteredValue = newValue
                          .map(v => (typeof v === 'string' ? v.trim() : v))
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
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose}>انصراف</Button>
              <Button 
                type="submit"
                variant="contained"
                disabled={createQuestionMutation.isPending || updateQuestionMutation.isPending}
              >
                {createQuestionMutation.isPending || updateQuestionMutation.isPending 
                  ? 'در حال ذخیره...' 
                  : editingQuestion ? 'به‌روزرسانی' : 'ایجاد'
                }
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Stack>
    </Box>
  );
}
