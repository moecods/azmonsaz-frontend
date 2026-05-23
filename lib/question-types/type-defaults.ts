import type { QuestionFormData } from "@/lib/validation";
import type { QuestionTypeId } from "./constants";
import { getQuestionPlugin } from "./plugins";

/** Demo defaults shown when the teacher switches question type (create/edit). */
export function getQuestionTypeDefaults(type: QuestionTypeId): Partial<QuestionFormData> {
  const plugin = getQuestionPlugin(type);
  const display_settings = plugin?.defaultDisplaySettings ?? {};

  switch (type) {
    case "multiple_choice":
      return {
        options: [
          { text: "گزینه الف", is_correct: true },
          { text: "گزینه ب", is_correct: false },
          { text: "گزینه ج", is_correct: false },
          { text: "گزینه د", is_correct: false },
        ],
        correct_answer: 0,
        display_settings,
      };
    case "true_false":
      return {
        options: [
          { text: "صحیح", is_correct: true },
          { text: "غلط", is_correct: false },
        ],
        correct_answer: 0,
        display_settings,
      };
    case "multiple_select":
      return {
        options: [
          { text: "گزینه ۱", is_correct: true },
          { text: "گزینه ۲", is_correct: true },
          { text: "گزینه ۳", is_correct: false },
        ],
        correct_answer: [0, 1],
        display_settings,
      };
    case "essay":
      return {
        options: [],
        correct_answer: null,
        display_settings,
      };
    case "short_answer":
      return {
        options: [],
        correct_answer: "",
        correct_answers: ["پاسخ نمونه"],
        manual_grading: false,
        display_settings,
      };
    case "ordering":
      return {
        options: [],
        items: [
          { text: "مرحله اول", order: 0 },
          { text: "مرحله دوم", order: 1 },
          { text: "مرحله سوم", order: 2 },
        ],
        correct_order: [0, 1, 2],
        display_settings,
      };
    case "matching":
      return {
        options: [],
        left_items: [{ text: "پایتخت ایران" }, { text: "۲ + ۲" }],
        right_items: [{ text: "تهران" }, { text: "۴" }],
        matches: [
          { left_index: 0, right_index: 0 },
          { left_index: 1, right_index: 1 },
        ],
        matching_mode: "one_to_one",
        display_settings: { ...display_settings, matchingMode: "one_to_one" },
      };
    case "fill_in_the_blank":
      return {
        options: [],
        text: "پایتخت ایران _____ است.",
        blanks: [{ position: 0, correct_answers: ["تهران"], grading: "auto" as const }],
        display_settings,
      };
    default:
      return { display_settings };
  }
}
