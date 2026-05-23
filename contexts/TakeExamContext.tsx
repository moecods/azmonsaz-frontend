"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface TakeExamQuestion {
  id: number;
  payload: Record<string, unknown>;
}

interface TakeExamContextValue {
  examId: number | null;
  questions: TakeExamQuestion[];
  answers: Record<number, unknown>;
  currentIndex: number;
  currentQuestion: TakeExamQuestion | null;
  setQuestions: (q: TakeExamQuestion[]) => void;
  setAnswer: (questionId: number, value: unknown) => void;
  setAnswersMap: (map: Record<number, unknown>) => void;
  goToIndex: (index: number) => void;
  goNext: () => void;
  goPrevious: () => void;
}

const TakeExamContext = createContext<TakeExamContextValue | null>(null);

export function TakeExamProvider({
  examId,
  children,
}: {
  examId: number | null;
  children: ReactNode;
}) {
  const [questions, setQuestions] = useState<TakeExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  const setAnswer = useCallback((questionId: number, value: unknown) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const setAnswersMap = useCallback((map: Record<number, unknown>) => {
    setAnswers(map);
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      if (questions.length === 0) return;
      setCurrentIndex(Math.max(0, Math.min(index, questions.length - 1)));
    },
    [questions.length]
  );

  const goNext = useCallback(() => goToIndex(currentIndex + 1), [currentIndex, goToIndex]);
  const goPrevious = useCallback(() => goToIndex(currentIndex - 1), [currentIndex, goToIndex]);

  const currentQuestion = questions[currentIndex] ?? null;

  const value = useMemo(
    () => ({
      examId,
      questions,
      answers,
      currentIndex,
      currentQuestion,
      setQuestions,
      setAnswer,
      setAnswersMap,
      goToIndex,
      goNext,
      goPrevious,
    }),
    [
      examId,
      questions,
      answers,
      currentIndex,
      currentQuestion,
      setAnswer,
      setAnswersMap,
      goToIndex,
      goNext,
      goPrevious,
    ]
  );

  return <TakeExamContext.Provider value={value}>{children}</TakeExamContext.Provider>;
}

export function useTakeExamContext() {
  const ctx = useContext(TakeExamContext);
  if (!ctx) {
    throw new Error("useTakeExamContext must be used within TakeExamProvider");
  }
  return ctx;
}

/** Optional hook for components that may render outside provider */
export function useTakeExamContextOptional() {
  return useContext(TakeExamContext);
}
