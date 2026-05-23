import { describe, it, expect } from "vitest";
import { normalizeQuestion } from "@/lib/question-types/normalize-question";

describe("normalizeQuestion", () => {
  it("reads display_settings from bank question shape", () => {
    const norm = normalizeQuestion({
      text: "Q?",
      type: "multiple_choice",
      options: ["A", "B"],
      correct_answer: 0,
      display_settings: { optionsPerRow: 2, optionLabelStyle: "persian" },
    });
    expect(norm.display_settings.optionsPerRow).toBe(2);
    expect(norm.display_settings.optionLabelStyle).toBe("persian");
  });

  it("reads display_settings from exam payload shape", () => {
    const norm = normalizeQuestion({
      question_text: "Exam Q",
      type: "multiple_choice",
      options: ["X", "Y"],
      display_settings: { optionsPerRow: 3 },
    });
    expect(norm.text).toBe("Exam Q");
    expect(norm.display_settings.optionsPerRow).toBe(3);
  });
});
