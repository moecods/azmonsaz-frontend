"use client";

import { useState, useEffect } from 'react';
import { authStore } from '@/lib/auth-store';
import { AuthUser } from '@/types';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(() => {
    // Initialize with loading state to prevent hydration mismatch
    return {
      user: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,
    };
  });

  useEffect(() => {
    // Initialize auth store on client-side only
    if (typeof window !== 'undefined') {
      // Get initial state after mount
      setState(authStore.getState());
      
      const unsubscribe = authStore.subscribe(() => {
        setState(authStore.getState());
      });

      // Load user on mount if token exists
      const currentState = authStore.getState();
      if (currentState.token && !currentState.user) {
        authStore.loadUser();
      }

      return unsubscribe;
    }
  }, []);

  return {
    ...state,
    login: authStore.login.bind(authStore),
    logout: authStore.logout.bind(authStore),
  };
}

