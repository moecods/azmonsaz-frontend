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
  return base;
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
