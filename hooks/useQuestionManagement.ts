import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useQuestionCategories,
  useDeleteQuestion,
} from '@/hooks';
import { useInfiniteQuestions } from '@/hooks/useInfiniteQuestions';
import { Question, Difficulty, QuestionType } from '@/types';

export interface QuestionFilters {
  search: string;
  category: number | '';
  difficulty: Difficulty | '';
  type: QuestionType | '';
  tags: string[];
  sort: 'newest' | 'oldest';
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
  });

  const apiFilterInput = useMemo(
    () => ({
      search: filters.search || undefined,
      category_id: filters.category || undefined,
      difficulty: filters.difficulty || undefined,
      type: filters.type || undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
      sort: filters.sort,
    }),
    [
      filters.search,
      filters.category,
      filters.difficulty,
      filters.type,
      filters.tags,
      filters.sort,
    ]
  );

  const questionsQuery = useInfiniteQuestions(apiFilterInput);

  const { data: categoriesData } = useQuestionCategories();

  const allTags = Array.from(
    new Set(questionsQuery.questions.flatMap((q) => q.tags || []).filter(Boolean))
  ).sort();

  const deleteQuestionMutation = useDeleteQuestion();

  const updateFilter = <K extends keyof QuestionFilters>(
    key: K,
    value: QuestionFilters[K]
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleOpenEdit = (question: Question) => {
    router.push(`/questions/${question.id}/edit`);
  };

  const handleDelete = (id: number) => {
    deleteQuestionMutation.mutate(id);
  };

  return {
    filters,
    questions: questionsQuery.questions,
    categories: categoriesData || [],
    totalCount: questionsQuery.totalCount,
    loadedCount: questionsQuery.loadedCount,
    allTags,
    isLoading: questionsQuery.isInitialLoading,
    isRefetching: questionsQuery.isRefetching,
    isFetchingNextPage: questionsQuery.isFetchingNextPage,
    hasNextPage: questionsQuery.canLoadMore,
    loadMore: questionsQuery.loadMore,
    isError: questionsQuery.isError,
    error: questionsQuery.error,
    refetch: questionsQuery.refetch,
    updateFilter,
    handleOpenEdit,
    handleDelete,
  };
}
