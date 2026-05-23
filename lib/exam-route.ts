/**
 * Exam URLs may use public_uuid (registration link) or numeric id (internal navigation).
 */
export function parseExamRouteRef(ref: string | null | undefined): {
  numericId: number | null;
  publicUuid: string | null;
} {
  if (!ref?.trim()) {
    return { numericId: null, publicUuid: null };
  }
  const trimmed = ref.trim();
  if (/^\d+$/.test(trimmed)) {
    return { numericId: parseInt(trimmed, 10), publicUuid: null };
  }
  return { numericId: null, publicUuid: trimmed };
}

export function isNumericExamRouteRef(ref: string | null | undefined): boolean {
  return !!ref && /^\d+$/.test(ref.trim());
}
