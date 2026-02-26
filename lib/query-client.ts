// React Query client configuration

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as Error & { status: number }).status;
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// Query keys for consistent caching
export const queryKeys = {
  // Exam queries
  exams: (params?: Record<string, unknown>) => ['exams', params] as const,
  exam: (id: number) => ['exams', id] as const,
  
  // Question queries
  questions: (params?: Record<string, unknown>) => ['questions', params] as const,
  question: (id: number) => ['questions', id] as const,
  questionCategories: () => ['question-categories'] as const,
  
  // Category queries
  categories: ['categories'] as const,
  category: (id: number) => ['categories', id] as const,
  
  // Partner queries
  partners: (params?: Record<string, unknown>) => ['partners', params] as const,
  partner: (id: number) => ['partners', id] as const,
  
  // User queries
  users: (params?: Record<string, unknown>) => ['users', params] as const,
  user: (id: number) => ['users', id] as const,
  
  // Auth queries
  me: () => ['auth', 'me'] as const,

  // Notifications
  notifications: (params?: Record<string, unknown>) => ['notifications', params] as const,
  examNotifications: (examId: number) => ['exams', examId, 'notifications'] as const,
} as const;
