// ═══════════════════════════════════════════════════════
// TradeSphere AI — Type Definitions
// ═══════════════════════════════════════════════════════

export type AssetCategory = 'stock' | 'crypto' | 'bond' | 'etf';

export interface Asset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  marketCap?: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total: number;
  fee: number;
  timestamp: number;
  pnl?: number;
}

export interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  value: number;
  pnl: number;
  pnlPercent: number;
}

export interface Portfolio {
  balance: number;
  totalValue: number;
  totalPnl: number;
  totalPnlPercent: number;
  holdings: Holding[];
  dailyPnl: number;
}

export type Comparator = '<' | '>' | 'crosses_above' | 'crosses_below';

export interface Condition {
  indicator: string;
  comparator: Comparator;
  value: number;
}

export interface BacktestResult {
  totalReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
  totalTrades: number;
  trades: Trade[];
  equityCurve: { time: number; value: number }[];
}

export interface Strategy {
  id: string;
  name: string;
  description: string;
  entryConditions: Condition[];
  exitConditions: Condition[];
  active: boolean;
  performance?: BacktestResult;
}

export interface Indicator {
  id: string;
  name: string;
  type: string;
  settings: Record<string, number>;
  color: string;
  active: boolean;
}

export interface Pattern {
  index: number;
  pattern: string;
  type: 'bullish' | 'bearish';
  description: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: number;
  read: boolean;
}

export type ChartType = 'candlestick' | 'line' | 'area';

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1D';

// ── API Response Types ─────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
