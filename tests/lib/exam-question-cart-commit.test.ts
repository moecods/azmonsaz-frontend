import { describe, it, expect, vi, beforeEach } from "vitest";
import { commitExamQuestionCart } from "@/lib/exam-question-cart-commit";
import { examService } from "@/services";

vi.mock("@/services", () => ({
  examService: {
    addQuestionToExam: vi.fn(),
  },
  ApiError: class ApiError extends Error {},
}));

describe("commitExamQuestionCart", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips ids already on exam", async () => {
    vi.mocked(examService.addQuestionToExam).mockResolvedValue({
      success: true,
      data: { id: 1 },
    });

    const result = await commitExamQuestionCart({
      examId: 1,
      cartIds: [10, 20],
      existingQuestions: [],
      inExamQuestionIds: new Set([10]),
      exam: null,
    });

    expect(examService.addQuestionToExam).toHaveBeenCalledTimes(1);
    expect(result.successCount).toBe(1);
  });

  it("aborts when batch would exceed max score", async () => {
    const result = await commitExamQuestionCart({
      examId: 1,
      cartIds: [1, 2, 3],
      existingQuestions: [],
      inExamQuestionIds: new Set(),
      exam: {
        grading_mode: "numeric_scale",
        grading_config: { scale_max: 2 },
        points_per_question: 1,
      },
    });

    expect(result.abortedByMaxScore).toBe(true);
    expect(examService.addQuestionToExam).not.toHaveBeenCalled();
  });
});
