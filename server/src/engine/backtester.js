import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from './indicators.js';

/**
 * Strategy backtesting engine.
 *
 * Replays historical candles through a set of entry/exit rules
 * and produces a detailed performance report.
 *
 * Strategy format:
 * {
 *   name: string,
 *   entryConditions: [{ indicator, params, comparator, value }],
 *   exitConditions:  [{ indicator, params, comparator, value }],
 * }
 *
 * indicator: 'sma' | 'ema' | 'rsi' | 'macd' | 'price' | 'bb_upper' | 'bb_lower'
 * comparator: 'gt' | 'lt' | 'gte' | 'lte' | 'cross_above' | 'cross_below'
 * value: number | 'sma' | 'ema' (for crossover-style)
 */

/**
 * Run a backtest.
 * @param {object} strategy
 * @param {Array<{open:number, high:number, low:number, close:number, volume:number, time:number}>} candles
 * @param {number} initialCapital
 * @returns {object} performance report
 */
export function backtest(strategy, candles, initialCapital = 10_000) {
  if (!candles || candles.length < 30) {
    return { error: 'Not enough candle data for backtesting (need ≥ 30)' };
  }

  const closes = candles.map((c) => c.close);

  // Pre-compute indicators that the strategy may reference
  const indicators = {
    sma_20: calculateSMA(closes, 20),
    sma_50: calculateSMA(closes, 50),
    ema_12: calculateEMA(closes, 12),
    ema_26: calculateEMA(closes, 26),
    rsi_14: calculateRSI(closes, 14),
    macd:   calculateMACD(closes),
    bb:     calculateBollingerBands(closes),
  };

  let capital = initialCapital;
  let position = null; // { entryPrice, entryIndex, quantity }
  const trades = [];
  const equityCurve = [capital];

  for (let i = 1; i < candles.length; i++) {
    const price = closes[i];

    if (!position) {
      // Check entry conditions
      if (evaluateConditions(strategy.entryConditions, indicators, closes, i)) {
        const quantity = Math.floor(capital / price);
        if (quantity > 0) {
          position = { entryPrice: price, entryIndex: i, quantity };
          capital -= quantity * price;
        }
      }
    } else {
      // Check exit conditions
      if (evaluateConditions(strategy.exitConditions, indicators, closes, i)) {
        const exitValue = position.quantity * price;
        const pnl = exitValue - position.quantity * position.entryPrice;
        capital += exitValue;

        trades.push({
          entryIndex: position.entryIndex,
          exitIndex: i,
          entryPrice: position.entryPrice,
          exitPrice: price,
          entryTime: candles[position.entryIndex].time,
          exitTime: candles[i].time,
          quantity: position.quantity,
          pnl: parseFloat(pnl.toFixed(2)),
          returnPct: parseFloat(((pnl / (position.quantity * position.entryPrice)) * 100).toFixed(2)),
        });

        position = null;
      }
    }

    // Mark-to-market equity
    const positionValue = position ? position.quantity * price : 0;
    equityCurve.push(parseFloat((capital + positionValue).toFixed(2)));
  }

  // Close any open position at the last price
  if (position) {
    const lastPrice = closes[closes.length - 1];
    const exitValue = position.quantity * lastPrice;
    const pnl = exitValue - position.quantity * position.entryPrice;
    capital += exitValue;

    trades.push({
      entryIndex: position.entryIndex,
      exitIndex: closes.length - 1,
      entryPrice: position.entryPrice,
      exitPrice: lastPrice,
      entryTime: candles[position.entryIndex].time,
      exitTime: candles[candles.length - 1].time,
      quantity: position.quantity,
      pnl: parseFloat(pnl.toFixed(2)),
      returnPct: parseFloat(((pnl / (position.quantity * position.entryPrice)) * 100).toFixed(2)),
    });
    position = null;
  }

  // ── Performance Metrics ────────────────────────────────
  const totalReturn = parseFloat(((capital - initialCapital) / initialCapital * 100).toFixed(2));

  const wins = trades.filter((t) => t.pnl > 0);
  const winRate = trades.length > 0 ? parseFloat(((wins.length / trades.length) * 100).toFixed(2)) : 0;

  // Max drawdown
  let peak = equityCurve[0];
  let maxDrawdown = 0;
  for (const eq of equityCurve) {
    if (eq > peak) peak = eq;
    const dd = ((peak - eq) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }
  maxDrawdown = parseFloat(maxDrawdown.toFixed(2));

  // Sharpe ratio (simplified – annualised from per-bar returns)
  const returns = [];
  for (let i = 1; i < equityCurve.length; i++) {
    returns.push((equityCurve[i] - equityCurve[i - 1]) / equityCurve[i - 1]);
  }
  const meanReturn = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const stdReturn = Math.sqrt(
    returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / (returns.length || 1)
  );
  const sharpeRatio = stdReturn === 0 ? 0 : parseFloat(((meanReturn / stdReturn) * Math.sqrt(252)).toFixed(2));

  return {
    initialCapital,
    finalCapital: parseFloat(capital.toFixed(2)),
    totalReturn,
    totalTrades: trades.length,
    winRate,
    maxDrawdown,
    sharpeRatio,
    trades,
    equityCurve,
  };
}

// ─── Condition Evaluator ──────────────────────────────────

function evaluateConditions(conditions, indicators, closes, index) {
  if (!conditions || conditions.length === 0) return false;

  return conditions.every((cond) => {
    const lhs = getIndicatorValue(cond.indicator, cond.params, indicators, closes, index);
    if (lhs == null) return false;

    const rhs = getRhsValue(cond.value, cond.params, indicators, closes, index);
    if (rhs == null) return false;

    return compare(lhs, cond.comparator, rhs);
  });
}

function getIndicatorValue(indicator, params, indicators, closes, index) {
  switch (indicator) {
    case 'price':
      return closes[index];
    case 'sma':
      return (indicators[`sma_${params?.period || 20}`] || indicators.sma_20)[index];
    case 'ema':
      return (indicators[`ema_${params?.period || 12}`] || indicators.ema_12)[index];
    case 'rsi':
      return indicators.rsi_14[index];
    case 'macd':
      return indicators.macd.macd[index];
    case 'macd_signal':
      return indicators.macd.signal[index];
    case 'macd_histogram':
      return indicators.macd.histogram[index];
    case 'bb_upper':
      return indicators.bb.upper[index];
    case 'bb_lower':
      return indicators.bb.lower[index];
    case 'bb_middle':
      return indicators.bb.middle[index];
    default:
      return closes[index];
  }
}

function getRhsValue(value, params, indicators, closes, index) {
  if (typeof value === 'number') return value;
  // Allow referencing another indicator
  return getIndicatorValue(value, params, indicators, closes, index);
}

function compare(lhs, comparator, rhs) {
  switch (comparator) {
    case 'gt':  return lhs > rhs;
    case 'lt':  return lhs < rhs;
    case 'gte': return lhs >= rhs;
    case 'lte': return lhs <= rhs;
    case 'eq':  return lhs === rhs;
    default:    return false;
  }
}
