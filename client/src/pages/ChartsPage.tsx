import { useMemo } from 'react';
import { useMarketData } from '../hooks/useMarketData';
import { useMarketStore } from '../stores/marketStore';
import ChartToolbar from '../components/charts/ChartToolbar';
import ChartContainer from '../components/charts/ChartContainer';
import { formatCurrency } from '../lib/utils';

export default function ChartsPage() {
  const { isConnected, lastUpdate } = useMarketData();
  const chartType = useMarketStore((state) => state.chartType);
  const timeFrame = useMarketStore((state) => state.timeFrame);
  const activeSymbol = useMarketStore((state) => state.activeSymbol);
  const quotes = useMarketStore((state) => state.quotes);
  const activeIndicators = useMarketStore((state) => state.activeIndicators);
  const setChartType = useMarketStore((state) => state.setChartType);
  const setTimeFrame = useMarketStore((state) => state.setTimeFrame);
  const toggleIndicator = useMarketStore((state) => state.toggleIndicator);

  const activeQuote = quotes[activeSymbol];

  const quoteChangeLabel = useMemo(() => {
    if (!activeQuote) return '–';
    return `${activeQuote.change >= 0 ? '+' : ''}${activeQuote.change.toFixed(2)} (${activeQuote.changePercent.toFixed(2)}%)`;
  }, [activeQuote]);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm text-dark-400">Charting</p>
            <h1 className="text-3xl font-semibold text-white">Market visualization</h1>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl bg-dark-900/80 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-dark-400">Symbol</p>
              <p className="mt-2 text-xl font-semibold text-white">{activeSymbol}</p>
            </div>
            <div className="rounded-3xl bg-dark-900/80 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-dark-400">Price</p>
              <p className="mt-2 text-xl font-semibold text-white">{activeQuote ? formatCurrency(activeQuote.price) : 'Loading...'}</p>
            </div>
            <div className="rounded-3xl bg-dark-900/80 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-dark-400">Change</p>
              <p className="mt-2 text-xl font-semibold text-white">{quoteChangeLabel}</p>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-dark-400">{isConnected ? `Live feed active · last update ${lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : '—'}` : 'Market feed offline'}</p>
      </div>

      <div className="space-y-4">
        <ChartToolbar
          chartType={chartType}
          onChartTypeChange={setChartType}
          activeTimeframe={timeFrame}
          onTimeframeChange={setTimeFrame}
          activeIndicators={activeIndicators}
          onIndicatorToggle={toggleIndicator}
        />
        <ChartContainer chartType={chartType} />
      </div>
    </div>
  );
}
