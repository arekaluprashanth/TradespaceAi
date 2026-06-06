import { create } from 'zustand';
import api from '../lib/api';
import type { User, AuthResponse, ApiResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set) => ({
  // ── State ────────────────────────────────────────────
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ── Actions ──────────────────────────────────────────

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>(
        '/auth/login',
        { email, password }
      );

      const { user, token } = data;
      localStorage.setItem('tradesphere_token', token);
      localStorage.setItem('tradesphere_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Login failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  signup: async (name: string, email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<AuthResponse>(
        '/auth/register',
        { name, email, password }
      );

      const { user, token } = data;
      localStorage.setItem('tradesphere_token', token);
      localStorage.setItem('tradesphere_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Signup failed';
      set({ isLoading: false, error: message });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('tradesphere_token');
    localStorage.removeItem('tradesphere_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('tradesphere_token');
    const userJson = localStorage.getItem('tradesphere_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        set({ user, token, isAuthenticated: true });
      } catch {
        // Corrupted data — clean up
        localStorage.removeItem('tradesphere_token');
        localStorage.removeItem('tradesphere_user');
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
