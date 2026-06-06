import { Router } from 'express';
import { calculateSMA, calculateEMA, calculateRSI, calculateMACD, calculateBollingerBands } from '../engine/indicators.js';
import { detectPatterns } from '../engine/patterns.js';

const router = Router();

/**
 * The market engine instance is injected by the main server file.
 * @type {import('../engine/marketEngine.js').MarketEngine}
 */
let engine = null;

/**
 * Inject the market engine singleton.
 * @param {import('../engine/marketEngine.js').MarketEngine} marketEngine
 */
export function setMarketEngine(marketEngine) {
  engine = marketEngine;
}

/**
 * GET /api/market/assets
 * List all assets with current prices.
 */
router.get('/assets', (_req, res) => {
  try {
    const assets = engine.getAllQuotes();
    return res.json({ assets });
  } catch (err) {
    console.error('[Market] /assets error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/market/candles/:symbol
 * Query params: timeframe (1m|5m|15m|1h|4h|1d), count
 */
router.get('/candles/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = req.query.timeframe || '1m';
    const count = parseInt(req.query.count, 10) || 200;

    if (!engine.assets[symbol.toUpperCase()]) {
      return res.status(404).json({ error: `Unknown symbol: ${symbol}` });
    }

    const candles = engine.getHistory(symbol.toUpperCase(), timeframe, count);
    return res.json({ symbol: symbol.toUpperCase(), timeframe, count: candles.length, candles });
  } catch (err) {
    console.error('[Market] /candles error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/market/quote/:symbol
 */
router.get('/quote/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const quote = engine.getQuote(symbol.toUpperCase());
    if (!quote) {
      return res.status(404).json({ error: `Unknown symbol: ${symbol}` });
    }
    return res.json({ quote });
  } catch (err) {
    console.error('[Market] /quote error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/market/indicators/:symbol
 * Query params: timeframe, count
 * Returns SMA, EMA, RSI, MACD, Bollinger Bands.
 */
router.get('/indicators/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = req.query.timeframe || '1m';
    const count = parseInt(req.query.count, 10) || 200;

    if (!engine.assets[symbol.toUpperCase()]) {
      return res.status(404).json({ error: `Unknown symbol: ${symbol}` });
    }

    const candles = engine.getHistory(symbol.toUpperCase(), timeframe, count);
    const closes = candles.map((c) => c.close);

    const indicators = {
      sma_20: calculateSMA(closes, 20),
      sma_50: calculateSMA(closes, 50),
      ema_12: calculateEMA(closes, 12),
      ema_26: calculateEMA(closes, 26),
      rsi:    calculateRSI(closes, 14),
      macd:   calculateMACD(closes, 12, 26, 9),
      bollingerBands: calculateBollingerBands(closes, 20, 2),
    };

    return res.json({ symbol: symbol.toUpperCase(), timeframe, count: candles.length, indicators });
  } catch (err) {
    console.error('[Market] /indicators error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/market/patterns/:symbol
 * Detect candlestick patterns.
 */
router.get('/patterns/:symbol', (req, res) => {
  try {
    const { symbol } = req.params;
    const timeframe = req.query.timeframe || '1m';
    const count = parseInt(req.query.count, 10) || 200;

    if (!engine.assets[symbol.toUpperCase()]) {
      return res.status(404).json({ error: `Unknown symbol: ${symbol}` });
    }

    const candles = engine.getHistory(symbol.toUpperCase(), timeframe, count);
    const patterns = detectPatterns(candles);

    return res.json({ symbol: symbol.toUpperCase(), timeframe, count: candles.length, patterns });
  } catch (err) {
    console.error('[Market] /patterns error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
