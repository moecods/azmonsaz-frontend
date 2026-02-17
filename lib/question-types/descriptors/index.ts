import type { QuestionTypeId } from '../constants';
import type { QuestionTypeDescriptor } from './types';
import { multipleChoiceDescriptor } from './multipleChoice';
import { trueFalseDescriptor } from './trueFalse';
import { multipleSelectDescriptor } from './multipleSelect';
import { essayDescriptor } from './essay';
import { shortAnswerDescriptor } from './shortAnswer';
import { orderingDescriptor } from './ordering';
import { matchingDescriptor } from './matching';
import { fillInTheBlankDescriptor } from './fillInTheBlank';

const DESCRIPTORS: Record<QuestionTypeId, QuestionTypeDescriptor> = {
  multiple_choice: multipleChoiceDescriptor,
  true_false: trueFalseDescriptor,
  multiple_select: multipleSelectDescriptor,
  essay: essayDescriptor,
  short_answer: shortAnswerDescriptor,
  ordering: orderingDescriptor,
  matching: matchingDescriptor,
  fill_in_the_blank: fillInTheBlankDescriptor,
};

export function getDescriptor(type: string): QuestionTypeDescriptor {
  const d = DESCRIPTORS[type as QuestionTypeId];
  if (!d) {
    throw new Error(`Unknown question type: ${type}`);
  }
  return d;
}

export function getDescriptorOrNull(type: string): QuestionTypeDescriptor | null {
  return DESCRIPTORS[type as QuestionTypeId] ?? null;
}

export type { QuestionTypeDescriptor, QuestionCategoryRef } from './types';
export { multipleChoiceDescriptor, trueFalseDescriptor, multipleSelectDescriptor, essayDescriptor, shortAnswerDescriptor, orderingDescriptor, matchingDescriptor, fillInTheBlankDescriptor };
