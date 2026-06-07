import { create } from 'zustand';
import api from '../lib/api';
import type { User, AuthResponse } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isDemo: boolean;
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ── Demo user for offline / static deployments ──────────
const DEMO_USER: User = {
  id: 'demo-001',
  name: 'Demo Trader',
  email: 'demo@tradesphere.ai',
};
const DEMO_TOKEN = 'demo-token-tradesphere-2026';

function loginDemo(set: (state: Partial<AuthState>) => void) {
  localStorage.setItem('tradesphere_token', DEMO_TOKEN);
  localStorage.setItem('tradesphere_user', JSON.stringify(DEMO_USER));
  set({
    user: DEMO_USER,
    token: DEMO_TOKEN,
    isAuthenticated: true,
    isLoading: false,
    isDemo: true,
    error: null,
  });
}

export const useAuthStore = create<AuthStore>((set) => ({
  // ── State ────────────────────────────────────────────
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isDemo: false,

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
        isDemo: false,
        error: null,
      });
    } catch {
      // Backend unreachable — fall back to demo mode
      loginDemo(set);
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
        isDemo: false,
        error: null,
      });
    } catch {
      // Backend unreachable — fall back to demo mode
      loginDemo(set);
    }
  },

  logout: () => {
    localStorage.removeItem('tradesphere_token');
    localStorage.removeItem('tradesphere_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isDemo: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('tradesphere_token');
    const userJson = localStorage.getItem('tradesphere_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        set({
          user,
          token,
          isAuthenticated: true,
          isDemo: token === DEMO_TOKEN,
        });
      } catch {
        // Corrupted data — clean up
        localStorage.removeItem('tradesphere_token');
        localStorage.removeItem('tradesphere_user');
        set({ user: null, token: null, isAuthenticated: false, isDemo: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
