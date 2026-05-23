import type { FieldErrors, FieldValues, UseFormSetFocus } from "react-hook-form";

/** Collect all error messages from nested react-hook-form / Zod errors. */
export function flattenFormErrors(errors: Record<string, unknown>): string[] {
  const messages: string[] = [];
  const visit = (obj: Record<string, unknown>) => {
    for (const value of Object.values(obj)) {
      if (
        value &&
        typeof value === "object" &&
        "message" in value &&
        typeof (value as { message: unknown }).message === "string"
      ) {
        messages.push((value as { message: string }).message);
      } else if (value && typeof value === "object" && !Array.isArray(value)) {
        visit(value as Record<string, unknown>);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item && typeof item === "object") visit(item as Record<string, unknown>);
        });
      }
    }
  };
  visit(errors);
  return messages;
}

/** First leaf field path for focus / scroll (e.g. `items.0.text`). */
export function getFirstErrorPath(
  errors: Record<string, unknown>,
  prefix = ""
): string | null {
  for (const [key, value] of Object.entries(errors)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (
      value &&
      typeof value === "object" &&
      "message" in value &&
      typeof (value as { message: unknown }).message === "string"
    ) {
      return path;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      const nested = getFirstErrorPath(value as Record<string, unknown>, path);
      if (nested) return nested;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        if (item && typeof item === "object") {
          const nested = getFirstErrorPath(item as Record<string, unknown>, `${path}.${i}`);
          if (nested) return nested;
        }
      }
    }
  }
  return null;
}

export function fieldPathToElementId(path: string): string {
  return `field-${path.replace(/\./g, "-")}`;
}

/** Scroll to field and focus via RHF setFocus when possible. */
export function focusFirstFormError<T extends FieldValues>(
  errors: FieldErrors<T>,
  setFocus: UseFormSetFocus<T>
): void {
  const path = getFirstErrorPath(errors as Record<string, unknown>);
  if (!path) return;

  try {
    setFocus(path as Parameters<UseFormSetFocus<T>>[0]);
  } catch {
    /* field may not be registered */
  }

  requestAnimationFrame(() => {
    const el =
      document.getElementById(fieldPathToElementId(path)) ??
      document.querySelector(`[name="${path}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}
