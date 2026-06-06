import { create } from 'zustand';
import api from '../lib/api';
import type { Portfolio, Trade } from '../types';

interface PortfolioState {
  portfolio: Portfolio | null;
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
}

interface PortfolioActions {
  fetchPortfolio: () => Promise<void>;
  executeTrade: (
    symbol: string,
    type: 'buy' | 'sell',
    quantity: number
  ) => Promise<Trade>;
  fetchTradeHistory: () => Promise<void>;
}

type PortfolioStore = PortfolioState & PortfolioActions;

export const usePortfolioStore = create<PortfolioStore>((set, get) => ({
  // ── State ────────────────────────────────────────────
  portfolio: null,
  trades: [],
  isLoading: false,
  error: null,

  // ── Actions ──────────────────────────────────────────

  fetchPortfolio: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<{ portfolio: Portfolio }>('/portfolio');
      set({ portfolio: data.portfolio, isLoading: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch portfolio';
      console.error('Portfolio fetch error:', message);
      set({ isLoading: false, error: message });
    }
  },

  executeTrade: async (
    symbol: string,
    type: 'buy' | 'sell',
    quantity: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<{ trade: Trade; balance: number }>(
        '/portfolio/trade',
        { symbol, type, quantity }
      );

      await get().fetchPortfolio();
      await get().fetchPortfolio();
      set((state) => ({
        trades: [data.trade, ...state.trades],
        isLoading: false,
      }));

      return data.trade;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Trade execution failed';
      set({ isLoading: false, error: message });
      throw error;
    }
  },

  fetchTradeHistory: async () => {
    try {
      const { data } = await api.get<{ trades: Trade[] }>('/portfolio/history');
      set({ trades: data.trades });
    } catch (error) {
      console.error('Failed to fetch trade history:', error);
    }
  },
}));
