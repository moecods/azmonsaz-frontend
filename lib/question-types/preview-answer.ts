import type { QuestionFormData } from "@/lib/validation";

/** Build bank-shaped record for QuestionDisplay from create/edit form values. */
export function formValuesToBankSource(
  data: QuestionFormData,
  categoryName?: string | null
): Record<string, unknown> {
  return {
    text: data.text,
    type: data.type,
    difficulty: data.difficulty,
    tags: data.tags ?? [],
    category_name: categoryName ?? undefined,
    options: data.options?.map((o) => ({ text: o.text, is_correct: o.is_correct })) ?? [],
    correct_answer: data.correct_answer,
    items: data.items,
    correct_order: data.correct_order,
    left_items: data.left_items,
    right_items: data.right_items,
    matches: data.matches,
    blanks: data.blanks,
    correct_answers: data.correct_answers,
    manual_grading: data.manual_grading,
    matching_mode: data.matching_mode,
    display_settings: data.display_settings ?? {},
  };
}
