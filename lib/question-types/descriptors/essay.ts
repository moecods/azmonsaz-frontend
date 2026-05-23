import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseBankFields, baseExamPayload } from './shared';

export const essayDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    base.correct_answer = null;
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    return {
      ...baseBankFields(data),
      options: [],
      correct_answer: null,
    };
  },
};
