import { optionText } from '@/lib/question-types/normalize-question';

export type StoredOption = { id: string; text: string };

export type FormOption = {
  id: string;
  text: string;
  is_correct: boolean;
};

export function generateOptionId(): string {
  return crypto.randomUUID();
}

export function newFormOption(isCorrect = false, text = ''): FormOption {
  return { id: generateOptionId(), text, is_correct: isCorrect };
}

/** API/storage payload: options with ids only (no is_correct). */
export function toStoredOptions(
  options: Array<{ id: string; text: string }>
): StoredOption[] {
  return options.map((o) => ({ id: o.id, text: o.text }));
}

/** correct_answer for API from form options (is_correct flags). */
export function correctAnswerIdsFromOptions(
  options: Array<{ id: string; is_correct?: boolean }>,
  multiple: boolean
): string | string[] {
  const ids = options.filter((o) => o.is_correct).map((o) => o.id);
  if (multiple) {
    return ids;
  }
  return ids[0] ?? options[0]?.id ?? '';
}

export function isCorrectOptionId(
  questionType: string,
  correctAnswer: unknown,
  optionId: string
): boolean {
  if (questionType === 'multiple_select' && Array.isArray(correctAnswer)) {
    return correctAnswer.includes(optionId);
  }
  if (questionType === 'multiple_choice' || questionType === 'true_false') {
    return correctAnswer === optionId;
  }
  return false;
}

/** Map API options + correct_answer ids into form rows. */
export function mapApiOptionsToForm(
  optionsRaw: unknown[],
  correctAnswer: unknown,
  qType: string
): FormOption[] {
  if (!Array.isArray(optionsRaw) || optionsRaw.length === 0) {
    if (qType === 'true_false') {
      const trueId = generateOptionId();
      const falseId = generateOptionId();
      const trueCorrect = correctAnswer === trueId;
      return [
        { id: trueId, text: 'صحیح', is_correct: trueCorrect },
        { id: falseId, text: 'غلط', is_correct: !trueCorrect },
      ];
    }
    return [newFormOption(), newFormOption()];
  }

  return optionsRaw.map((opt) => {
    const id =
      typeof opt === 'object' &&
      opt !== null &&
      'id' in opt &&
      typeof (opt as { id: unknown }).id === 'string'
        ? (opt as { id: string }).id
        : generateOptionId();
    const text = optionText(opt);
    const isCorrect = isCorrectOptionId(qType, correctAnswer, id);
    return { id, text, is_correct: isCorrect };
  });
}

/** Options for take-exam UI: { id, text }[]. */
export function normalizeTakeExamOptions(
  options: unknown[]
): StoredOption[] {
  return (options ?? []).map((opt) => {
    if (
      typeof opt === 'object' &&
      opt !== null &&
      'id' in opt &&
      typeof (opt as { id: unknown }).id === 'string'
    ) {
      return {
        id: (opt as { id: string }).id,
        text: optionText(opt),
      };
    }
    throw new Error('Question options must include stable id and text.');
  });
}

export function optionIdFromUnknown(
  opt: unknown,
  fallbackIndex: number
): string {
  if (
    typeof opt === 'object' &&
    opt !== null &&
    'id' in opt &&
    typeof (opt as { id: unknown }).id === 'string'
  ) {
    return (opt as { id: string }).id;
  }
  return `__invalid_option_${fallbackIndex}`;
}
