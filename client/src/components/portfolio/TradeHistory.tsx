import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpDown, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { formatCurrency } from '../../lib/utils';
import { format } from 'date-fns';

type SortField = 'date' | 'symbol' | 'type' | 'quantity' | 'price' | 'total';
type SortDir = 'asc' | 'desc';

export default function TradeHistory() {
  const { trades } = usePortfolioStore();
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [filterSymbol, setFilterSymbol] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'buy' | 'sell'>('all');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const tradesList = trades || [];

  const filtered = useMemo(() => {
    return tradesList.filter((t: any) => {
      if (filterSymbol && !t.symbol?.toLowerCase().includes(filterSymbol.toLowerCase())) return false;
      if (filterType !== 'all' && t.side !== filterType && t.type !== filterType) return false;
      return true;
    });
  }, [tradesList, filterSymbol, filterType]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a: any, b: any) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'date': aVal = new Date(a.date || a.time || a.createdAt).getTime(); bVal = new Date(b.date || b.time || b.createdAt).getTime(); break;
        case 'symbol': aVal = a.symbol; bVal = b.symbol; break;
        case 'type': aVal = a.side || a.type; bVal = b.side || b.type; break;
        case 'quantity': aVal = a.quantity; bVal = b.quantity; break;
        case 'price': aVal = a.price; bVal = b.price; break;
        case 'total': aVal = a.price * a.quantity; bVal = b.price * b.quantity; break;
        default: aVal = 0; bVal = 0;
      }
      if (typeof aVal === 'string') return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filtered, sortField, sortDir]);

  const totalPages = Math.ceil(sorted.length / perPage);
  const paginated = sorted.slice((page - 1) * perPage, page * perPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const exportCSV = () => {
    const headers = ['Date', 'Symbol', 'Type', 'Quantity', 'Price', 'Total', 'Fee', 'P/L'];
    const rows = sorted.map((t: any) => [
      format(new Date(t.date || t.createdAt || Date.now()), 'yyyy-MM-dd HH:mm'),
      t.symbol,
      t.side || t.type || 'buy',
      t.quantity,
      t.price,
      (t.price * t.quantity).toFixed(2),
      ((t.price * t.quantity) * 0.001).toFixed(2),
      t.pnl?.toFixed(2) || '0.00',
    ]);
    const csv = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trade-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <th
      onClick={() => handleSort(field)}
      className="text-left text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3 cursor-pointer hover:text-white transition-colors group"
    >
      <span className="flex items-center gap-1">
        {children}
        <ArrowUpDown size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
      </span>
    </th>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b border-white/5">
        <h3 className="text-lg font-semibold text-white">Trade History</h3>
        <div className="flex items-center gap-2">
          {/* Symbol filter */}
          <div className="relative">
            <Filter size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-400" />
            <input
              type="text"
              value={filterSymbol}
              onChange={(e) => { setFilterSymbol(e.target.value); setPage(1); }}
              placeholder="Filter symbol..."
              className="pl-8 pr-3 py-1.5 bg-dark-700/50 rounded-lg text-xs text-white placeholder:text-dark-400 border border-white/5 focus:outline-none focus:border-accent-cyan/50 w-32"
            />
          </div>
          {/* Type filter */}
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as any); setPage(1); }}
            className="px-3 py-1.5 bg-dark-700/50 rounded-lg text-xs text-white border border-white/5 focus:outline-none"
          >
            <option value="all">All Types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
          {/* Export */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-dark-700/50 border border-white/5 text-xs text-dark-200 hover:text-white hover:bg-dark-700 transition-colors"
          >
            <Download size={12} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      {paginated.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <SortHeader field="date">Date</SortHeader>
                <SortHeader field="symbol">Symbol</SortHeader>
                <SortHeader field="type">Type</SortHeader>
                <SortHeader field="quantity">Qty</SortHeader>
                <SortHeader field="price">Price</SortHeader>
                <SortHeader field="total">Total</SortHeader>
                <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">Fee</th>
                <th className="text-right text-xs font-medium text-dark-300 uppercase tracking-wider px-6 py-3">P/L</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginated.map((trade: any, i: number) => {
                const tradeType = trade.side || trade.type || 'buy';
                const isBuy = tradeType === 'buy';
                const total = trade.price * trade.quantity;
                const fee = total * 0.001;
                const pnl = trade.pnl || 0;

                return (
                  <tr key={trade.id || i} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3 text-sm font-mono text-dark-200">
                      {format(
                        new Date(
                          trade.time || trade.date || trade.createdAt || Date.now()
                        ),
                        'MMM dd, yyyy HH:mm'
                      )}
                    </td>
                    <td className="px-6 py-3 text-sm font-mono font-medium text-white">{trade.symbol}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        isBuy ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
                      }`}>
                        {tradeType}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-mono text-white">{trade.quantity}</td>
                    <td className="px-6 py-3 text-sm font-mono text-white">{formatCurrency(trade.price)}</td>
                    <td className="px-6 py-3 text-sm font-mono text-white">{formatCurrency(total)}</td>
                    <td className="px-6 py-3 text-right text-sm font-mono text-dark-400">{formatCurrency(fee)}</td>
                    <td className={`px-6 py-3 text-right text-sm font-mono ${pnl >= 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-6 py-12 text-center">
          <p className="text-dark-300 text-sm">No trades found</p>
          <p className="text-dark-500 text-xs mt-1">Execute your first trade to see history</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-white/5">
          <span className="text-xs text-dark-400">
            Showing {(page - 1) * perPage + 1}–{Math.min(page * perPage, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg hover:bg-white/5 text-dark-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, page - 3),
              Math.min(totalPages, page + 2)
            ).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  page === p ? 'bg-accent-cyan/15 text-accent-cyan' : 'text-dark-300 hover:bg-white/5'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg hover:bg-white/5 text-dark-300 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
