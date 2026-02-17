import type { QuestionTypeDescriptor } from './types';
import type { QuestionFormData } from '@/lib/validation';
import type { QuestionCategoryRef } from './types';
import { baseExamPayload, getOptionsCorrectAnswer } from './shared';

export const trueFalseDescriptor: QuestionTypeDescriptor = {
  buildExamPayload(data: QuestionFormData, categories: QuestionCategoryRef[]): Record<string, unknown> {
    const base = baseExamPayload(data, categories);
    const opts = data.options ?? [];
    base.options = opts.map((o) => o.text);
    base.correct_answer = getOptionsCorrectAnswer(data, false);
    return base;
  },
  buildBankPayload(data: QuestionFormData): Record<string, unknown> {
    const correctIndices: number[] = [];
    (data.options ?? []).forEach((opt, index) => {
      if (opt.is_correct) correctIndices.push(index);
    });
    return {
      text: data.text,
      type: data.type,
      category_id: data.category_id,
      tags: data.tags ?? [],
      difficulty: data.difficulty,
      options: (data.options ?? []).map((o) => ({ text: o.text, is_correct: o.is_correct })),
      correct_answer: correctIndices[0] ?? 0,
    };
  },
};
