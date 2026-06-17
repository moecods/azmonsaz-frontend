export {
  QUESTION_TYPE_IDS,
  isQuestionTypeId,
  type QuestionTypeId,
} from './constants';
export {
  getQuestionTypeConfig,
  getQuestionTypeLabel,
  getQuestionTypeKind,
  isOptionsBased,
  isOptionsSingle,
  isOptionsMultiple,
  isOptionsFixed,
  isTextBased,
  isEssay,
  getAllQuestionTypeConfigs,
  getSupportedQuestionTypeIds,
  type QuestionTypeConfig,
  type QuestionTypeKind,
} from './registry';
export { getDescriptor, getDescriptorOrNull, type QuestionTypeDescriptor, type QuestionCategoryRef } from './descriptors';
export { getQuestionPlugin, plugins } from './plugins';
export type { DisplaySettings, OptionLabelStyle } from './display-settings';
export { mergeDisplaySettings, getOptionLabel, DEFAULT_DISPLAY_SETTINGS } from './display-settings';
export { normalizeQuestion, normalizeFromQuestion, optionText } from './normalize-question';
export { formatTeacherKeyAnswer, resolvePrintQuestionId } from './print';
export type { PrintQuestionVariant, StudentPrintContext } from './print/types';
export { formValuesToBankSource } from './preview-answer';
export { getQuestionTypeDefaults } from './type-defaults';
export {
  QUESTION_TYPE_PALETTE,
  getQuestionTypeMainColor,
  questionTypeBorderSx,
  questionTypeAccentSx,
} from './type-appearance';
export type { QuestionViewMode, QuestionViewOptions } from './view-options';
export { DEFAULT_VIEW_OPTIONS, mergeViewOptions } from './view-options';
export type {
  AnswerLineStyle,
  AnswerLineSpacing,
  MatchingPrintLayout,
  OrderingPrintLayout,
  QuestionPrintSettings,
  ExamPrintSettings,
} from './print-settings';
export {
  mergeQuestionPrintSettings,
  mergeExamPrintSettings,
  resolveQuestionPrintSettings,
  getDefaultQuestionPrintSettings,
  hasCustomPrintSettings,
  lineHeightPx,
} from './print-settings';
