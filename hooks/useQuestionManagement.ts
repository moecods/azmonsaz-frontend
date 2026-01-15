import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, QuestionFormData } from '@/lib/validation';
import {
  useQuestions,
  useQuestionCategories,
  useCreateQuestion,
  useUpdateQuestion,
  useDeleteQuestion,
} from '@/hooks';
import { ApiError } from '@/services';
import { Question, QuestionType, Difficulty, CreateQuestionRequest } from '@/types';

export interface QuestionFilters {
  search: string;
  category: number | '';
  difficulty: Difficulty | '';
  type: QuestionType | '';
  tags: string[];
  sort: 'newest' | 'oldest';
  page: number;
}

export function useQuestionManagement() {
  const [open, setOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
    category: '',
    difficulty: '',
    type: '',
    tags: [],
    sort: 'newest',
    page: 1,
  });

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
  const { data: questionsData, isLoading: questionsLoading } = useQuestions({
    search: filters.search || undefined,
    category_id: filters.category || undefined,
    difficulty: filters.difficulty || undefined,
    type: filters.type || undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    sort: filters.sort,
    page: filters.page,
    per_page: 10,
  });

  // Fetch categories
  const { data: categoriesData } = useQuestionCategories();

  // Get all unique tags from current questions for filter
  const allTags = Array.from(
    new Set(
      (questionsData?.data || [])
        .flatMap((q) => q.tags || [])
        .filter(Boolean)
    )
  ).sort();

  // Mutations
  const createQuestionMutation = useCreateQuestion();
  const updateQuestionMutation = useUpdateQuestion();
  const deleteQuestionMutation = useDeleteQuestion();

  // Filter handlers
  const updateFilter = <K extends keyof QuestionFilters>(
    key: K,
    value: QuestionFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value as number, // Reset to page 1 when filters change
    }));
  };

  // Dialog handlers
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

  // Option handlers
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
          .filter((c) => c !== index)
          .map((c) => (c > index ? c - 1 : c));
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
      const isCurrentlyCorrect =
        Array.isArray(currentCorrect) && currentCorrect.includes(index);
      const newCorrect = isCurrentlyCorrect
        ? currentCorrect.filter((c) => c !== index)
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

  // Form submit handler
  const onSubmit = (data: QuestionFormData) => {
    const handleError = (error: any) => {
      if (error instanceof ApiError && error.errors) {
        Object.keys(error.errors).forEach((field) => {
          const fieldName = field as keyof QuestionFormData;
          const errorMessage = Array.isArray(error.errors![field])
            ? error.errors![field][0]
            : error.errors![field];
          setError(fieldName, { type: 'server', message: errorMessage });
        });
      }
    };

    const handleSuccess = () => {
      setOpen(false);
      setEditingQuestion(null);
      reset();
    };

    // For essay type, correct_answer is null and no options needed
    if (data.type === 'essay') {
      const essayData: CreateQuestionRequest = {
        ...data,
        correct_answer: null,
        options: [],
      };

      if (editingQuestion) {
        updateQuestionMutation.mutate(
          { id: editingQuestion.id, data: essayData },
          {
            onSuccess: handleSuccess,
            onError: handleError,
          }
        );
      } else {
        createQuestionMutation.mutate(essayData, {
          onSuccess: handleSuccess,
          onError: handleError,
        });
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
        correct_answer:
          data.type === 'multiple_choice' || data.type === 'true_false'
            ? correctIndices[0] ?? 0
            : correctIndices,
      };

      if (editingQuestion) {
        updateQuestionMutation.mutate(
          { id: editingQuestion.id, data: questionData },
          {
            onSuccess: handleSuccess,
            onError: handleError,
          }
        );
      } else {
        createQuestionMutation.mutate(questionData, {
          onSuccess: handleSuccess,
          onError: handleError,
        });
      }
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این سوال را حذف کنید؟')) {
      deleteQuestionMutation.mutate(id);
    }
  };

  return {
    // State
    open,
    editingQuestion,
    filters,
    questions: questionsData?.data || [],
    categories: categoriesData || [],
    pagination: questionsData?.meta,
    allTags,
    isLoading: questionsLoading,
    isSubmitting:
      createQuestionMutation.isPending || updateQuestionMutation.isPending,

    // Form
    control,
    handleSubmit,
    errors,
    questionType,
    options,
    watch,

    // Handlers
    updateFilter,
    handleOpenCreate,
    handleOpenEdit,
    handleClose,
    handleAddOption,
    handleRemoveOption,
    handleToggleCorrect,
    handleTypeChange,
    onSubmit,
    handleDelete,
  };
}

