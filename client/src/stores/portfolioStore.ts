import { create } from 'zustand';
import api from '../lib/api';
import type { Portfolio, Trade } from '../types';

// ── Demo data for static deployments (no backend) ──────
const DEMO_PORTFOLIO: Portfolio = {
  balance: 87_432.50,
  totalValue: 124_890.75,
  totalPnl: 24_890.75,
  totalPnlPercent: 24.89,
  dailyPnl: 1_245.30,
  holdings: [
    { symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, avgPrice: 185.20, currentPrice: 198.45, value: 9_922.50, pnl: 662.50, pnlPercent: 7.15 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: 100, avgPrice: 118.50, currentPrice: 135.40, value: 13_540.00, pnl: 1_690.00, pnlPercent: 14.26 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 20, avgPrice: 420.00, currentPrice: 442.58, value: 8_851.60, pnl: 451.60, pnlPercent: 5.37 },
    { symbol: 'BTC', name: 'Bitcoin', quantity: 0.05, avgPrice: 64_000.00, currentPrice: 71_245.00, value: 3_562.25, pnl: 362.25, pnlPercent: 11.32 },
    { symbol: 'ETH', name: 'Ethereum', quantity: 0.5, avgPrice: 3_500.00, currentPrice: 3_892.45, value: 1_946.23, pnl: 196.23, pnlPercent: 11.21 },
  ],
};

const DEMO_TRADES: Trade[] = [
  { id: 't1', symbol: 'NVDA', type: 'buy', quantity: 50, price: 118.50, total: 5_925.00, fee: 5.93, timestamp: Date.now() - 86_400_000 * 5, pnl: 845.00 },
  { id: 't2', symbol: 'AAPL', type: 'buy', quantity: 25, price: 185.20, total: 4_630.00, fee: 4.63, timestamp: Date.now() - 86_400_000 * 4, pnl: 331.25 },
  { id: 't3', symbol: 'MSFT', type: 'buy', quantity: 20, price: 420.00, total: 8_400.00, fee: 8.40, timestamp: Date.now() - 86_400_000 * 3, pnl: 451.60 },
  { id: 't4', symbol: 'NVDA', type: 'buy', quantity: 50, price: 118.50, total: 5_925.00, fee: 5.93, timestamp: Date.now() - 86_400_000 * 2, pnl: 845.00 },
  { id: 't5', symbol: 'AAPL', type: 'buy', quantity: 25, price: 185.20, total: 4_630.00, fee: 4.63, timestamp: Date.now() - 86_400_000 * 1, pnl: 331.25 },
  { id: 't6', symbol: 'BTC', type: 'buy', quantity: 0.05, price: 64_000.00, total: 3_200.00, fee: 3.20, timestamp: Date.now() - 43_200_000, pnl: 362.25 },
];

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
    } catch {
      // Fallback to demo data
      set({ portfolio: DEMO_PORTFOLIO, isLoading: false, error: null });
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
      set((state) => ({
        trades: [data.trade, ...state.trades],
        isLoading: false,
      }));

      return data.trade;
    } catch {
      // Demo trade
      const demoTrade: Trade = {
        id: `demo-${Date.now()}`,
        symbol,
        type,
        quantity,
        price: 100,
        total: quantity * 100,
        fee: quantity * 0.01,
        timestamp: Date.now(),
      };
      set((state) => ({
        trades: [demoTrade, ...state.trades],
        isLoading: false,
        error: null,
      }));
      return demoTrade;
    }
  },

  fetchTradeHistory: async () => {
    try {
      const { data } = await api.get<{ trades: Trade[] }>('/portfolio/history');
      set({ trades: data.trades });
    } catch {
      // Fallback to demo trades
      set({ trades: DEMO_TRADES });
    }
  },
}));
