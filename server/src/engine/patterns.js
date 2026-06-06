/**
 * Candlestick pattern detection.
 *
 * Analyses an array of OHLCV candles and returns detected patterns
 * with their index, name, type, and description.
 */

/**
 * @param {Array<{open:number, high:number, low:number, close:number}>} candles
 * @returns {Array<{index:number, pattern:string, type:'bullish'|'bearish', description:string}>}
 */
export function detectPatterns(candles) {
  const results = [];
  if (!candles || candles.length < 3) return results;

  for (let i = 0; i < candles.length; i++) {
    const c = candles[i];
    const body = Math.abs(c.close - c.open);
    const range = c.high - c.low;
    const upperShadow = c.high - Math.max(c.open, c.close);
    const lowerShadow = Math.min(c.open, c.close) - c.low;
    const isBullish = c.close > c.open;

    // Skip candles with zero range
    if (range === 0) continue;

    const bodyRatio = body / range;

    // ── Doji ────────────────────────────────────────────
    if (bodyRatio < 0.1) {
      results.push({
        index: i,
        pattern: 'Doji',
        type: 'bearish', // indecision, often bearish at top
        description: 'Open and close are nearly equal – indicates market indecision.',
      });
      continue; // don't double-detect
    }

    // ── Hammer ──────────────────────────────────────────
    if (
      isBullish &&
      lowerShadow >= body * 2 &&
      upperShadow <= body * 0.3
    ) {
      results.push({
        index: i,
        pattern: 'Hammer',
        type: 'bullish',
        description: 'Small body at top with long lower shadow – potential bullish reversal.',
      });
      continue;
    }

    // ── Shooting Star ──────────────────────────────────
    if (
      !isBullish &&
      upperShadow >= body * 2 &&
      lowerShadow <= body * 0.3
    ) {
      results.push({
        index: i,
        pattern: 'Shooting Star',
        type: 'bearish',
        description: 'Small body at bottom with long upper shadow – potential bearish reversal.',
      });
      continue;
    }

    // ── Bullish Engulfing ──────────────────────────────
    if (i > 0) {
      const prev = candles[i - 1];
      const prevBody = Math.abs(prev.close - prev.open);
      const prevBullish = prev.close > prev.open;

      if (
        isBullish &&
        !prevBullish &&
        c.open <= prev.close &&
        c.close >= prev.open &&
        body > prevBody
      ) {
        results.push({
          index: i,
          pattern: 'Bullish Engulfing',
          type: 'bullish',
          description: 'Bullish candle completely engulfs the previous bearish candle.',
        });
        continue;
      }

      // ── Bearish Engulfing ──────────────────────────────
      if (
        !isBullish &&
        prevBullish &&
        c.open >= prev.close &&
        c.close <= prev.open &&
        body > prevBody
      ) {
        results.push({
          index: i,
          pattern: 'Bearish Engulfing',
          type: 'bearish',
          description: 'Bearish candle completely engulfs the previous bullish candle.',
        });
        continue;
      }
    }

    // ── Morning Star (3-candle) ─────────────────────────
    if (i >= 2) {
      const first = candles[i - 2];
      const second = candles[i - 1];
      const third = c;

      const firstBody = Math.abs(first.close - first.open);
      const secondBody = Math.abs(second.close - second.open);
      const secondRange = second.high - second.low;

      if (
        first.close < first.open &&              // first is bearish
        secondBody / (secondRange || 1) < 0.3 && // second has small body
        third.close > third.open &&               // third is bullish
        third.close > (first.open + first.close) / 2 // third closes above midpoint of first
      ) {
        results.push({
          index: i,
          pattern: 'Morning Star',
          type: 'bullish',
          description: 'Three-candle bullish reversal: bearish → small body → bullish.',
        });
        continue;
      }

      // ── Evening Star (3-candle) ─────────────────────────
      if (
        first.close > first.open &&              // first is bullish
        secondBody / (secondRange || 1) < 0.3 && // second has small body
        third.close < third.open &&               // third is bearish
        third.close < (first.open + first.close) / 2 // third closes below midpoint of first
      ) {
        results.push({
          index: i,
          pattern: 'Evening Star',
          type: 'bearish',
          description: 'Three-candle bearish reversal: bullish → small body → bearish.',
        });
        continue;
      }
    }
  }

  return results;
}
