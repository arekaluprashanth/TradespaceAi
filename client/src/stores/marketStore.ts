import { create } from 'zustand';
import api from '../lib/api';
import type { Asset, Candle, ChartType, TimeFrame } from '../types';

interface MarketState {
  assets: Asset[];
  activeSymbol: string;
  candles: Record<string, Candle[]>;
  quotes: Record<string, Asset>;
  chartType: ChartType;
  timeFrame: TimeFrame;
  activeIndicators: string[];
  comparisonSymbols: string[];
  isLoading: boolean;
}

interface MarketActions {
  setActiveSymbol: (symbol: string) => void;
  fetchAssets: () => Promise<void>;
  fetchCandles: (symbol: string, timeFrame?: TimeFrame) => Promise<void>;
  updateQuote: (symbol: string, data: Partial<Asset>) => void;
  setChartType: (type: ChartType) => void;
  setTimeFrame: (tf: TimeFrame) => void;
  toggleIndicator: (indicatorId: string) => void;
  addComparison: (symbol: string) => void;
  removeComparison: (symbol: string) => void;
}

type MarketStore = MarketState & MarketActions;

export const useMarketStore = create<MarketStore>((set, get) => ({
  // ── State ────────────────────────────────────────────
  assets: [],
  activeSymbol: 'AAPL',
  candles: {},
  quotes: {},
  chartType: 'candlestick',
  timeFrame: '1D',
  activeIndicators: [],
  comparisonSymbols: [],
  isLoading: false,

  // ── Actions ──────────────────────────────────────────

  setActiveSymbol: (symbol: string) => {
    set({ activeSymbol: symbol });
    // Auto-fetch candles for the newly selected symbol
    const { timeFrame } = get();
    get().fetchCandles(symbol, timeFrame);
  },

  fetchAssets: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get<{ assets: Asset[] }>('/market/assets');
      const assets = data.assets;

      // Build quotes map from the asset list
      const quotes: Record<string, Asset> = {};
      assets.forEach((asset) => {
        quotes[asset.symbol] = asset;
      });

      set({ assets, quotes, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      set({ isLoading: false });
    }
  },

  fetchCandles: async (symbol: string, timeFrame?: TimeFrame) => {
    const tf = timeFrame || get().timeFrame;
    try {
      const { data } = await api.get<{ candles: Candle[] }>(
        `/market/candles/${symbol}`,
        { params: { timeframe: tf } }
      );
      set((state) => ({
        candles: {
          ...state.candles,
          [symbol]: data.candles,
        },
      }));
    } catch (error) {
      console.error(`Failed to fetch candles for ${symbol}:`, error);
    }
  },

  updateQuote: (symbol: string, data: Partial<Asset>) => {
    set((state) => {
      const existing = state.quotes[symbol];
      if (!existing) return state;

      const updated = { ...existing, ...data };
      return {
        quotes: {
          ...state.quotes,
          [symbol]: updated,
        },
        // Also update the asset in the assets array
        assets: state.assets.map((a) =>
          a.symbol === symbol ? { ...a, ...data } : a
        ),
      };
    });
  },

  setChartType: (type: ChartType) => set({ chartType: type }),

  setTimeFrame: (tf: TimeFrame) => {
    set({ timeFrame: tf });
    const { activeSymbol } = get();
    get().fetchCandles(activeSymbol, tf);
  },

  toggleIndicator: (indicatorId: string) => {
    set((state) => {
      const active = state.activeIndicators.includes(indicatorId);
      return {
        activeIndicators: active
          ? state.activeIndicators.filter((id) => id !== indicatorId)
          : [...state.activeIndicators, indicatorId],
      };
    });
  },

  addComparison: (symbol: string) => {
    set((state) => {
      if (state.comparisonSymbols.includes(symbol)) return state;
      return {
        comparisonSymbols: [...state.comparisonSymbols, symbol],
      };
    });
  },

  removeComparison: (symbol: string) => {
    set((state) => ({
      comparisonSymbols: state.comparisonSymbols.filter((s) => s !== symbol),
    }));
  },
}));
