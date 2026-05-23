import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';

export function baseExamPayload(
  data: QuestionFormData,
  categories: QuestionCategoryRef[]
): Record<string, unknown> {
  const base: Record<string, unknown> = {
    question_text: data.text,
    type: data.type,
    order: 1,
    points: 10,
    difficulty: data.difficulty,
    tags: data.tags ?? [],
  };
  if (data.category_id && categories.length) {
    const cat = categories.find((c) => c.id === data.category_id);
    if (cat) base.category = cat.name;
  }
  const displaySettings = {
    ...((data.display_settings as Record<string, unknown>) ?? {}),
  };
  if (data.matching_mode) {
    base.matching_mode = data.matching_mode;
    displaySettings.matchingMode = data.matching_mode;
  }
  base.display_settings = displaySettings;
  return base;
}

/** Common bank API fields including display layout settings. */
export function baseBankFields(data: QuestionFormData): Record<string, unknown> {
  return {
    text: data.text,
    type: data.type,
    category_id: data.category_id,
    tags: data.tags ?? [],
    difficulty: data.difficulty,
    display_settings: data.display_settings ?? {},
  };
}

export function getOptionsCorrectAnswer(
  data: QuestionFormData,
  multiple: boolean
): number | number[] {
  const opts = data.options ?? [];
  const correctIndices: number[] = [];
  opts.forEach((o, i) => {
    if (o.is_correct) correctIndices.push(i);
  });
  return multiple ? correctIndices : (correctIndices[0] ?? 0);
}
