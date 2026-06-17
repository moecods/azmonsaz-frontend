import {
  mockMatching,
  mockMultipleChoice,
  mockOrdering,
} from "@/components/questions/__storybook__/fixtures";
import type { ExamForPrint } from "./types";

const matching = mockMatching as unknown as Record<string, unknown>;
const ordering = mockOrdering as unknown as Record<string, unknown>;

/** Sample exam for template thumbnail previews (MC + matching + ordering). */
export const SAMPLE_PRINT_EXAM: ExamForPrint = {
  id: 0,
  title: "نمونه آزمون",
  meta: {
    duration_minutes: 45,
    passing_score: 50,
    instructions: "به سوالات با دقت پاسخ دهید.",
    points_per_question: 2,
  },
  partner: { name: "مدرسه نمونه" },
  exam_questions: [
    {
      id: 1,
      question_id: mockMultipleChoice.id,
      payload: {
        question_text: mockMultipleChoice.text,
        type: mockMultipleChoice.type,
        options: mockMultipleChoice.options,
        points: 2,
      },
    },
    {
      id: 2,
      question_id: mockMatching.id,
      payload: {
        question_text: mockMatching.text,
        type: mockMatching.type,
        left_items: matching.left_items,
        right_items: matching.right_items,
        matches: matching.matches,
        points: 3,
      },
    },
    {
      id: 3,
      question_id: mockOrdering.id,
      payload: {
        question_text: mockOrdering.text,
        type: mockOrdering.type,
        items: ordering.items,
        correct_answer: mockOrdering.correct_answer,
        points: 3,
      },
    },
  ],
};
