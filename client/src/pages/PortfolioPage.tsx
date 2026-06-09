import { useState } from 'react';
import { usePortfolio } from '../hooks/usePortfolio';
import { useMarketStore } from '../stores/marketStore';
import PortfolioPanel from '../components/portfolio/PortfolioPanel';
import TradeForm from '../components/portfolio/TradeForm';
import TradeHistory from '../components/portfolio/TradeHistory';
import { Button } from '../components/ui/Button';

export default function PortfolioPage() {
  const { portfolio, isLoading, error } = usePortfolio();
  const activeSymbol = useMarketStore((state) => state.activeSymbol);
  const [isTradeOpen, setIsTradeOpen] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-base text-dark-400 uppercase tracking-[0.18em]">Portfolio</p>
          <h1 className="text-4xl font-semibold text-white mt-1">Manage positions</h1>
        </div>
        <Button variant="primary" size="lg" onClick={() => setIsTradeOpen(true)}>
          New Trade
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <PortfolioPanel />
          <TradeHistory />
        </div>
        <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-8">
          <p className="text-base text-dark-400 uppercase tracking-[0.18em]">Quick actions</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Trade insights</h2>
          <p className="mt-4 text-base text-dark-300 leading-relaxed">
            {portfolio
              ? 'Use the trade ticket to buy or sell positions in your paper account.'
              : 'Loading portfolio data…'}
          </p>
          {error && <p className="mt-3 text-base text-accent-red">{error}</p>}
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-dark-900/80 border border-white/10 p-5">
              <p className="text-sm text-dark-400">Default asset</p>
              <p className="mt-2 text-xl font-semibold text-white">{activeSymbol}</p>
            </div>
            <div className="rounded-2xl bg-dark-900/80 border border-white/10 p-5">
              <p className="text-sm text-dark-400">Status</p>
              <p className="mt-2 text-xl font-semibold text-white">{isLoading ? 'Refreshing...' : 'Ready'}</p>
            </div>
          </div>
        </div>
      </div>

      <TradeForm
        isOpen={isTradeOpen}
        onClose={() => setIsTradeOpen(false)}
        defaultSymbol={activeSymbol}
      />
    </div>
  );
}
