import { describe, expect, it } from "vitest";
import { flattenQuestionPages } from "@/hooks/useInfiniteQuestions";
import {
  buildQuestionsApiFilters,
  resolveNextQuestionPageParam,
} from "@/lib/questions-api-filters";
import type { PaginatedResponse, Question } from "@/types";

function page(
  ids: number[],
  current: number,
  last: number,
  total?: number
): PaginatedResponse<Question> {
  const per_page = 20;
  return {
    data: ids.map((id) => ({ id } as Question)),
    meta: {
      current_page: current,
      last_page: last,
      per_page,
      total: total ?? per_page * last,
    },
  };
}

describe("resolveNextQuestionPageParam", () => {
  it("returns next page when more pages exist", () => {
    const last = page([1, 2], 1, 3);
    expect(resolveNextQuestionPageParam(last, [last])).toBe(2);
  });

  it("returns undefined on last page", () => {
    const last = page([1], 3, 3);
    expect(resolveNextQuestionPageParam(last, [page([1], 1, 3), page([2], 2, 3), last])).toBe(
      undefined
    );
  });

  it("stops when API returns the same page number twice", () => {
    const p1 = page([1, 2], 1, 5);
    const p2 = page([3, 4], 1, 5);
    expect(resolveNextQuestionPageParam(p2, [p1, p2])).toBeUndefined();
  });

  it("continues when ids overlap but page number advances (unstable sort overlap)", () => {
    const p1 = page(Array.from({ length: 20 }, (_, i) => i + 1), 1, 5);
    const p2 = page(Array.from({ length: 20 }, (_, i) => i + 1), 2, 5);
    expect(resolveNextQuestionPageParam(p2, [p1, p2])).toBe(3);
  });

  it("handles string meta fields from JSON without lexicographic compare bugs", () => {
    const ids = Array.from({ length: 20 }, (_, i) => i + 21);
    const last = {
      data: ids.map((id) => ({ id } as Question)),
      meta: {
        current_page: "2" as unknown as number,
        last_page: "10" as unknown as number,
        per_page: 20,
        total: 200,
      },
    };
    expect(resolveNextQuestionPageParam(last, [page(Array.from({ length: 20 }, (_, i) => i + 1), 1, 10)])).toBe(3);
  });
});

describe("flattenQuestionPages", () => {
  it("dedupes questions by id across pages", () => {
    const merged = flattenQuestionPages([
      page([1, 2], 1, 2),
      page([2, 3], 2, 2),
    ]);
    expect(merged.map((q) => q.id)).toEqual([1, 2, 3]);
  });
});

describe("buildQuestionsApiFilters", () => {
  it("coerces category_id to number and sets per_page", () => {
    expect(buildQuestionsApiFilters({ category_id: 5, sort: "oldest" })).toEqual({
      per_page: 20,
      sort: "oldest",
      category_id: 5,
    });
  });
});
