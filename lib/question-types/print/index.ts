export type { PrintQuestionVariant, StudentPrintContext, QuestionPrintStrategy } from "./types";

export {
  formatTeacherKeyAnswer,
  formatTeacherKeyForQuestion,
  getTeacherKeyFormatter,
  getPrintStrategyMeta,
  getSupportedPrintKinds,
} from "./registry";

/** Resolve stable numeric id for shuffle seeds in student print. */
export function resolvePrintQuestionId(
  source: Record<string, unknown>,
  fallback: number
): number {
  const id = source.id ?? source.question_id;
  if (typeof id === "number") return id;
  if (typeof id === "string") return parseInt(id, 10) || fallback;
  return fallback;
}
