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
