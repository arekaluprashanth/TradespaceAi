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
  resetPassword: (email: string, newPassword: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
}

type AuthStore = AuthState & AuthActions;

// ── Demo user for offline / static deployments ──────────
const DEMO_TOKEN_PREFIX = 'demo-token-';

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
      localStorage.setItem('tradeoxx_token', token);
      localStorage.setItem('tradeoxx_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isDemo: false,
        error: null,
      });
    } catch {
      // Backend unreachable — simulate Local Database for static site
      const dbStr = localStorage.getItem('tradeoxx_users_db');
      const usersDb = dbStr ? JSON.parse(dbStr) : [];
      
      // Ensure default demo user exists for easy testing
      if (!usersDb.some((u: any) => u.email === 'demo@example.com')) {
        usersDb.push({ id: 'demo-1', name: 'Demo User', email: 'demo@example.com', password: 'password' });
        localStorage.setItem('tradeoxx_users_db', JSON.stringify(usersDb));
      }
      
      // Simply check if the email exists, ignoring the password entirely for a frictionless demo
      const existingUser = usersDb.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (existingUser) {
        // Success - log them in regardless of what password they typed
        const token = DEMO_TOKEN_PREFIX + existingUser.id;
        const user: User = { id: existingUser.id, name: existingUser.name, email: existingUser.email };
        
        localStorage.setItem('tradeoxx_token', token);
        localStorage.setItem('tradeoxx_user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isDemo: true,
          error: null,
        });
      } else {
        // Auto-register the user if the email doesn't exist in the local DB
        const newUser = {
          id: `demo-${Date.now()}`,
          name: email.split('@')[0],
          email,
          password,
        };
        usersDb.push(newUser);
        localStorage.setItem('tradeoxx_users_db', JSON.stringify(usersDb));

        const token = DEMO_TOKEN_PREFIX + newUser.id;
        const user: User = { id: newUser.id, name: newUser.name, email: newUser.email };
        
        localStorage.setItem('tradeoxx_token', token);
        localStorage.setItem('tradeoxx_user', JSON.stringify(user));

        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
          isDemo: true,
          error: null,
        });
      }
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
      localStorage.setItem('tradeoxx_token', token);
      localStorage.setItem('tradeoxx_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isDemo: false,
        error: null,
      });
    } catch {
      // Backend unreachable — simulate Local Database for static site
      const dbStr = localStorage.getItem('tradeoxx_users_db');
      const usersDb = dbStr ? JSON.parse(dbStr) : [];
      
      // Ensure default demo user exists for easy testing
      if (!usersDb.some((u: any) => u.email === 'demo@example.com')) {
        usersDb.push({ id: 'demo-1', name: 'Demo User', email: 'demo@example.com', password: 'password' });
        localStorage.setItem('tradeoxx_users_db', JSON.stringify(usersDb));
      }
      
      const existingEmail = usersDb.find((u: any) => u.email === email);
      if (existingEmail) {
        set({ isLoading: false, error: 'Email already registered' });
        throw new Error('Email exists');
      }

      // Create new user in local DB
      const newUser = {
        id: `demo-${Date.now()}`,
        name,
        email,
        password, // stored locally for demo purposes
      };
      usersDb.push(newUser);
      localStorage.setItem('tradeoxx_users_db', JSON.stringify(usersDb));

      // Log them in
      const token = DEMO_TOKEN_PREFIX + newUser.id;
      const user: User = { id: newUser.id, name: newUser.name, email: newUser.email };

      localStorage.setItem('tradeoxx_token', token);
      localStorage.setItem('tradeoxx_user', JSON.stringify(user));

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        isDemo: true,
        error: null,
      });
    }
  },

  resetPassword: async (email: string, newPassword: string) => {
    set({ isLoading: true, error: null });
    try {
      // If we had a real backend, we'd call api.post('/auth/reset-password', { email, newPassword }) here
      throw new Error('Fallback to local DB');
    } catch {
      const dbStr = localStorage.getItem('tradeoxx_users_db');
      const usersDb = dbStr ? JSON.parse(dbStr) : [];
      
      const userIndex = usersDb.findIndex((u: any) => u.email === email);
      if (userIndex !== -1) {
        usersDb[userIndex].password = newPassword;
        localStorage.setItem('tradeoxx_users_db', JSON.stringify(usersDb));
        set({ isLoading: false, error: null });
      } else {
        // Just fail silently for security, or throw if we strictly want to notify
        set({ isLoading: false });
      }
    }
  },

  logout: () => {
    localStorage.removeItem('tradeoxx_token');
    localStorage.removeItem('tradeoxx_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isDemo: false,
      error: null,
    });
  },

  checkAuth: () => {
    const token = localStorage.getItem('tradeoxx_token');
    const userJson = localStorage.getItem('tradeoxx_user');

    if (token && userJson) {
      try {
        const user = JSON.parse(userJson) as User;
        set({
          user,
          token,
          isAuthenticated: true,
          isDemo: token.startsWith(DEMO_TOKEN_PREFIX),
        });
      } catch {
        // Corrupted data — clean up
        localStorage.removeItem('tradeoxx_token');
        localStorage.removeItem('tradeoxx_user');
        set({ user: null, token: null, isAuthenticated: false, isDemo: false });
      }
    }
  },

  clearError: () => set({ error: null }),
}));
