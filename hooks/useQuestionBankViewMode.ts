"use client";

import { useCallback, useEffect, useState } from "react";
import {
  EXAM_QUESTIONS_VIEW_STORAGE_KEY,
  QUESTION_BANK_VIEW_STORAGE_KEY,
  loadQuestionBankViewMode,
  saveQuestionBankViewMode,
  type QuestionBankViewMode,
} from "@/lib/question-bank-view";

export interface UseQuestionBankViewModeOptions {
  storageKey?: string;
  defaultMode?: QuestionBankViewMode;
}

export function useQuestionBankViewMode(options?: UseQuestionBankViewModeOptions) {
  const storageKey = options?.storageKey ?? QUESTION_BANK_VIEW_STORAGE_KEY;
  const defaultMode = options?.defaultMode ?? "bank";

  const [viewMode, setViewMode] = useState<QuestionBankViewMode>(defaultMode);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setViewMode(loadQuestionBankViewMode(storageKey, defaultMode));
    setHydrated(true);
  }, [storageKey, defaultMode]);

  const setBankViewMode = useCallback(
    (mode: QuestionBankViewMode) => {
      setViewMode(mode);
      saveQuestionBankViewMode(mode, storageKey);
    },
    [storageKey]
  );

  return { viewMode, setViewMode: setBankViewMode, hydrated };
}

/** Exam questions list: separate preference, default = student preview. */
export function useExamQuestionsViewMode() {
  return useQuestionBankViewMode({
    storageKey: EXAM_QUESTIONS_VIEW_STORAGE_KEY,
    defaultMode: "student",
  });
}
