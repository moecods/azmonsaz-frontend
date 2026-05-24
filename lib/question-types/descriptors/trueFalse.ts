import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseBankFields, baseExamPayload, buildOptionTypePayload } from './shared';

export const trueFalseDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    const built = buildOptionTypePayload(data, false);
    base.options = built.options;
    base.correct_answer = built.correct_answer;
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    const built = buildOptionTypePayload(data, false);
    return {
      ...baseBankFields(data),
      options: built.options,
      correct_answer: built.correct_answer,
    };
  },
};
