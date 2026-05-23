import type { FieldErrors } from "react-hook-form";

export function getNestedErrorMessage(
  errors: FieldErrors<Record<string, unknown>>,
  path: string
): string | undefined {
  const parts = path.split(".");
  let current: unknown = errors;
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined;
    if (/^\d+$/.test(part)) {
      current = (current as Record<string, unknown>)[Number(part)];
    } else {
      current = (current as Record<string, unknown>)[part];
    }
  }
  if (
    current &&
    typeof current === "object" &&
    "message" in current &&
    typeof (current as { message: unknown }).message === "string"
  ) {
    return (current as { message: string }).message;
  }
  return undefined;
}

export function getArrayFieldError(
  errors: FieldErrors<Record<string, unknown>>,
  key: string
): string | undefined {
  const block = errors[key as keyof typeof errors];
  if (
    block &&
    typeof block === "object" &&
    "message" in block &&
    typeof (block as { message: unknown }).message === "string"
  ) {
    return (block as { message: string }).message;
  }
  return undefined;
}
