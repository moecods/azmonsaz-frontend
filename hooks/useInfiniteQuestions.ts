"use client";

import { useCallback, useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { questionService } from "@/services";
import type { PaginatedResponse, Question } from "@/types";
import {
  buildQuestionsApiFilters,
  questionsInfiniteQueryKey,
  resolveNextQuestionPageParam,
  QUESTIONS_INFINITE_PAGE_SIZE,
  type QuestionsListFiltersInput,
} from "@/lib/questions-api-filters";

export { QUESTIONS_INFINITE_PAGE_SIZE };

export type QuestionsInfiniteFilters = QuestionsListFiltersInput;

export { questionsInfiniteQueryKey } from "@/lib/questions-api-filters";

/** Merge infinite-query pages; dedupe by id (guards overlapping API pages). */
export function flattenQuestionPages(
  pages: PaginatedResponse<Question>[] | undefined
): Question[] {
  if (!pages?.length) return [];

  const seen = new Set<number>();
  const merged: Question[] = [];

  for (const page of pages) {
    for (const question of page.data) {
      if (seen.has(question.id)) continue;
      seen.add(question.id);
      merged.push(question);
    }
  }

  return merged;
}

export function useInfiniteQuestions(input: QuestionsInfiniteFilters) {
  const apiFilters = useMemo(
    () => buildQuestionsApiFilters(input),
    [
      input.search,
      input.category_id,
      input.difficulty,
      input.type,
      input.sort,
      input.per_page,
      JSON.stringify(input.tags ?? []),
    ]
  );

  const query = useInfiniteQuery({
    queryKey: questionsInfiniteQueryKey(apiFilters),
    queryFn: async ({ pageParam }) => {
      const response = await questionService.getQuestions({
        ...apiFilters,
        page: pageParam as number,
      });
      if (!response.success) {
        throw new Error(response.message || "Failed to fetch questions");
      }
      const payload = response.data;
      if (!payload?.meta || !Array.isArray(payload.data)) {
        throw new Error("Invalid questions pagination response");
      }
      return payload;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      resolveNextQuestionPageParam(lastPage, allPages),
    // Global default is keepPreviousData; with infinite queries it shows stale pages,
    // breaks hasNextPage / loadMore, and causes duplicate React keys after filter changes.
    placeholderData: () => undefined,
  });

  const questions = useMemo(
    () => flattenQuestionPages(query.data?.pages),
    [query.data?.pages]
  );

  const totalCount = query.data?.pages[0]?.meta.total ?? 0;
  const loadedCount = questions.length;

  const canLoadMore =
    Boolean(query.hasNextPage) &&
    !query.isPlaceholderData &&
    !query.isFetchingNextPage;

  const loadMore = useCallback(() => {
    if (!canLoadMore) return;
    void query.fetchNextPage();
  }, [canLoadMore, query.fetchNextPage]);

  const isInitialLoading =
    (query.isPending || query.isFetching) && loadedCount === 0;
  const isRefetching =
    query.isFetching &&
    !query.isFetchingNextPage &&
    !query.isPending &&
    loadedCount > 0;

  return {
    ...query,
    questions,
    totalCount,
    loadedCount,
    loadMore,
    canLoadMore,
    isInitialLoading,
    isRefetching,
  };
}
