import { useEffect, useState, useRef } from 'react';
import { connectSocket, onSocketEvent, disconnectSocket } from '../lib/socket';
import { useMarketStore } from '../stores/marketStore';
import type { Asset } from '../types';

interface UseMarketDataReturn {
  isConnected: boolean;
  lastUpdate: number | null;
}

export function useMarketData(): UseMarketDataReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const initialized = useRef(false);

  const fetchAssets = useMarketStore((s) => s.fetchAssets);
  const fetchCandles = useMarketStore((s) => s.fetchCandles);
  const updateQuote = useMarketStore((s) => s.updateQuote);
  const activeSymbol = useMarketStore((s) => s.activeSymbol);
  const timeFrame = useMarketStore((s) => s.timeFrame);

  // ── Initialize: fetch assets + candles once ──────────
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetchAssets();
    fetchCandles(activeSymbol, timeFrame);
  }, [fetchAssets, fetchCandles, activeSymbol, timeFrame]);

  // ── Socket connection lifecycle ──────────────────────
  useEffect(() => {
    connectSocket();
    setIsConnected(true);

    const cleanup = onSocketEvent<Array<Partial<Asset> & { symbol: string }>>(
      'price-update',
      (quotes) => {
        if (Array.isArray(quotes)) {
          quotes.forEach((q) => updateQuote(q.symbol, q));
          setLastUpdate(Date.now());
        }
      }
    );

    return () => {
      cleanup();
      disconnectSocket();
    };
  }, [updateQuote]);

  return { isConnected, lastUpdate };
}
