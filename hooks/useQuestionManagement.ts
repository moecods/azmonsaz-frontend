import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useQuestions,
  useQuestionCategories,
  useDeleteQuestion,
} from '@/hooks';
import { Question, Difficulty, QuestionType } from '@/types';

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
  const router = useRouter();
  const [filters, setFilters] = useState<QuestionFilters>({
    search: '',
    category: '',
    difficulty: '',
    type: '',
    tags: [],
    sort: 'newest',
    page: 1,
  });

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

  const deleteQuestionMutation = useDeleteQuestion();

  const updateFilter = <K extends keyof QuestionFilters>(
    key: K,
    value: QuestionFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : (value as number),
    }));
  };

  const handleOpenEdit = (question: Question) => {
    router.push(`/questions/${question.id}/edit`);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید این سوال را حذف کنید؟')) {
      deleteQuestionMutation.mutate(id);
    }
  };

  return {
    filters,
    questions: questionsData?.data || [],
    categories: categoriesData || [],
    pagination: questionsData?.meta,
    allTags,
    isLoading: questionsLoading,
    updateFilter,
    handleOpenEdit,
    handleDelete,
  };
}
