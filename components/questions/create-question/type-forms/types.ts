import type { Control, FieldErrors } from 'react-hook-form';
import type { UseFieldArrayReturn } from 'react-hook-form';
import type { QuestionFormData } from '@/lib/validation';
import { UseFormSetValue } from 'react-hook-form';


export interface TypeFormProps {
  control: Control<QuestionFormData>;
  errors: FieldErrors<QuestionFormData>;
  setValue?: UseFormSetValue<QuestionFormData>;
  optionsFields: UseFieldArrayReturn<QuestionFormData, 'options'>;
  itemsFields: UseFieldArrayReturn<QuestionFormData, 'items'>;
  leftItemsFields: UseFieldArrayReturn<QuestionFormData, 'left_items'>;
  rightItemsFields: UseFieldArrayReturn<QuestionFormData, 'right_items'>;
  matchesFields: UseFieldArrayReturn<QuestionFormData, 'matches'>;
  blanksFields: UseFieldArrayReturn<QuestionFormData, 'blanks'>;
  questionOptions?: QuestionFormData['options'];
  items?: QuestionFormData['items'];
  correct_order?: number[];
  left_items?: QuestionFormData['left_items'];
  right_items?: QuestionFormData['right_items'];
  matches?: QuestionFormData['matches'];
  blanks?: QuestionFormData['blanks'];
  /** The current question type (forwarded by the registry). */
  questionType?: string;
}
