import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseBankFields, baseExamPayload, getOptionsCorrectAnswer } from './shared';

export const multipleSelectDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    const opts = data.options ?? [];
    base.options = opts.map((o) => o.text);
    base.correct_answer = getOptionsCorrectAnswer(data, true);
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    const correctIndices: number[] = [];
    (data.options ?? []).forEach((opt, index) => {
      if (opt.is_correct) correctIndices.push(index);
    });
    return {
      ...baseBankFields(data),
      options: (data.options ?? []).map((o) => ({ text: o.text, is_correct: o.is_correct })),
      correct_answer: correctIndices,
    };
  },
};
