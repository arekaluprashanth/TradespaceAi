import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useMarketStore } from '../../stores/marketStore';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

interface TradeFormProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol?: string;
}

export default function TradeForm({ isOpen, onClose, defaultSymbol }: TradeFormProps) {
  const { assets, quotes } = useMarketStore();
  const executeTrade = usePortfolioStore((state) => state.executeTrade);
  const balance = usePortfolioStore((state) => state.portfolio?.balance);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [symbol, setSymbol] = useState(defaultSymbol || 'AAPL');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultSymbol) setSymbol(defaultSymbol);
  }, [defaultSymbol]);

  const currentPrice = quotes?.[symbol]?.price || 0;
  const priceChange = quotes?.[symbol]?.change || 0;
  const executionPrice = orderType === 'limit' ? parseFloat(limitPrice) || 0 : currentPrice;
  const subtotal = executionPrice * quantity;
  const fee = subtotal * 0.001;
  const total = side === 'buy' ? subtotal + fee : subtotal - fee;
  const availableBalance = balance ?? 50000;
  const canAfford = side === 'buy' ? total <= availableBalance : true;

  const handleSubmit = async () => {
    if (quantity <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }
    if (orderType === 'limit' && (!limitPrice || parseFloat(limitPrice) <= 0)) {
      toast.error('Please enter a valid limit price');
      return;
    }
    if (!canAfford) {
      toast.error('Insufficient funds');
      return;
    }

    setIsSubmitting(true);
    try {
      await executeTrade(symbol, side, quantity);
      toast.success(`${side === 'buy' ? 'Bought' : 'Sold'} ${quantity} ${symbol} at ${formatCurrency(executionPrice)}`);
      onClose();
      setQuantity(1);
    } catch (err: any) {
      toast.error(err?.message || 'Trade execution failed');
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="w-full max-w-md bg-dark-800 border border-white/10 rounded-2xl shadow-glass overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                <h2 className="text-lg font-semibold text-white">New Trade</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-dark-300 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Buy/Sell tabs */}
                <div className="flex rounded-xl bg-dark-700/50 p-1">
                  {(['buy', 'sell'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSide(s)}
                      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all uppercase ${
                        side === s
                          ? s === 'buy'
                            ? 'bg-accent-green text-white shadow-glow-green'
                            : 'bg-accent-red text-white shadow-glow-red'
                          : 'text-dark-300 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Asset selector */}
                <div>
                  <label className="text-xs font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">Asset</label>
                  <select
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full px-4 py-2.5 bg-dark-700/50 border border-white/5 rounded-xl text-white text-sm font-mono focus:outline-none focus:border-accent-cyan/50 transition-colors"
                  >
                    {(assets || []).map((a: any) => (
                      <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.name}</option>
                    ))}
                    {(!assets || assets.length === 0) && (
                      <option value={symbol}>{symbol}</option>
                    )}
                  </select>
                </div>

                {/* Current price */}
                <div className="flex items-center justify-between px-4 py-3 bg-dark-700/30 rounded-xl">
                  <span className="text-sm text-dark-300">Current Price</span>
                  <div className="text-right">
                    <span className="text-lg font-mono font-bold text-white">{formatCurrency(currentPrice)}</span>
                    <span className={`ml-2 text-xs font-mono ${priceChange >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {priceChange >= 0 ? <ArrowUpRight className="inline" size={12} /> : <ArrowDownRight className="inline" size={12} />}
                      {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                    </span>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="text-xs font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">Quantity</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 rounded-lg bg-dark-700/50 border border-white/5 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="flex-1 px-4 py-2 bg-dark-700/50 border border-white/5 rounded-xl text-white text-center font-mono text-lg focus:outline-none focus:border-accent-cyan/50"
                    />
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 rounded-lg bg-dark-700/50 border border-white/5 text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Order type */}
                <div>
                  <label className="text-xs font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">Order Type</label>
                  <div className="flex rounded-xl bg-dark-700/50 p-1">
                    {(['market', 'limit'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setOrderType(t)}
                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all capitalize ${
                          orderType === t
                            ? 'bg-accent-cyan/15 text-accent-cyan'
                            : 'text-dark-300 hover:text-white'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {orderType === 'limit' && (
                  <div>
                    <label className="text-xs font-medium text-dark-300 uppercase tracking-wider mb-1.5 block">Limit Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(e.target.value)}
                      placeholder="Enter limit price..."
                      className="w-full px-4 py-2 bg-dark-700/50 border border-white/5 rounded-xl text-white font-mono focus:outline-none focus:border-accent-cyan/50"
                    />
                  </div>
                )}

                {/* Summary */}
                <div className="space-y-2 p-4 bg-dark-700/30 rounded-xl text-sm">
                  <div className="flex justify-between">
                    <span className="text-dark-300">Subtotal</span>
                    <span className="font-mono text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-dark-300">Fee (0.1%)</span>
                    <span className="font-mono text-dark-200">{formatCurrency(fee)}</span>
                  </div>
                  <div className="border-t border-white/5 pt-2 flex justify-between">
                    <span className="text-white font-medium">Total</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Balance */}
                <div className="flex justify-between text-xs">
                  <span className="text-dark-400">Available Balance</span>
                  <span className={`font-mono ${canAfford ? 'text-dark-200' : 'text-accent-red'}`}>
                    {formatCurrency(availableBalance)}
                  </span>
                </div>

                {/* Execute */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canAfford || quantity <= 0}
                  className={`w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    side === 'buy'
                      ? 'bg-accent-green hover:bg-accent-green/90 shadow-glow-green'
                      : 'bg-accent-red hover:bg-accent-red/90 shadow-glow-red'
                  }`}
                >
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
