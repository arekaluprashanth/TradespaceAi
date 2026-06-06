import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, Target, ArrowDownRight, Activity, BarChart3, Loader2 } from 'lucide-react';
import { formatCurrency, formatPercent } from '../../lib/utils';

interface BacktestResultsProps {
  results?: {
    totalReturn: number;
    winRate: number;
    maxDrawdown: number;
    sharpeRatio: number;
    totalTrades: number;
    equityCurve: { date: string; value: number }[];
    trades: {
      entryDate: string;
      exitDate: string;
      symbol: string;
      type: string;
      entryPrice: number;
      exitPrice: number;
      pnl: number;
    }[];
  } | null;
  isLoading?: boolean;
}

// Generate demo backtest data
const demoResults = {
  totalReturn: 23.5,
  winRate: 64.2,
  maxDrawdown: -8.3,
  sharpeRatio: 1.82,
  totalTrades: 47,
  equityCurve: Array.from({ length: 60 }, (_, i) => ({
    date: `Day ${i + 1}`,
    value: 100000 + Math.sin(i * 0.3) * 5000 + i * 400 + Math.random() * 2000,
  })),
  trades: [
    { entryDate: '2024-01-15', exitDate: '2024-01-22', symbol: 'AAPL', type: 'long', entryPrice: 182.5, exitPrice: 191.3, pnl: 880 },
    { entryDate: '2024-02-01', exitDate: '2024-02-08', symbol: 'AAPL', type: 'long', entryPrice: 188.2, exitPrice: 185.1, pnl: -310 },
    { entryDate: '2024-02-20', exitDate: '2024-03-01', symbol: 'AAPL', type: 'long', entryPrice: 179.8, exitPrice: 192.4, pnl: 1260 },
    { entryDate: '2024-03-10', exitDate: '2024-03-18', symbol: 'AAPL', type: 'long', entryPrice: 190.1, exitPrice: 188.7, pnl: -140 },
    { entryDate: '2024-03-25', exitDate: '2024-04-05', symbol: 'AAPL', type: 'long', entryPrice: 185.3, exitPrice: 198.6, pnl: 1330 },
  ],
};

export default function BacktestResults({ results, isLoading = false }: BacktestResultsProps) {
  const data = results || demoResults;

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-12 flex flex-col items-center justify-center"
      >
        <Loader2 size={40} className="text-accent-cyan animate-spin mb-4" />
        <p className="text-white font-medium">Running backtest...</p>
        <p className="text-dark-400 text-sm mt-1">Analyzing historical data</p>
      </motion.div>
    );
  }

  const metrics = [
    {
      title: 'Total Return',
      value: `${data.totalReturn >= 0 ? '+' : ''}${data.totalReturn.toFixed(1)}%`,
      icon: TrendingUp,
      color: data.totalReturn >= 0 ? 'text-accent-green' : 'text-accent-red',
      bgColor: data.totalReturn >= 0 ? 'from-accent-green/20 to-accent-green/5' : 'from-accent-red/20 to-accent-red/5',
    },
    {
      title: 'Win Rate',
      value: `${data.winRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-accent-cyan',
      bgColor: 'from-accent-cyan/20 to-accent-cyan/5',
    },
    {
      title: 'Max Drawdown',
      value: `${data.maxDrawdown.toFixed(1)}%`,
      icon: ArrowDownRight,
      color: 'text-accent-red',
      bgColor: 'from-accent-red/20 to-accent-red/5',
    },
    {
      title: 'Sharpe Ratio',
      value: data.sharpeRatio.toFixed(2),
      icon: Activity,
      color: 'text-accent-purple',
      bgColor: 'from-accent-purple/20 to-accent-purple/5',
    },
    {
      title: 'Total Trades',
      value: data.totalTrades.toString(),
      icon: BarChart3,
      color: 'text-accent-blue',
      bgColor: 'from-accent-blue/20 to-accent-blue/5',
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-white/10 rounded-xl px-3 py-2 shadow-glass">
          <p className="text-xs text-dark-300">{payload[0].payload.date}</p>
          <p className="text-sm font-mono font-bold text-accent-cyan">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-4"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${metric.bgColor} flex items-center justify-center mb-2`}>
              <metric.icon size={16} className={metric.color} />
            </div>
            <p className="text-xs text-dark-400">{metric.title}</p>
            <p className={`text-xl font-bold font-mono ${metric.color}`}>{metric.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Equity Curve */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Equity Curve</h3>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.equityCurve}>
              <defs>
                <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#727b9c', fontSize: 11 }}
                interval="preserveStartEnd"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#727b9c', fontSize: 11 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00d4ff"
                strokeWidth={2}
                fill="url(#equityGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Trade Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Trade Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Entry</th>
                <th className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Exit</th>
                <th className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Symbol</th>
                <th className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Type</th>
                <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Entry Price</th>
                <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Exit Price</th>
                <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.trades.map((trade, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3 text-sm font-mono text-dark-200">{trade.entryDate}</td>
                  <td className="px-6 py-3 text-sm font-mono text-dark-200">{trade.exitDate}</td>
                  <td className="px-6 py-3 text-sm font-mono font-medium text-white">{trade.symbol}</td>
                  <td className="px-6 py-3">
                    <span className={`text-xs font-semibold uppercase px-2 py-0.5 rounded-full ${
                      trade.type === 'long' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
                    }`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm font-mono text-right text-white">{formatCurrency(trade.entryPrice)}</td>
                  <td className="px-6 py-3 text-sm font-mono text-right text-white">{formatCurrency(trade.exitPrice)}</td>
                  <td className={`px-6 py-3 text-sm font-mono text-right font-medium ${trade.pnl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                    {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
