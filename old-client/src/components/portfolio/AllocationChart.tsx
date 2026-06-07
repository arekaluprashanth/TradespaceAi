import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { formatCurrency } from '../../lib/utils';

const COLORS = ['#00d4ff', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#06b6d4', '#8b5cf6'];

export default function AllocationChart() {
  const portfolio = usePortfolioStore((state) => state.portfolio);

  const holdingsList = portfolio?.holdings || [];
  const totalValue = portfolio?.totalValue || holdingsList.reduce((sum: number, h: any) => sum + (h.currentPrice || 0) * (h.shares || 0), 0);

  const data = holdingsList.map((h: any) => ({
    name: h.symbol,
    value: (h.currentPrice || 0) * (h.shares || 0),
    shares: h.shares,
  }));

  if (data.length === 0) {
    // Show placeholder data
    data.push(
      { name: 'Cash', value: totalValue || 50000, shares: 0 },
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      const pct = totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(1) : '0';
      return (
        <div className="bg-dark-800 border border-white/10 rounded-xl px-3 py-2 shadow-glass">
          <p className="text-sm font-medium text-white">{d.name}</p>
          <p className="text-xs font-mono text-accent-cyan">{formatCurrency(d.value)}</p>
          <p className="text-xs text-dark-300">{pct}% of portfolio</p>
        </div>
      );
    }
    return null;
  };

  const renderLabel = ({ name, percent, cx, x }: any) => {
    const isLeft = x < cx;
    return (
      <text
        x={x}
        y={0}
        fill="#a1a7bd"
        textAnchor={isLeft ? 'end' : 'start'}
        dominantBaseline="central"
        className="text-xs"
      >
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-white mb-4">Portfolio Allocation</h3>

      <div className="relative" style={{ height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              dataKey="value"
              label={renderLabel}
              labelLine={{ stroke: '#333c5e', strokeWidth: 1 }}
            >
              {data.map((_: any, index: number) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  strokeWidth={0}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-xs text-dark-400">Total Value</p>
            <p className="text-lg font-bold font-mono text-white">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 justify-center">
        {data.map((d: any, i: number) => (
          <div key={d.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-xs text-dark-200">{d.name}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
