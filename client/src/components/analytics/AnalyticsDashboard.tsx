import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  Zap,
} from 'lucide-react';
import MetricCard from './MetricCard';
import { formatCurrency } from '../../lib/utils';

// Generate sample sparkline data
const generateSparkline = (base: number, variance: number, points: number = 20): number[] =>
  Array.from({ length: points }, (_, i) => base + Math.sin(i * 0.5) * variance + Math.random() * variance * 0.5);

// Portfolio growth demo data
const portfolioGrowth = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  value: 100000 + i * 800 + Math.sin(i * 0.4) * 3000 + Math.random() * 1500,
}));

// Correlation data
const correlationAssets = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
const correlationData = correlationAssets.map((a) =>
  correlationAssets.map((b) =>
    a === b ? 1 : parseFloat((Math.random() * 1.6 - 0.3).toFixed(2))
  )
);

export default function AnalyticsDashboard() {
  const metrics = [
    {
      title: 'Current RSI',
      value: '42.5',
      change: -3.2,
      changePercent: -3.2,
      icon: Activity,
      color: 'cyan' as const,
      sparklineData: generateSparkline(45, 15),
    },
    {
      title: 'Volatility (30d)',
      value: '18.3%',
      change: 2.1,
      changePercent: 2.1,
      icon: Zap,
      color: 'orange' as const,
      sparklineData: generateSparkline(18, 5),
    },
    {
      title: 'SMA 50 vs Price',
      value: '+2.4%',
      change: 2.4,
      changePercent: 2.4,
      icon: TrendingUp,
      color: 'green' as const,
      sparklineData: generateSparkline(180, 10),
    },
    {
      title: 'Portfolio Beta',
      value: '1.12',
      change: -0.05,
      changePercent: -4.3,
      icon: BarChart3,
      color: 'purple' as const,
      sparklineData: generateSparkline(1.1, 0.2),
    },
    {
      title: 'Win Rate',
      value: '64.2%',
      change: 1.5,
      changePercent: 1.5,
      icon: Target,
      color: 'green' as const,
      sparklineData: generateSparkline(64, 8),
    },
    {
      title: 'Avg Trade Duration',
      value: '4.2 days',
      change: -0.3,
      changePercent: -6.7,
      icon: Clock,
      color: 'blue' as const,
      sparklineData: generateSparkline(4, 1.5),
    },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-800 border border-white/10 rounded-xl px-3 py-2 shadow-glass">
          <p className="text-xs text-dark-300">{payload[0].payload.day}</p>
          <p className="text-sm font-mono font-bold text-accent-cyan">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  const getCorrelationColor = (val: number) => {
    if (val >= 0.7) return 'bg-accent-green/40 text-accent-green';
    if (val >= 0.3) return 'bg-accent-green/15 text-accent-green/70';
    if (val >= -0.3) return 'bg-dark-600/50 text-dark-200';
    if (val >= -0.7) return 'bg-accent-red/15 text-accent-red/70';
    return 'bg-accent-red/40 text-accent-red';
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </div>

      {/* Portfolio Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Portfolio Growth</h3>
          <div className="flex items-center gap-2">
            {['1W', '1M', '3M', '1Y', 'All'].map((period) => (
              <button
                key={period}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                  period === '1M'
                    ? 'bg-accent-cyan/15 text-accent-cyan'
                    : 'text-dark-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioGrowth}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
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
                fill="url(#growthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Correlation Heatmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Asset Correlation Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-3 py-2"></th>
                {correlationAssets.map((asset) => (
                  <th key={asset} className="px-3 py-2 text-xs font-mono text-dark-300">{asset}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {correlationAssets.map((rowAsset, i) => (
                <tr key={rowAsset}>
                  <td className="px-3 py-2 text-xs font-mono text-dark-300">{rowAsset}</td>
                  {correlationData[i].map((val, j) => (
                    <td key={j} className="px-1 py-1">
                      <div
                        className={`flex items-center justify-center w-14 h-10 rounded-lg font-mono text-xs font-medium ${getCorrelationColor(val)}`}
                      >
                        {val.toFixed(2)}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
