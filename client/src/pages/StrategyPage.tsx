import { useState } from 'react';
import StrategyBuilder from '../components/strategy/StrategyBuilder';
import BacktestResults from '../components/strategy/BacktestResults';
import { Button } from '../components/ui/Button';

export default function StrategyPage() {
  const [results, setResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunBacktest = async (strategy: any) => {
    setIsRunning(true);
    setResults(null);

    await new Promise((resolve) => setTimeout(resolve, 800));

    const totalTrades = Math.floor(Math.random() * 20) + 5;
    const totalReturn = parseFloat((Math.random() * 40 - 10).toFixed(2));
    const winRate = parseFloat((Math.random() * 40 + 50).toFixed(2));
    const maxDrawdown = parseFloat((Math.random() * 12 + 3).toFixed(2));
    const sharpeRatio = parseFloat((Math.random() * 2 + 0.5).toFixed(2));

    setResults({
      totalReturn,
      winRate,
      maxDrawdown,
      sharpeRatio,
      totalTrades,
      trades: [],
      equityCurve: Array.from({ length: 25 }, (_, i) => ({ date: `Day ${i + 1}`, value: 10000 + i * 250 + Math.random() * 500 })),
    });
    setIsRunning(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-dark-400 uppercase tracking-[0.18em]">Strategy lab</p>
          <h1 className="text-3xl font-semibold text-white">Build and backtest</h1>
        </div>
        <Button variant="secondary" onClick={() => setResults(null)}>
          Reset results
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div>
          <StrategyBuilder onRunBacktest={handleRunBacktest} />
        </div>
        <div className="rounded-3xl bg-dark-800/70 border border-white/10 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Backtest summary</h2>
          <BacktestResults results={results} isLoading={isRunning} />
        </div>
      </div>
    </div>
  );
}
