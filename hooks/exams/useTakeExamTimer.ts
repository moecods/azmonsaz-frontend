"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExamTakeTimingDescriptor } from "@/lib/exam-take-timing";

interface UseTakeExamTimerOptions {
  timing: ExamTakeTimingDescriptor;
  onExpire?: () => void;
  enabled?: boolean;
}

/**
 * Local countdown synced from server `remaining_seconds`; ticks once per second.
 */
export function useTakeExamTimer({
  timing,
  onExpire,
  enabled = true,
}: UseTakeExamTimerOptions) {
  const [seconds, setSeconds] = useState<number | null>(
    timing.visible && timing.remaining_seconds != null
      ? timing.remaining_seconds
      : null
  );
  const onExpireRef = useRef(onExpire);
  const expiredRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    expiredRef.current = false;
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
