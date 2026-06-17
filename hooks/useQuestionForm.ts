/**
 * Custom hook for question form state and effects.
 * Single Responsibility: form setup, sync effects, and field array management.
 */

import { useEffect, useRef } from 'react';
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { questionSchema, QuestionFormData } from '@/lib/validation';
import { questionToFormData, payloadToFormData } from '@/lib/question-mappers';
import { generateOptionId, newFormOption } from '@/lib/option-ids';
import { OPTION_TYPE_DISPLAY_DEFAULTS } from '@/lib/question-types/display-settings';
import type { Question } from '@/types';
import type { QuestionCategory } from '@/types';

// Whitelist of question types that require options
const TYPES_WITH_OPTIONS = ['multiple_choice', 'true_false', 'multiple_select'];

const DEFAULT_VALUES: QuestionFormData = {
  text: '',
  type: 'multiple_choice',
  options: [newFormOption(), newFormOption()],
  correct_answer: '',
  category_id: 0,
  tags: [],
  difficulty: 'medium',
  items: [],
  correct_order: [],
  left_items: [],
  right_items: [],
  matches: [],
  blanks: [],
  correct_answers: [],
  manual_grading: false,
  matching_mode: 'one_to_one',
  display_settings: { ...OPTION_TYPE_DISPLAY_DEFAULTS },
  print_settings: {},
};

export interface UseQuestionFormOptions {
  questionId?: number;
  questionData?: Question | null;
  /** When editing an exam question (not bank), pass its payload to pre-fill the form */
  examQuestionPayload?: Record<string, unknown> | null;
  categories: QuestionCategory[];
  isEditMode: boolean;
}

export interface UseQuestionFormReturn {
  form: UseFormReturn<QuestionFormData>;
  optionsFields: ReturnType<typeof useFieldArray<QuestionFormData, 'options'>>;
  itemsFields: ReturnType<typeof useFieldArray<QuestionFormData, 'items'>>;
  leftItemsFields: ReturnType<typeof useFieldArray<QuestionFormData, 'left_items'>>;
  rightItemsFields: ReturnType<typeof useFieldArray<QuestionFormData, 'right_items'>>;
  matchesFields: ReturnType<typeof useFieldArray<QuestionFormData, 'matches'>>;
  blanksFields: ReturnType<typeof useFieldArray<QuestionFormData, 'blanks'>>;
}

