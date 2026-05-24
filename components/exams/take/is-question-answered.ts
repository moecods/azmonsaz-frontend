/** Whether a take-exam answer value counts as answered for navigator UI. */
export function isQuestionAnswered(answer: unknown): boolean {
  if (answer === null || answer === undefined) return false;
  if (typeof answer === "string") return answer.trim().length > 0;
  if (Array.isArray(answer)) return answer.length > 0;
  if (typeof answer === "object") return Object.keys(answer as object).length > 0;
  return true;
}
