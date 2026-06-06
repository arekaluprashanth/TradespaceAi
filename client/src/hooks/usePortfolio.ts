import { useEffect, useRef, useCallback } from 'react';
import { usePortfolioStore } from '../stores/portfolioStore';
import type { Portfolio, Trade } from '../types';

interface UsePortfolioReturn {
  portfolio: Portfolio | null;
  trades: Trade[];
  isLoading: boolean;
  error: string | null;
  executeTrade: (
    symbol: string,
    type: 'buy' | 'sell',
    quantity: number
  ) => Promise<Trade>;
  refresh: () => void;
}

export function usePortfolio(): UsePortfolioReturn {
  const portfolio = usePortfolioStore((s) => s.portfolio);
  const trades = usePortfolioStore((s) => s.trades);
  const isLoading = usePortfolioStore((s) => s.isLoading);
  const error = usePortfolioStore((s) => s.error);
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);
  const fetchTradeHistory = usePortfolioStore((s) => s.fetchTradeHistory);
  const executeTradeAction = usePortfolioStore((s) => s.executeTrade);

  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetchPortfolio();
    fetchTradeHistory();
  }, [fetchPortfolio, fetchTradeHistory]);

  const refresh = useCallback(() => {
    fetchPortfolio();
    fetchTradeHistory();
  }, [fetchPortfolio, fetchTradeHistory]);

  return {
    portfolio,
    trades,
    isLoading,
    error,
    executeTrade: executeTradeAction,
    refresh,
  };
}
