import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseExamPayload } from './shared';

export const matchingDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    base.left_items = data.left_items ?? [];
    base.right_items = data.right_items ?? [];
    base.matches = data.matches ?? [];
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    return {
      text: data.text,
      type: data.type,
      category_id: data.category_id,
      tags: data.tags ?? [],
      difficulty: data.difficulty,
      left_items: data.left_items ?? [],
      right_items: data.right_items ?? [],
      matches: data.matches ?? [],
    };
  },
};
