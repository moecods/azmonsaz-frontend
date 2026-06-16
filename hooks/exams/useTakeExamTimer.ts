"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExamTakeTimingDescriptor } from "@/lib/exam-take-timing";

interface UseTakeExamTimerOptions {
  timing: ExamTakeTimingDescriptor;
  onExpire?: () => void;
  onWarning?: (secondsLeft: number) => void;
  enabled?: boolean;
}

const WARNING_THRESHOLDS = [300, 60] as const;

/**
 * Local countdown synced from server `remaining_seconds`; ticks once per second.
 */
export function useTakeExamTimer({
  timing,
  onExpire,
  onWarning,
  enabled = true,
}: UseTakeExamTimerOptions) {
  const [seconds, setSeconds] = useState<number | null>(
    timing.visible && timing.remaining_seconds != null
      ? timing.remaining_seconds
      : null
  );
  const onExpireRef = useRef(onExpire);
  const onWarningRef = useRef(onWarning);
  const expiredRef = useRef(false);
  const warnedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    onWarningRef.current = onWarning;
  }, [onWarning]);

  useEffect(() => {
    expiredRef.current = false;
    warnedRef.current = new Set();
    if (timing.visible && timing.remaining_seconds != null) {
      setSeconds(timing.remaining_seconds);
    } else {
      setSeconds(null);
    }
  }, [timing.visible, timing.remaining_seconds, timing.kind]);

  useEffect(() => {
    if (!enabled || !timing.visible) {
      return;
    }

    const id = window.setInterval(() => {
      setSeconds((prev) => {
        if (prev === null || prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(id);
  }, [enabled, timing.visible]);

  useEffect(() => {
    if (!enabled || !timing.visible || seconds === null || seconds <= 0) {
      return;
    }

    for (const threshold of WARNING_THRESHOLDS) {
      if (seconds === threshold && !warnedRef.current.has(threshold)) {
        warnedRef.current.add(threshold);
        onWarningRef.current?.(threshold);
      }
    }
  }, [seconds, timing.visible, enabled]);

  useEffect(() => {
    if (
      enabled &&
      timing.visible &&
      seconds === 0 &&
      !expiredRef.current
    ) {
      expiredRef.current = true;
      onExpireRef.current?.();
    }
  }, [seconds, timing.visible, enabled]);

  const syncFromServer = useCallback((descriptor: ExamTakeTimingDescriptor) => {
    expiredRef.current = false;
    warnedRef.current = new Set();
    if (descriptor.visible && descriptor.remaining_seconds != null) {
      setSeconds(descriptor.remaining_seconds);
    } else {
      setSeconds(null);
    }
  }, []);

  return {
    visible: timing.visible && seconds !== null,
    seconds,
    label: timing.label,
    hint: timing.hint ?? null,
    kind: timing.kind,
    syncFromServer,
  };
}
