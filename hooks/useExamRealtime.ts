'use client';

import { useEffect } from 'react';
import { useRealtimeContext } from '@/providers/RealtimeProvider';

export function useExamRealtime(examId: number | null, options?: { grading?: boolean }) {
  const {
    subscribeExamChannel,
    unsubscribeExamChannel,
    subscribeExamGradingChannel,
    unsubscribeExamGradingChannel,
  } = useRealtimeContext();

  useEffect(() => {
    if (!examId) return;

    subscribeExamChannel(examId);
    if (options?.grading) {
      subscribeExamGradingChannel(examId);
    }

    return () => {
      unsubscribeExamChannel(examId);
      if (options?.grading) {
        unsubscribeExamGradingChannel(examId);
      }
    };
  }, [
    examId,
    options?.grading,
    subscribeExamChannel,
    unsubscribeExamChannel,
    subscribeExamGradingChannel,
    unsubscribeExamGradingChannel,
  ]);
}
