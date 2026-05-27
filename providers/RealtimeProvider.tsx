'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Toast } from '@/components/feedback/Alert/Alert';
import { connectEcho, disconnectEcho, getEcho, isRealtimeEnabled, reconnectEcho } from '@/lib/echo';
import {
  REALTIME_EVENTS,
  emitRealtimeToast,
  subscribeRealtimeToast,
  type RealtimeToastPayload,
} from '@/lib/realtime-events';
import { queryKeys } from '@/lib/query-client';
import { authService } from '@/services';
import { useMe } from '@/hooks/useAuth';

type RealtimeContextValue = {
  echoConnected: boolean;
  subscribeExamChannel: (examId: number) => void;
  unsubscribeExamChannel: (examId: number) => void;
  subscribeExamGradingChannel: (examId: number) => void;
  unsubscribeExamGradingChannel: (examId: number) => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export function useRealtimeContext(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (!context) {
    throw new Error('useRealtimeContext must be used within RealtimeProvider');
  }
  return context;
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: user } = useMe();
  const [echoConnected, setEchoConnected] = useState(false);
  const [toast, setToast] = useState<RealtimeToastPayload & { open: boolean }>({
    open: false,
    message: '',
    severity: 'info',
  });

  const examChannelRefs = useMemo(() => new Map<number, number>(), []);
  const gradingChannelRefs = useMemo(() => new Map<number, number>(), []);

  const showToast = useCallback((payload: RealtimeToastPayload) => {
    setToast({
      open: true,
      message: payload.message,
      severity: payload.severity ?? 'info',
    });
  }, []);

  useEffect(() => {
    return subscribeRealtimeToast(showToast);
  }, [showToast]);

  useEffect(() => {
    if (!isRealtimeEnabled() || !user?.id) {
      disconnectEcho();
      setEchoConnected(false);
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    if (!token) {
      disconnectEcho();
      setEchoConnected(false);
      return;
    }

    const echo = reconnectEcho(token);
    if (!echo) {
      setEchoConnected(false);
      return;
    }

    setEchoConnected(true);

    const userChannel = echo.private(`user.${user.id}`);

    userChannel.notification((notification: { title?: string; message?: string }) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      showToast({
        message: notification.message ?? notification.title ?? 'اعلان جدید',
        severity: 'info',
      });
    });

    userChannel.listen(REALTIME_EVENTS.examStatusChanged, () => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
    });

    userChannel.listen(REALTIME_EVENTS.participantStatusChanged, (payload: { status?: string; exam_id?: number }) => {
      if (payload.exam_id) {
        queryClient.invalidateQueries({ queryKey: ['exam', 'manage', payload.exam_id] });
      }
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
    });

    userChannel.listen(REALTIME_EVENTS.examResultsReleased, (payload: { exam_id?: number; title?: string }) => {
      if (payload.exam_id) {
        queryClient.invalidateQueries({ queryKey: ['exam', 'manage', payload.exam_id] });
        queryClient.invalidateQueries({ queryKey: ['exam', 'my-result', payload.exam_id] });
      }
      showToast({
        message: payload.title ? `نتیجه آزمون «${payload.title}» آماده است.` : 'نتیجه آزمون آماده است.',
        severity: 'success',
      });
    });

    userChannel.listen(REALTIME_EVENTS.participantGradingUpdated, (payload: { exam_id?: number }) => {
      if (payload.exam_id) {
        queryClient.invalidateQueries({ queryKey: ['exam', 'manage', payload.exam_id] });
        queryClient.invalidateQueries({ queryKey: ['exam', 'my-result', payload.exam_id] });
      }
    });

    userChannel.listen(REALTIME_EVENTS.groupMembershipChanged, () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    });

    userChannel.listen(
      REALTIME_EVENTS.userPermissionsChanged,
      (payload: { force_logout?: boolean }) => {
        if (payload.force_logout) {
          authService.logout().finally(() => {
            router.push('/login');
          });
          return;
        }
        queryClient.invalidateQueries({ queryKey: queryKeys.me() });
      }
    );

    userChannel.listen(REALTIME_EVENTS.teacherExamMessage, (payload: { message?: string; exam_title?: string }) => {
      showToast({
        message: payload.message ?? `اعلان جدید از معلم${payload.exam_title ? ` — ${payload.exam_title}` : ''}`,
        severity: 'warning',
      });
    });

    const onTokenChange = () => {
      const nextToken = localStorage.getItem('auth_token');
      if (!nextToken) {
        disconnectEcho();
        setEchoConnected(false);
        return;
      }
      reconnectEcho(nextToken);
      setEchoConnected(true);
    };

    window.addEventListener('auth-token-changed', onTokenChange);
    window.addEventListener('storage', onTokenChange);

    return () => {
      window.removeEventListener('auth-token-changed', onTokenChange);
      window.removeEventListener('storage', onTokenChange);
      echo.leave(`user.${user.id}`);
      disconnectEcho();
      setEchoConnected(false);
    };
  }, [user?.id, queryClient, router, showToast]);

  const subscribeExamChannel = useCallback((examId: number) => {
    const echo = getEcho();
    if (!echo) return;

    const current = examChannelRefs.get(examId) ?? 0;
    examChannelRefs.set(examId, current + 1);
    if (current > 0) return;

    const channel = echo.private(`exam.${examId}`);

    channel.listen(REALTIME_EVENTS.participantStatusChanged, () => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
    });

    channel.listen(REALTIME_EVENTS.participantListChanged, () => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
    });

    channel.listen(REALTIME_EVENTS.participantProgressChanged, () => {
      queryClient.invalidateQueries({ queryKey: ['exam', examId, 'reports'] });
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
    });

    channel.listen(REALTIME_EVENTS.examStatusChanged, () => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
      queryClient.invalidateQueries({ queryKey: ['exams', 'available'] });
    });

    channel.listen(REALTIME_EVENTS.examResultsReleased, () => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
    });
  }, [examChannelRefs, queryClient]);

  const unsubscribeExamChannel = useCallback((examId: number) => {
    const current = examChannelRefs.get(examId) ?? 0;
    if (current <= 1) {
      examChannelRefs.delete(examId);
      getEcho()?.leave(`exam.${examId}`);
      return;
    }
    examChannelRefs.set(examId, current - 1);
  }, [examChannelRefs]);

  const subscribeExamGradingChannel = useCallback((examId: number) => {
    const echo = getEcho();
    if (!echo) return;

    const current = gradingChannelRefs.get(examId) ?? 0;
    gradingChannelRefs.set(examId, current + 1);
    if (current > 0) return;

    echo.private(`exam.${examId}.grading`).listen(REALTIME_EVENTS.participantGradingUpdated, () => {
      queryClient.invalidateQueries({ queryKey: ['exam', 'manage', examId] });
    });
  }, [gradingChannelRefs, queryClient]);

  const unsubscribeExamGradingChannel = useCallback((examId: number) => {
    const current = gradingChannelRefs.get(examId) ?? 0;
    if (current <= 1) {
      gradingChannelRefs.delete(examId);
      getEcho()?.leave(`exam.${examId}.grading`);
      return;
    }
    gradingChannelRefs.set(examId, current - 1);
  }, [gradingChannelRefs]);

  const value = useMemo(
    () => ({
      echoConnected,
      subscribeExamChannel,
      unsubscribeExamChannel,
      subscribeExamGradingChannel,
      unsubscribeExamGradingChannel,
    }),
    [
      echoConnected,
      subscribeExamChannel,
      unsubscribeExamChannel,
      subscribeExamGradingChannel,
      unsubscribeExamGradingChannel,
    ]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
      <Toast
        open={toast.open}
        message={toast.message}
        severity={toast.severity}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
      />
    </RealtimeContext.Provider>
  );
}

export { emitRealtimeToast };
