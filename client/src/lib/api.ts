import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const defaultApiUrl = '/api';
const host = window.location.hostname;
const port = window.location.port;
const viteEnv = (import.meta as any).env as { VITE_API_URL?: string };
const baseURL =
  viteEnv.VITE_API_URL ||
  ((host === 'localhost' || host === '127.0.0.1') && port && port !== '3001'
    ? 'http://localhost:3001/api'
    : defaultApiUrl);

const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request Interceptor: Attach auth token ─────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('tradesphere_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ── Response Interceptor: Handle errors ────────────────
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string }>) => {
    if (error.response) {
      const { status, data } = error.response;

      // Unauthorized — clear token and redirect to login
      if (status === 401) {
        localStorage.removeItem('tradesphere_token');
        localStorage.removeItem('tradesphere_user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }

      // Surface readable error message
      const message =
        data?.message || error.message || 'An unexpected error occurred';
      return Promise.reject(new Error(message));
    }

    if (error.request) {
      return Promise.reject(
        new Error('Network error — please check your connection')
      );
    }

    return Promise.reject(error);
  }
);

export default api;
