import type { QuestionFilters } from "@/services/questions";
import type { PaginatedResponse, Question } from "@/types";

export const QUESTIONS_INFINITE_PAGE_SIZE = 20;

export type QuestionsListFiltersInput = Omit<QuestionFilters, "page">;

/** Stable API params (consistent types and omitted empties). */
export function buildQuestionsApiFilters(
  input: QuestionsListFiltersInput
): QuestionFilters {
  const perPage = input.per_page ?? QUESTIONS_INFINITE_PAGE_SIZE;
  const filters: QuestionFilters = {
    per_page: perPage,
    sort: input.sort ?? "newest",
  };

  const search = input.search?.trim();
  if (search) filters.search = search;

  if (input.category_id != null && input.category_id !== "") {
    filters.category_id = Number(input.category_id);
  }

  if (input.difficulty) filters.difficulty = input.difficulty;
  if (input.type) filters.type = input.type;
  if (input.tags?.length) filters.tags = input.tags;

  return filters;
}

export function questionsInfiniteQueryKey(input: QuestionsListFiltersInput) {
  return ["questions", "infinite", buildQuestionsApiFilters(input)] as const;
}

function pageMetaNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

export function resolveNextQuestionPageParam(
  lastPage: PaginatedResponse<Question>,
  allPages: PaginatedResponse<Question>[]
): number | undefined {
  const current_page = pageMetaNumber(lastPage.meta.current_page);
  const last_page = pageMetaNumber(lastPage.meta.last_page);

  if (!Number.isFinite(current_page) || !Number.isFinite(last_page)) {
    return undefined;
  }
  if (current_page >= last_page) return undefined;
  if (lastPage.data.length === 0) return undefined;

  // Stop only when the API returns the same page number again (avoids infinite loops).
  const duplicatePageNumber = allPages
    .slice(0, -1)
    .some((page) => pageMetaNumber(page.meta.current_page) === current_page);
  if (duplicatePageNumber) return undefined;

  return current_page + 1;
}
