import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseExamPayload } from './shared';

export const orderingDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    const items = data.items ?? [];
    base.items = items.map((item, i) => ({ text: item.text, order: i }));
    base.correct_order = data.correct_order ?? items.map((_, i) => i);
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    const items = data.items ?? [];
    return {
      text: data.text,
      type: data.type,
      category_id: data.category_id,
      tags: data.tags ?? [],
      difficulty: data.difficulty,
      items: items.map((item, i) => ({ text: item.text, order: i })),
      correct_order: data.correct_order ?? items.map((_, i) => i),
    };
  },
};
