import type { ComponentType, SVGProps } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changePercent?: number;
  icon: ComponentType<any>;
  color?: 'cyan' | 'green' | 'red' | 'purple' | 'orange' | 'blue';
  sparklineData?: number[];
}

const colorMap = {
  cyan: {
    text: 'text-accent-cyan',
    bg: 'from-accent-cyan/20 to-accent-cyan/5',
    stroke: '#00d4ff',
  },
  green: {
    text: 'text-accent-green',
    bg: 'from-accent-green/20 to-accent-green/5',
    stroke: '#10b981',
  },
  red: {
    text: 'text-accent-red',
    bg: 'from-accent-red/20 to-accent-red/5',
    stroke: '#ef4444',
  },
  purple: {
    text: 'text-accent-purple',
    bg: 'from-accent-purple/20 to-accent-purple/5',
    stroke: '#a855f7',
  },
  orange: {
    text: 'text-accent-orange',
    bg: 'from-accent-orange/20 to-accent-orange/5',
    stroke: '#f59e0b',
  },
  blue: {
    text: 'text-accent-blue',
    bg: 'from-accent-blue/20 to-accent-blue/5',
    stroke: '#3b82f6',
  },
};

export default function MetricCard({
  title,
  value,
  change,
  changePercent,
  icon: Icon,
  color = 'cyan',
  sparklineData,
}: MetricCardProps) {
  const colors = colorMap[color];
  const isPositive = (change ?? 0) >= 0;

  const sparkData = sparklineData?.map((v, i) => ({ v, i })) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
          <Icon size={20} className={colors.text} />
        </div>
        {change !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-mono font-medium px-2 py-0.5 rounded-full ${
              isPositive ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
            }`}
          >
            {isPositive ? '↑' : '↓'}
            {changePercent !== undefined
              ? `${Math.abs(changePercent).toFixed(1)}%`
              : Math.abs(change).toFixed(2)}
          </span>
        )}
      </div>

      <p className="text-xs text-dark-400 mb-1">{title}</p>
      <p className={`text-2xl font-bold font-mono ${colors.text}`}>{value}</p>

      {sparkData.length > 0 && (
        <div className="mt-3 -mx-1" style={{ height: 40 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkData}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={colors.stroke}
                strokeWidth={1.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
