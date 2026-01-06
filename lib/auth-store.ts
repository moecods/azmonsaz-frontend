// Auth store using simple state management
// This can be replaced with Zustand or React Context if preferred

import { AuthUser, LoginCredentials } from '@/types';
import { apiClient } from './api';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

class AuthStore {
  private state: AuthState = {
    user: null,
    token: null,
    isLoading: true, // Start with loading to prevent hydration mismatch
    isAuthenticated: false,
  };

  private listeners: Set<() => void> = new Set();
  private initialized = false;

  constructor() {
    // Don't initialize on server-side
    if (typeof window !== 'undefined') {
      this.initialize();
    }
  }

  private initialize(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Load token from localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      this.state.token = token;
      apiClient.setToken(token);
      // Try to fetch user info
      this.loadUser();
    } else {
      this.state.isLoading = false;
      this.notify();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(listener => listener());
  }

  getState(): AuthState {
    return { ...this.state };
  }

  async login(credentials: LoginCredentials): Promise<void> {
    this.state.isLoading = true;
    this.notify();

    try {
      const response = await apiClient.login(credentials);
      
      if (response.success && response.data) {
        this.state.user = response.data.user;
        this.state.token = response.data.token;
        this.state.isAuthenticated = true;
        apiClient.setToken(response.data.token);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      this.state.isLoading = false;
      this.notify();
      throw error;
    }

    this.state.isLoading = false;
    this.notify();
  }

  async logout(): Promise<void> {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.state.user = null;
      this.state.token = null;
      this.state.isAuthenticated = false;
      apiClient.setToken(null);
      this.notify();
    }
  }

  async loadUser(): Promise<void> {
    if (!this.state.token) {
      return;
    }

    this.state.isLoading = true;
    this.notify();

    try {
      const response = await apiClient.getMe();
      if (response.success && response.data) {
        this.state.user = response.data;
        this.state.isAuthenticated = true;
      } else {
        // Token might be invalid
        this.logout();
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      this.logout();
    } finally {
      this.state.isLoading = false;
      this.notify();
    }
  }

  setUser(user: AuthUser | null): void {
    this.state.user = user;
    this.state.isAuthenticated = !!user;
    this.notify();
  }
}

export const authStore = new AuthStore();

