import { describe, it, expect } from "vitest";
import { normalizeQuestion } from "@/lib/question-types/normalize-question";
import { isCorrectOptionId } from "@/lib/option-ids";

const OPT_A = "01JOPT00000000000000000001";
const OPT_B = "01JOPT00000000000000000002";

describe("normalizeQuestion", () => {
  it("reads display_settings from bank question shape", () => {
    const norm = normalizeQuestion({
      text: "Q?",
      type: "multiple_choice",
      options: [
        { id: OPT_A, text: "A" },
        { id: OPT_B, text: "B" },
      ],
      correct_answer: OPT_A,
      display_settings: { optionsPerRow: 2, optionLabelStyle: "persian" },
    });
    expect(norm.display_settings.optionsPerRow).toBe(2);
    expect(norm.display_settings.optionLabelStyle).toBe("persian");
    expect(norm.correct_answer).toBe(OPT_A);
  });

  it("reads display_settings from exam payload shape", () => {
    const norm = normalizeQuestion({
      question_text: "Exam Q",
      type: "multiple_choice",
      options: [
        { id: OPT_A, text: "X" },
        { id: OPT_B, text: "Y" },
      ],
      display_settings: { optionsPerRow: 3 },
    });
    expect(norm.text).toBe("Exam Q");
    expect(norm.display_settings.optionsPerRow).toBe(3);
  });

  it("reads matching pairs from correct_answer (bank API shape)", () => {
    const norm = normalizeQuestion({
      type: "matching",
      options: {
        left_items: [{ text: "فرانسه" }, { text: "ژاپن" }],
        right_items: [{ text: "پاریس" }, { text: "توکیو" }],
      },
      correct_answer: [
        { left_index: 0, right_index: 0 },
        { left_index: 1, right_index: 1 },
      ],
    });
    expect(norm.matches).toHaveLength(2);
    expect(norm.matches[0]).toEqual({ left_index: 0, right_index: 0 });
    expect(norm.matches[1]).toEqual({ left_index: 1, right_index: 1 });
  });

  it("does not default matching to right_index 0 when key is missing", () => {
    const norm = normalizeQuestion({
      type: "matching",
      options: {
        left_items: [{ text: "A" }, { text: "B" }],
        right_items: [{ text: "1" }, { text: "2" }],
      },
    });
    expect(norm.matches).toEqual([]);
  });
});

describe("isCorrectOptionId", () => {
  it("matches single and multiple correct ids", () => {
    expect(isCorrectOptionId("multiple_choice", OPT_A, OPT_A)).toBe(true);
    expect(isCorrectOptionId("multiple_choice", OPT_A, OPT_B)).toBe(false);
    expect(isCorrectOptionId("multiple_select", [OPT_A, OPT_B], OPT_B)).toBe(true);
    expect(isCorrectOptionId("multiple_select", [OPT_A, OPT_B], "other")).toBe(false);
  });
});
