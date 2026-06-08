import { useMemo } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { usePortfolio } from '../hooks/usePortfolio';
import { useMarketStore } from '../stores/marketStore';
import PortfolioPanel from '../components/portfolio/PortfolioPanel';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import { formatCurrency } from '../lib/utils';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';

export default function DashboardPage() {
  const { isConnected, lastUpdate } = useMarketData();
  const { portfolio } = usePortfolio();
  const assets = useMarketStore((state) => state.assets);
  const quotes = useMarketStore((state) => state.quotes);

  const marketMovers = useMemo(() => {
    if (!assets?.length) return [];
    return [...assets]
      .sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent))
      .slice(0, 6);
  }, [assets]);

  const totalValue = portfolio?.totalValue ?? 0;
  const totalPnl = portfolio?.totalPnl ?? 0;
  const pnlClass = totalPnl >= 0 ? 'text-accent-green' : 'text-accent-red';

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-dark-300 uppercase tracking-[0.2em]">Welcome back</p>
              <h1 className="text-3xl font-semibold text-white">Portfolio Dashboard</h1>
            </div>
            <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-dark-400">Market feed</p>
              <p className="mt-2 text-sm text-white">
                {isConnected ? 'Connected' : 'Offline'} · Last update{' '}
                {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '—'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-5">
              <p className="text-sm text-dark-400">Portfolio Value</p>
              <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(totalValue)}</p>
            </div>
            <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-5">
              <p className="text-sm text-dark-400">Performance</p>
              <p className={`mt-3 text-3xl font-semibold ${pnlClass}`}>
                {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
              </p>
            </div>
            <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-5">
              <p className="text-sm text-dark-400">Highlights</p>
              <div className="mt-3 flex items-center gap-2 text-sm text-white">
                <Sparkles size={18} /> Paper trading sandbox ready
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-dark-400">Top movers</p>
                <h2 className="text-xl font-semibold text-white">Trending assets</h2>
              </div>
              <div className="text-xs text-dark-400">Live simulated market data</div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {marketMovers.map((asset) => {
                const isPositive = asset.changePercent >= 0;
                return (
                  <div key={asset.symbol} className="rounded-3xl bg-dark-900/80 border border-white/10 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-dark-400">{asset.name}</p>
                        <p className="text-lg font-semibold text-white">{asset.symbol}</p>
                      </div>
                      <div className={`rounded-2xl px-3 py-1 text-xs font-semibold ${isPositive ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                        {isPositive ? '+' : ''}{asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <p className="mt-4 text-2xl font-mono text-white">{formatCurrency(asset.price)}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <PortfolioPanel />
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  );
}
