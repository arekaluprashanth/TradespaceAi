import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { formatCurrency, formatPercent } from '../../lib/utils';

export default function PortfolioPanel() {
  const portfolio = usePortfolioStore((state) => state.portfolio);

  const holdingsList = portfolio?.holdings || [];
  const totalValue = portfolio?.totalValue ?? 100000;
  const dailyPL = portfolio?.dailyPnl ?? 0;
  const totalPL = portfolio?.totalPnl ?? 0;
  const availableCash = portfolio?.balance ?? 50000;

  const dailyPLPercent = totalValue > 0 ? (dailyPL / totalValue) * 100 : 0;
  const totalPLPercent = totalValue > 0 ? (totalPL / totalValue) * 100 : 0;

  const summaryCards = [
    {
      title: 'Total Portfolio Value',
      value: formatCurrency(totalValue),
      icon: Wallet,
      color: 'from-accent-cyan to-accent-blue',
      textColor: 'text-accent-cyan',
    },
    {
      title: 'Daily P/L',
      value: `${dailyPL >= 0 ? '+' : ''}${formatCurrency(dailyPL)}`,
      subtitle: `${dailyPL >= 0 ? '+' : ''}${dailyPLPercent.toFixed(2)}%`,
      icon: dailyPL >= 0 ? TrendingUp : TrendingDown,
      color: dailyPL >= 0 ? 'from-accent-green to-emerald-600' : 'from-accent-red to-red-600',
      textColor: dailyPL >= 0 ? 'text-accent-green' : 'text-accent-red',
    },
    {
      title: 'Total P/L',
      value: `${totalPL >= 0 ? '+' : ''}${formatCurrency(totalPL)}`,
      subtitle: `${totalPL >= 0 ? '+' : ''}${totalPLPercent.toFixed(2)}%`,
      icon: totalPL >= 0 ? ArrowUpRight : ArrowDownRight,
      color: totalPL >= 0 ? 'from-accent-green to-emerald-600' : 'from-accent-red to-red-600',
      textColor: totalPL >= 0 ? 'text-accent-green' : 'text-accent-red',
    },
    {
      title: 'Available Cash',
      value: formatCurrency(availableCash),
      icon: DollarSign,
      color: 'from-accent-purple to-purple-600',
      textColor: 'text-accent-purple',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-dark-300 text-sm">{card.title}</span>
              <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className={`text-2xl font-bold font-mono ${card.textColor}`}>{card.value}</p>
            {card.subtitle && (
              <p className={`text-sm font-mono mt-1 ${card.textColor}`}>{card.subtitle}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Holdings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-white/5">
          <h3 className="text-lg font-semibold text-white">Holdings</h3>
        </div>

        {holdingsList.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Asset</th>
                  <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Shares</th>
                  <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Avg Price</th>
                  <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Current</th>
                  <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Value</th>
                  <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">P/L</th>
                  <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">P/L %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {holdingsList.map((holding: any, i: number) => {
                  const pl = (holding.currentPrice - holding.avgPrice) * holding.shares;
                  const plPercent = holding.avgPrice > 0 ? ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100 : 0;
                  const isProfit = pl >= 0;

                  return (
                    <motion.tr
                      key={holding.symbol || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20 flex items-center justify-center text-xs font-bold text-accent-cyan">
                            {(holding.symbol || '??').slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{holding.symbol}</p>
                            <p className="text-xs text-dark-400">{holding.name || holding.symbol}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-white">{holding.shares}</td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-dark-200">{formatCurrency(holding.avgPrice)}</td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-white">{formatCurrency(holding.currentPrice)}</td>
                      <td className="px-6 py-4 text-right text-sm font-mono text-white">{formatCurrency(holding.currentPrice * holding.shares)}</td>
                      <td className={`px-6 py-4 text-right text-sm font-mono ${isProfit ? 'text-accent-green' : 'text-accent-red'}`}>
                        {isProfit ? '+' : ''}{formatCurrency(pl)}
                      </td>
                      <td className={`px-6 py-4 text-right text-sm font-mono ${isProfit ? 'text-accent-green' : 'text-accent-red'}`}>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${isProfit ? 'bg-accent-green/10' : 'bg-accent-red/10'}`}>
                          {isProfit ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                          {isProfit ? '+' : ''}{plPercent.toFixed(2)}%
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-12 text-center">
            <Wallet size={40} className="mx-auto mb-3 text-dark-500" />
            <p className="text-dark-300 text-sm">No holdings yet</p>
            <p className="text-dark-500 text-xs mt-1">Start trading to build your portfolio</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
