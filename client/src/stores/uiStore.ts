import { create } from 'zustand';
import type { Notification } from '../types';

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeTab: string;
  notifications: Notification[];
  searchQuery: string;
}

interface UiActions {
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  setSearchQuery: (query: string) => void;
}

type UiStore = UiState & UiActions;

let notificationCounter = 0;

export const useUiStore = create<UiStore>((set) => ({
  // ── State ────────────────────────────────────────────
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeTab: 'dashboard',
  notifications: [],
  searchQuery: '',

  // ── Actions ──────────────────────────────────────────

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarCollapsed: (collapsed: boolean) =>
    set({ sidebarCollapsed: collapsed }),

  setActiveTab: (tab: string) =>
    set({ activeTab: tab }),

  addNotification: (notification) => {
    const id = `notif-${Date.now()}-${++notificationCounter}`;
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: Date.now(),
      read: false,
    };
    set((state) => ({
      notifications: [newNotification, ...state.notifications].slice(0, 50),
    }));
  },

  markRead: (id: string) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearNotifications: () => set({ notifications: [] }),

  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
