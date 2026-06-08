import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowUpRight, ArrowDownRight, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { usePortfolio } from '../../hooks/usePortfolio';

interface AssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: {
    symbol: string;
    name: string;
    price: number;
    changePercent: number;
  } | null;
}

export default function AssetModal({ isOpen, onClose, asset }: AssetModalProps) {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { executeTrade } = usePortfolio();

  if (!asset) return null;

  const isPositive = asset.changePercent >= 0;
  const totalCost = parseFloat(quantity || '0') * asset.price;

  const handleTrade = async () => {
    if (!quantity || parseFloat(quantity) <= 0) return;
    setIsSubmitting(true);
    try {
      await executeTrade(asset.symbol, orderType, parseFloat(quantity));
      onClose();
    } catch (error) {
      console.error('Trade failed', error);
      alert('Trade failed: ' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 w-full md:max-w-md glass-strong rounded-t-3xl md:rounded-3xl shadow-glow-cyan overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 pb-4 border-b border-dark-600 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-white">{asset.symbol}</h2>
                <p className="text-sm text-dark-300">{asset.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-dark-800 text-dark-200 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Price section */}
            <div className="p-6 bg-dark-800">
              <div className="flex items-end gap-3">
                <span className="text-4xl font-bold text-white tracking-tight">
                  {formatCurrency(asset.price)}
                </span>
                <span
                  className={`flex items-center text-lg font-semibold mb-1 ${
                    isPositive ? 'text-accent-green' : 'text-accent-red'
                  }`}
                >
                  {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                  {Math.abs(asset.changePercent).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Trading Controls */}
            <div className="p-6 space-y-6 overflow-y-auto">
              <div className="flex p-1 bg-dark-800 rounded-xl border border-dark-600">
                <button
                  onClick={() => setOrderType('buy')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    orderType === 'buy'
                      ? 'bg-accent-blue text-white shadow-md'
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setOrderType('sell')}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    orderType === 'sell'
                      ? 'bg-accent-red text-white shadow-md'
                      : 'text-dark-300 hover:text-white'
                  }`}
                >
                  Sell
                </button>
              </div>

              <div>
                <label className="block text-sm text-dark-300 mb-2">Quantity</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-dark-800 border border-dark-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-blue"
                    placeholder="Enter quantity"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-t border-dark-600">
                <span className="text-dark-300">Estimated Total</span>
                <span className="text-xl font-bold text-white">
                  {formatCurrency(totalCost)}
                </span>
              </div>

              <button
                onClick={handleTrade}
                disabled={isSubmitting || !quantity || parseFloat(quantity) <= 0}
                className={`w-full py-4 rounded-xl text-white font-bold text-lg flex justify-center items-center gap-2 transition-all ${
                  orderType === 'buy'
                    ? 'bg-accent-green hover:bg-accent-green/90'
                    : 'bg-accent-red hover:bg-accent-red/90'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <TrendingUp size={20} />
                    Confirm {orderType.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
