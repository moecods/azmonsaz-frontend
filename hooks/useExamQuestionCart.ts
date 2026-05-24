"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

function storageKey(examId: number) {
  return `exam_question_cart_${examId}`;
}

function readIds(examId: number): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(storageKey(examId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number" && id > 0);
  } catch {
    return [];
  }
}

function writeIds(examId: number, ids: number[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(storageKey(examId), JSON.stringify(ids));
}

export function useExamQuestionCart(examId: number | null) {
  const [ids, setIds] = useState<number[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!examId) {
      setIds([]);
      setHydrated(true);
      return;
    }
    setIds(readIds(examId));
    setHydrated(true);
  }, [examId]);

  const persist = useCallback(
    (updater: (prev: number[]) => number[]) => {
      setIds((prev) => {
        const next = updater(prev);
        if (examId) writeIds(examId, next);
        return next;
      });
    },
    [examId]
  );

  const add = useCallback(
    (questionId: number) => {
      persist((prev) => [...new Set([...prev, questionId])]);
    },
    [persist]
  );

  const remove = useCallback(
    (questionId: number) => {
      persist((prev) => prev.filter((id) => id !== questionId));
    },
    [persist]
  );

  const toggle = useCallback(
    (questionId: number) => {
      persist((prev) =>
        prev.includes(questionId)
          ? prev.filter((id) => id !== questionId)
          : [...prev, questionId]
      );
    },
    [persist]
  );

  const clear = useCallback(() => {
    persist(() => []);
  }, [persist]);

  const has = useCallback((questionId: number) => ids.includes(questionId), [ids]);

  const removeMany = useCallback(
    (questionIds: number[]) => {
      const drop = new Set(questionIds);
      persist((prev) => prev.filter((id) => !drop.has(id)));
    },
    [persist]
  );

  const count = ids.length;

  const idSet = useMemo(() => new Set(ids), [ids]);

  return {
    ids,
    idSet,
    count,
    hydrated,
    add,
    remove,
    toggle,
    clear,
    has,
    removeMany,
  };
}
