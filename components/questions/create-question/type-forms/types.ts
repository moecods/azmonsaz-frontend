import type { Control, FieldErrors } from 'react-hook-form';
import type { UseFieldArrayReturn } from 'react-hook-form';
import type { QuestionFormData } from '@/lib/validation';

export interface TypeFormProps {
  control: Control<QuestionFormData>;
  errors: FieldErrors<QuestionFormData>;
  setValue: (name: string, value: unknown) => void;
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
}
