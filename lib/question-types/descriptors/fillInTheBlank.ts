import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseExamPayload } from './shared';

export const fillInTheBlankDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    base.blanks = data.blanks ?? [];
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    return {
      text: data.text,
      type: data.type,
      category_id: data.category_id,
      tags: data.tags ?? [],
      difficulty: data.difficulty,
      blanks: data.blanks ?? [],
    };
  },
};
