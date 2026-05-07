/**
 * Registry of type-specific form components (Strategy/Open-Closed pattern).
 * Adding a new question type = add component + register here, no changes to parent.
 */

import { Alert } from '@mui/material';
import { TrueFalseForm } from './TrueFalseForm';
import { OptionsForm } from './OptionsForm';
import { ShortAnswerForm } from './ShortAnswerForm';
import { OrderingForm } from './OrderingForm';
import { MatchingForm } from './MatchingForm';
import { FillInTheBlankForm } from './FillInTheBlankForm';
import type { TypeFormProps } from './types';

export interface TypeFormRegistryProps extends TypeFormProps {
  questionType: string;
  onAddOption?: () => void;
  onRemoveOption?: (index: number) => void;
}

export function TypeFormRenderer(props: TypeFormRegistryProps) {
  const { questionType, onAddOption, onRemoveOption, ...formProps } = props;

  switch (questionType) {
    case 'true_false':
      return <TrueFalseForm {...formProps} />;
    case 'multiple_choice':
    case 'multiple_select':
      return onAddOption && onRemoveOption ? (
        <OptionsForm
          {...formProps}
          questionType={questionType}
          onAddOption={onAddOption}
          onRemoveOption={onRemoveOption}
        />
      ) : null;
    case 'essay':
      return <Alert severity="info">سوالات تشریحی نیازی به گزینه ندارند و به صورت دستی تصحیح می‌شوند.</Alert>;
    case 'short_answer':
      return <ShortAnswerForm {...formProps} />;
    case 'ordering':
      return <OrderingForm {...formProps} />;
    case 'matching':
      return <MatchingForm {...formProps} />;
    case 'fill_in_the_blank':
      return <FillInTheBlankForm {...formProps} />;
    default:
      return null;
  }
}
