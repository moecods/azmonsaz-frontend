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
  exams: ['exams'] as const,
  exam: (id: number) => ['exams', id] as const,
  
  // Question queries
  questions: (params?: Record<string, unknown>) => ['questions', params] as const,
  question: (id: number) => ['questions', id] as const,
  
  // Category queries
  categories: ['categories'] as const,
  category: (id: number) => ['categories', id] as const,
  
  // Partner queries
  partners: ['partners'] as const,
  partner: (id: number) => ['partners', id] as const,
  
  // User queries
  users: ['users'] as const,
  user: (id: number) => ['users', id] as const,
} as const;
