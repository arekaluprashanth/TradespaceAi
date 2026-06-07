import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CandlestickChart,
  LineChart as LineChartIcon,
  AreaChart,
  ChevronDown,
  Plus,
  Search,
} from 'lucide-react';
import type { TimeFrame } from '../../types';
import { useMarketStore } from '../../stores/marketStore';

const timeframes: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1D'];

const indicators = [
  { id: 'sma', label: 'SMA', description: 'Simple Moving Average' },
  { id: 'ema', label: 'EMA', description: 'Exponential Moving Average' },
  { id: 'rsi', label: 'RSI', description: 'Relative Strength Index' },
  { id: 'macd', label: 'MACD', description: 'Moving Average Convergence Divergence' },
  { id: 'bollinger', label: 'BB', description: 'Bollinger Bands' },
];

interface ChartToolbarProps {
  chartType: 'candlestick' | 'line' | 'area';
  onChartTypeChange: (type: 'candlestick' | 'line' | 'area') => void;
  activeTimeframe?: TimeFrame;
  onTimeframeChange?: (tf: TimeFrame) => void;
  activeIndicators?: string[];
  onIndicatorToggle?: (id: string) => void;
}

export default function ChartToolbar({
  chartType,
  onChartTypeChange,
  activeTimeframe = '1h',
  onTimeframeChange,
  activeIndicators = [],
  onIndicatorToggle,
}: ChartToolbarProps) {
  const { assets, activeSymbol, setActiveSymbol } = useMarketStore();
  const [showAssetDropdown, setShowAssetDropdown] = useState(false);
  const [showIndicators, setShowIndicators] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');

  const filteredAssets = (assets || []).filter(
    (a: any) =>
      a.symbol?.toLowerCase().includes(assetSearch.toLowerCase()) ||
      a.name?.toLowerCase().includes(assetSearch.toLowerCase())
  );

  const chartTypes = [
    { type: 'candlestick' as const, icon: CandlestickChart, label: 'Candlestick' },
    { type: 'line' as const, icon: LineChartIcon, label: 'Line' },
    { type: 'area' as const, icon: AreaChart, label: 'Area' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2 bg-dark-800/50 border border-white/5 rounded-xl p-2">
      {/* Asset selector */}
      <div className="relative">
        <button
          onClick={() => setShowAssetDropdown(!showAssetDropdown)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-dark-700/50 hover:bg-dark-700 border border-white/5 text-sm font-medium text-white transition-colors"
        >
          <span className="font-mono">{activeSymbol || 'AAPL'}</span>
          <ChevronDown size={14} className="text-dark-300" />
        </button>

        {showAssetDropdown && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowAssetDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-1 w-64 bg-dark-800 border border-white/10 rounded-xl shadow-glass overflow-hidden z-40"
            >
              <div className="p-2">
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400" />
                  <input
                    type="text"
                    value={assetSearch}
                    onChange={(e) => setAssetSearch(e.target.value)}
                    placeholder="Search assets..."
                    className="w-full pl-8 pr-3 py-1.5 bg-dark-700/50 rounded-lg text-sm text-white placeholder:text-dark-400 focus:outline-none border border-white/5"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {filteredAssets.length > 0 ? (
                  filteredAssets.map((asset: any) => (
                    <button
                      key={asset.symbol}
                      onClick={() => {
                        setActiveSymbol(asset.symbol);
                        setShowAssetDropdown(false);
                        setAssetSearch('');
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition-colors ${
                        asset.symbol === activeSymbol ? 'text-accent-cyan bg-accent-cyan/5' : 'text-white'
                      }`}
                    >
                      <span className="font-mono font-medium">{asset.symbol}</span>
                      <span className="text-dark-300 text-xs truncate ml-2">{asset.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center text-dark-400 text-sm">No assets found</div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/5" />

      {/* Timeframes */}
      <div className="flex items-center gap-1">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => onTimeframeChange?.(tf)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTimeframe === tf
                ? 'bg-accent-cyan/15 text-accent-cyan'
                : 'text-dark-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/5" />

      {/* Chart type */}
      <div className="flex items-center gap-1">
        {chartTypes.map(({ type, icon: Icon, label }) => (
          <button
            key={type}
            onClick={() => onChartTypeChange(type)}
            title={label}
            className={`p-1.5 rounded-lg transition-colors ${
              chartType === type
                ? 'bg-accent-cyan/15 text-accent-cyan'
                : 'text-dark-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-white/5" />

      {/* Indicators */}
      <div className="relative">
        <button
          onClick={() => setShowIndicators(!showIndicators)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-dark-200 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Plus size={14} />
          <span className="text-xs font-medium">Indicators</span>
          {activeIndicators.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-accent-cyan/20 text-accent-cyan text-[10px] flex items-center justify-center font-bold">
              {activeIndicators.length}
            </span>
          )}
        </button>

        {showIndicators && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setShowIndicators(false)} />
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 mt-1 w-56 bg-dark-800 border border-white/10 rounded-xl shadow-glass overflow-hidden z-40"
            >
              <div className="p-2">
                <p className="text-xs font-medium text-dark-300 px-2 py-1">Technical Indicators</p>
              </div>
              <div className="py-1">
                {indicators.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => onIndicatorToggle?.(ind.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-white/5 transition-colors"
                  >
                    <div>
                      <span className="font-medium text-white">{ind.label}</span>
                      <span className="ml-2 text-xs text-dark-400">{ind.description}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                        activeIndicators.includes(ind.id)
                          ? 'bg-accent-cyan border-accent-cyan'
                          : 'border-dark-400'
                      }`}
                    >
                      {activeIndicators.includes(ind.id) && (
                        <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
