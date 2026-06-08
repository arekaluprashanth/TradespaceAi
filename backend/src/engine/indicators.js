/**
 * Technical indicator calculations.
 *
 * All functions accept an array of close prices and return an array
 * of computed values (same length as input, with leading NaN/null
 * values where there is insufficient lookback data).
 */

/**
 * Simple Moving Average.
 * @param {number[]} data - close prices
 * @param {number} period
 * @returns {number[]}
 */
export function calculateSMA(data, period) {
  const result = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j];
    }
    result.push(parseFloat((sum / period).toFixed(4)));
  }
  return result;
}

/**
 * Exponential Moving Average.
 * @param {number[]} data - close prices
 * @param {number} period
 * @returns {number[]}
 */
export function calculateEMA(data, period) {
  const result = [];
  const k = 2 / (period + 1);

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(null);
      continue;
    }
    if (i === period - 1) {
      // Seed EMA with SMA
      let sum = 0;
      for (let j = 0; j < period; j++) sum += data[j];
      result.push(parseFloat((sum / period).toFixed(4)));
      continue;
    }
    const prev = result[i - 1];
    const ema = data[i] * k + prev * (1 - k);
    result.push(parseFloat(ema.toFixed(4)));
  }
  return result;
}

/**
 * Relative Strength Index.
 * @param {number[]} data - close prices
 * @param {number} period - default 14
 * @returns {number[]}
 */
export function calculateRSI(data, period = 14) {
  const result = [];
  if (data.length < period + 1) {
    return data.map(() => null);
  }

  const gains = [];
  const losses = [];

  for (let i = 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    gains.push(diff > 0 ? diff : 0);
    losses.push(diff < 0 ? Math.abs(diff) : 0);
  }

  // First RSI value uses simple average
  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 0; i < period; i++) {
    avgGain += gains[i];
    avgLoss += losses[i];
  }
  avgGain /= period;
  avgLoss /= period;

  // Pad leading nulls
  for (let i = 0; i < period; i++) {
    result.push(null);
  }

  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  result.push(parseFloat((100 - 100 / (1 + rs)).toFixed(2)));

  // Subsequent values use smoothed average
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    result.push(parseFloat((100 - 100 / (1 + rs)).toFixed(2)));
  }

  return result;
}

/**
 * MACD (Moving Average Convergence Divergence).
 * @param {number[]} data - close prices
 * @param {number} fast - fast EMA period (default 12)
 * @param {number} slow - slow EMA period (default 26)
 * @param {number} signal - signal EMA period (default 9)
 * @returns {{ macd: number[], signal: number[], histogram: number[] }}
 */
export function calculateMACD(data, fast = 12, slow = 26, signal = 9) {
  const emaFast = calculateEMA(data, fast);
  const emaSlow = calculateEMA(data, slow);

  // MACD line = EMA_fast - EMA_slow
  const macdLine = [];
  for (let i = 0; i < data.length; i++) {
    if (emaFast[i] == null || emaSlow[i] == null) {
      macdLine.push(null);
    } else {
      macdLine.push(parseFloat((emaFast[i] - emaSlow[i]).toFixed(4)));
    }
  }

  // Signal line = EMA of MACD line (only over non-null values)
  const macdValues = macdLine.filter((v) => v !== null);
  const signalEma = calculateEMA(macdValues, signal);

  // Map signal back onto the full-length array
  const signalLine = [];
  const histogram = [];
  let macdIdx = 0;

  for (let i = 0; i < data.length; i++) {
    if (macdLine[i] == null) {
      signalLine.push(null);
      histogram.push(null);
    } else {
      const sig = signalEma[macdIdx] != null ? signalEma[macdIdx] : null;
      signalLine.push(sig);
      histogram.push(sig != null ? parseFloat((macdLine[i] - sig).toFixed(4)) : null);
      macdIdx++;
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Bollinger Bands.
 * @param {number[]} data - close prices
 * @param {number} period - default 20
 * @param {number} stdDev - number of standard deviations (default 2)
 * @returns {{ upper: number[], middle: number[], lower: number[] }}
 */
export function calculateBollingerBands(data, period = 20, stdDev = 2) {
  const middle = calculateSMA(data, period);
  const upper = [];
  const lower = [];

  for (let i = 0; i < data.length; i++) {
    if (middle[i] == null) {
      upper.push(null);
      lower.push(null);
      continue;
    }
    // Compute standard deviation over the window
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sumSq += Math.pow(data[j] - middle[i], 2);
    }
    const sd = Math.sqrt(sumSq / period);
    upper.push(parseFloat((middle[i] + stdDev * sd).toFixed(4)));
    lower.push(parseFloat((middle[i] - stdDev * sd).toFixed(4)));
  }

  return { upper, middle, lower };
}
