import { describe, it, expect } from "vitest";
import {
  buildPendingGradingTargets,
  getPendingGradingStats,
  questionNeedsTeacherGrading,
} from "@/lib/grading-navigation";

const pending = {
  exam_question_id: 10,
  is_pending_grading: true,
  manual_score: null as number | null,
};

describe("grading-navigation", () => {
  it("treats pending question as outstanding when not saved or touched", () => {
    expect(questionNeedsTeacherGrading(pending)).toBe(true);
    expect(getPendingGradingStats([pending]).outstandingCount).toBe(1);
  });

  it("skips pending question after server manual_score", () => {
    const saved = { ...pending, manual_score: 5 };
    expect(questionNeedsTeacherGrading(saved)).toBe(false);
    expect(getPendingGradingStats([saved]).allDone).toBe(true);
  });

  it("skips pending question when graded locally in session", () => {
    const locallyGradedIds = new Set([10]);
    expect(questionNeedsTeacherGrading(pending, { locallyGradedIds })).toBe(false);
    expect(buildPendingGradingTargets([pending], { locallyGradedIds })).toEqual([]);
    expect(getPendingGradingStats([pending], { locallyGradedIds }).allDone).toBe(true);
  });
});
