/** Deterministic Fisher–Yates shuffle for stable print ordering per question. */
export function deterministicShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let s = Math.abs(seed) || 1;
  for (let i = result.length - 1; i > 0; i -= 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function shuffleIndices(length: number, seed: number): number[] {
  return deterministicShuffle(
    Array.from({ length }, (_, i) => i),
    seed
  );
}