export function useQuestionForm({
  questionId,
  questionData,
  examQuestionPayload,
  categories,
  isEditMode,
}: UseQuestionFormOptions): UseQuestionFormReturn {
  const hasSetDefaultCategory = useRef(false);
  const hasPopulatedEditForm = useRef(false);
  const hasPopulatedFromPayload = useRef(false);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { control, watch, setValue, reset, getValues } = form;

  const optionsFields = useFieldArray({ control, name: 'options' });
  const itemsFields = useFieldArray({ control, name: 'items' });
  const leftItemsFields = useFieldArray({ control, name: 'left_items' });
  const rightItemsFields = useFieldArray({ control, name: 'right_items' });
  const matchesFields = useFieldArray({ control, name: 'matches' });
  const blanksFields = useFieldArray({ control, name: 'blanks' });

  const questionType = watch('type');
  const questionOptions = watch('options');
  const left_items = watch('left_items');
  const matches = watch('matches');
  const correctAnswer = watch('correct_answer');

  // Manage options array based on question type
  useEffect(() => {
    const currentOptions = getValues('options');

    if (TYPES_WITH_OPTIONS.includes(questionType)) {
      // Ensure default options exist for types that require them
      if (!currentOptions || currentOptions.length === 0) {
        setValue('options', [newFormOption(), newFormOption()]);
        setValue('correct_answer', '');
      }
    } else {
      // Clear options for types that do not require them
      if (currentOptions && currentOptions.length > 0) {
        setValue('options', []);
      }
    }
  }, [questionType, setValue, getValues]);

  // Populate form when editing exam question from payload (exam question edit page)
  useEffect(() => {
    if (isEditMode && examQuestionPayload && !hasPopulatedFromPayload.current) {
      hasPopulatedFromPayload.current = true;
      const formData = payloadToFormData(examQuestionPayload);
      if (formData.category_id <= 0 && categories.length > 0) {
        formData.category_id = categories[0].id;
      }
      reset(formData);
    }
  }, [isEditMode, examQuestionPayload, categories, reset]);

  // Populate form when editing and question data loads (bank question edit)
  useEffect(() => {
    if (isEditMode && questionData && !hasPopulatedEditForm.current && !examQuestionPayload) {
      hasPopulatedEditForm.current = true;
      const formData = questionToFormData(questionData);
      if (formData.category_id <= 0 && categories.length > 0) {
        formData.category_id = categories[0].id;
      }
      reset(formData);
    }
  }, [isEditMode, questionData, examQuestionPayload, categories, reset]);

  // Set default category when categories load (create mode only)
  useEffect(() => {
    if (!isEditMode && categories.length > 0 && !hasSetDefaultCategory.current) {
      hasSetDefaultCategory.current = true;
      setValue('category_id', categories[0].id);
    }
  }, [isEditMode, categories, setValue]);

  // Fix category_id in edit mode if it became 0
  useEffect(() => {
    if (isEditMode && categories.length > 0 && questionData && hasPopulatedEditForm.current) {
      const current = getValues('category_id');
      if (!current || current <= 0) {
        const validId = (questionData.category_id as number) > 0 ? questionData.category_id : categories[0]?.id;
        if (validId) setValue('category_id', validId as number);
      }
    }
  }, [isEditMode, categories, questionData, setValue, getValues]);

  // When type changes to true_false, set fixed options (preserve ids when possible)
  useEffect(() => {
    if (questionType === 'true_false') {
      const opts = questionOptions ?? [];
      const trueId = opts[0]?.id ?? generateOptionId();
      const falseId = opts[1]?.id ?? generateOptionId();
      const trueCorrect = opts.find((o) => o.text === 'صحیح')?.is_correct ?? opts[0]?.is_correct ?? true;
      setValue('options', [
        { id: trueId, text: 'صحیح', is_correct: Boolean(trueCorrect) },
        { id: falseId, text: 'غلط', is_correct: !trueCorrect },
      ]);
      setValue('correct_answer', trueCorrect ? trueId : falseId);
    }
  }, [questionType, setValue]);

  // When type changes to essay, clear correct_answer
  useEffect(() => {
    if (questionType === 'essay') {
      setValue('correct_answer', null);
    }
  }, [questionType, setValue]);

  // When type changes to short_answer
  useEffect(() => {
    if (questionType === 'short_answer' && typeof correctAnswer !== 'string') {
      setValue('correct_answer', '');
    }
  }, [questionType, setValue, correctAnswer]);

  // Sync matches length with left_items for matching type
  useEffect(() => {
    if (questionType === 'matching') {
      const leftLen = left_items?.length ?? 0;
      const currentMatches = (matches ?? []) as { left_index: number; right_index: number }[];
      if (currentMatches.length < leftLen) {
        const newMatches = currentMatches.slice();
        for (let i = currentMatches.length; i < leftLen; i++) {
          newMatches.push({ left_index: i, right_index: 0 });
        }
        setValue('matches', newMatches);
      } else if (currentMatches.length > leftLen) {
        setValue('matches', currentMatches.slice(0, leftLen));
      } else {
        const fixed = currentMatches.map((m, i) => ({ ...m, left_index: i }));
        if (JSON.stringify(fixed) !== JSON.stringify(currentMatches)) {
          setValue('matches', fixed);
        }
      }
    }
  }, [questionType, left_items?.length, matches?.length, setValue]);

  return {
    form,
    optionsFields,
    itemsFields,
    leftItemsFields,
    rightItemsFields,
    matchesFields,
    blanksFields,
  };
}
