import { useEffect, useState, useRef } from 'react';
import { socket, connectSocket } from '../lib/socket';
import { useMarketStore } from '../stores/marketStore';
import type { Asset } from '../types';

interface UseMarketDataReturn {
  isConnected: boolean;
  lastUpdate: number | null;
}

export function useMarketData(): UseMarketDataReturn {
  const [isConnected, setIsConnected] = useState(socket.connected);
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

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onPriceUpdate(data: Partial<Asset> & { symbol: string }) {
      updateQuote(data.symbol, data);
      setLastUpdate(Date.now());
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('price-update', onPriceUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('price-update', onPriceUpdate);
    };
  }, [updateQuote]);

  return { isConnected, lastUpdate };
}
