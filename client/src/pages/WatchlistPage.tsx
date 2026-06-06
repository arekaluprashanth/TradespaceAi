import { useEffect, useState } from 'react';
import api from '../lib/api';
import { useMarketData } from '../hooks/useMarketData';
import { useMarketStore } from '../stores/marketStore';
import { formatCurrency } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Plus, Trash2, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WatchlistPage() {
  const { isConnected } = useMarketData();
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbolInput, setSymbolInput] = useState('');
  const [loading, setLoading] = useState(false);
  const quotes = useMarketStore((state) => state.quotes);

  const loadWatchlist = async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ watchlist: { symbols: string[] } }>('/watchlist');
      setSymbols(data.watchlist?.symbols || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWatchlist();
  }, []);

  const handleAdd = async () => {
    if (!symbolInput.trim()) {
      toast.error('Enter a symbol to add');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{ watchlist: { symbols: string[] } }>('/watchlist', {
        symbol: symbolInput.trim().toUpperCase(),
      });
      setSymbols(data.watchlist.symbols);
      setSymbolInput('');
      toast.success('Symbol added');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to add symbol');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (symbol: string) => {
    setLoading(true);
    try {
      const { data } = await api.delete<{ watchlist: { symbols: string[] } }>(`/watchlist/${symbol}`);
      setSymbols(data.watchlist.symbols);
      toast.success('Removed from watchlist');
    } catch (err: any) {
      toast.error(err?.message || 'Unable to remove symbol');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-dark-400 uppercase tracking-[0.18em]">Watchlist</p>
            <h1 className="text-3xl font-semibold text-white">Track favorite assets</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-dark-400">Market feed: {isConnected ? 'Live' : 'Disconnected'}</p>
            <Button variant="secondary" onClick={loadWatchlist} icon={<RefreshCcw size={16} />}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.65fr_0.35fr]">
        <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-dark-400">Add symbol</p>
              <p className="text-lg font-semibold text-white">Keep an eye on key movers.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                type="text"
                placeholder="AAPL"
                value={symbolInput}
                onChange={(e) => setSymbolInput(e.target.value)}
              />
              <Button onClick={handleAdd} loading={loading} icon={<Plus size={16} />}>
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-6">
          <p className="text-sm text-dark-400">Portfolio watch</p>
          <p className="mt-2 text-sm text-dark-300">Your watchlist updates with current market prices.</p>
        </div>
      </div>

      <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Symbols</h2>
          <span className="text-xs uppercase tracking-[0.18em] text-dark-400">{symbols.length} assets</span>
        </div>

        {symbols.length === 0 ? (
          <div className="rounded-3xl bg-dark-900/80 border border-white/5 p-8 text-center text-dark-400">
            No symbols added yet. Use the form above to add one.
          </div>
        ) : (
          <div className="grid gap-3">
            {symbols.map((symbol) => {
              const quote = quotes[symbol];
              const value = quote ? formatCurrency(quote.price) : 'Loading...';
              const changeClass = quote?.change >= 0 ? 'text-accent-green' : 'text-accent-red';

              return (
                <div key={symbol} className="flex flex-col gap-3 rounded-3xl bg-dark-900/80 border border-white/5 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-dark-400">{symbol}</p>
                    <p className="mt-1 text-xl font-semibold text-white">{value}</p>
                    {quote && (
                      <p className={`text-xs font-medium ${changeClass}`}>
                        {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" onClick={() => handleRemove(symbol)}>
                    <Trash2 size={16} />
                    Remove
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
