import { randomNormal, roundTo, clamp } from '../utils/helpers.js';

/**
 * Asset definitions with category, base price, and volatility.
 */
const ASSETS = {
  // ── Stocks ──────────────────────────────────────────────
  AAPL:  { name: 'Apple',              category: 'stock',  basePrice: 190,    volatility: 0.015,  volume: 50_000_000 },
  TSLA:  { name: 'Tesla',              category: 'stock',  basePrice: 250,    volatility: 0.025,  volume: 80_000_000 },
  GOOGL: { name: 'Google',             category: 'stock',  basePrice: 175,    volatility: 0.014,  volume: 25_000_000 },
  MSFT:  { name: 'Microsoft',          category: 'stock',  basePrice: 420,    volatility: 0.013,  volume: 30_000_000 },
  AMZN:  { name: 'Amazon',             category: 'stock',  basePrice: 185,    volatility: 0.016,  volume: 40_000_000 },
  NVDA:  { name: 'Nvidia',             category: 'stock',  basePrice: 130,    volatility: 0.028,  volume: 60_000_000 },
  META:  { name: 'Meta',               category: 'stock',  basePrice: 500,    volatility: 0.018,  volume: 20_000_000 },

  // ── Crypto ──────────────────────────────────────────────
  BTC:   { name: 'Bitcoin',            category: 'crypto', basePrice: 65_000, volatility: 0.022,  volume: 30_000 },
  ETH:   { name: 'Ethereum',           category: 'crypto', basePrice: 3_500,  volatility: 0.025,  volume: 500_000 },
  SOL:   { name: 'Solana',             category: 'crypto', basePrice: 170,    volatility: 0.035,  volume: 2_000_000 },
  ADA:   { name: 'Cardano',            category: 'crypto', basePrice: 0.45,   volatility: 0.030,  volume: 500_000_000 },

  // ── Bonds ───────────────────────────────────────────────
  US10Y: { name: '10-Year Treasury',   category: 'bond',   basePrice: 4.3,    volatility: 0.003,  volume: 1_000_000 },
  US30Y: { name: '30-Year Treasury',   category: 'bond',   basePrice: 4.5,    volatility: 0.003,  volume: 800_000 },

  // ── ETFs ────────────────────────────────────────────────
  SPY:   { name: 'S&P 500 ETF',        category: 'etf',    basePrice: 530,    volatility: 0.010,  volume: 70_000_000 },
  QQQ:   { name: 'Nasdaq ETF',         category: 'etf',    basePrice: 460,    volatility: 0.012,  volume: 40_000_000 },
  VTI:   { name: 'Total Market ETF',   category: 'etf',    basePrice: 270,    volatility: 0.009,  volume: 5_000_000 },
};

/**
 * Determine the number of decimals to use based on price magnitude.
 */
function priceDecimals(price) {
  if (price >= 1000) return 2;
  if (price >= 1) return 2;
  if (price >= 0.01) return 4;
  return 6;
}

/**
 * Core market simulation engine.
 *
 * Generates realistic OHLCV candles using a random-walk with drift
 * and mean reversion toward the base price.
 */
export class MarketEngine {
  constructor() {
    /** @type {Record<string, object>} asset definitions */
    this.assets = ASSETS;

    /** @type {Record<string, number>} current price per symbol */
    this.currentPrices = {};

    /** @type {Record<string, object>} previous tick data per symbol */
    this.previousTick = {};

    /** @type {Record<string, Array<object>>} candle history per symbol */
    this.history = {};

    // Initialise prices at base
    for (const [symbol, asset] of Object.entries(ASSETS)) {
      this.currentPrices[symbol] = asset.basePrice;
      this.history[symbol] = [];
    }
  }

  // ─── Initialisation ─────────────────────────────────────

  /**
   * Generate `count` historical candles for every asset.
   */
  generateHistory(count = 200) {
    for (const symbol of Object.keys(this.assets)) {
      this.history[symbol] = [];
      // Start from a slightly randomised position
      let price = this.assets[symbol].basePrice * (1 + randomNormal() * 0.02);
      const now = Date.now();
      const interval = 60_000; // 1-minute candles

      for (let i = count; i > 0; i--) {
        const candle = this._buildCandle(symbol, price, now - i * interval);
        this.history[symbol].push(candle);
        price = candle.close; // walk forward from close
      }

      this.currentPrices[symbol] = price;
    }
    console.log(`[MarketEngine] Generated ${count} historical candles for ${Object.keys(this.assets).length} assets`);
  }

  // ─── Candle Generation ──────────────────────────────────

  /**
   * Build a single OHLCV candle starting from `openPrice` at `timestamp`.
   */
  _buildCandle(symbol, openPrice, timestamp) {
    const asset = this.assets[symbol];
    const vol = asset.volatility;
    const dec = priceDecimals(openPrice);

    // Mean-reversion component (pull toward base price)
    const deviation = (openPrice - asset.basePrice) / asset.basePrice;
    const reversion = -deviation * 0.02; // gentle pull

    // Random walk with drift
    const drift = reversion + randomNormal() * vol;
    const closePrice = roundTo(openPrice * (1 + drift), dec);

    // Intra-candle high / low
    const wickUp   = Math.abs(randomNormal() * vol * 0.5);
    const wickDown = Math.abs(randomNormal() * vol * 0.5);
    const high = roundTo(Math.max(openPrice, closePrice) * (1 + wickUp), dec);
    const low  = roundTo(Math.min(openPrice, closePrice) * (1 - wickDown), dec);

    // Volume with random multiplier (0.5× – 2×)
    const volMultiplier = 0.5 + Math.random() * 1.5;
    const volume = Math.round(asset.volume * volMultiplier);

    return {
      time: timestamp,
      open:  clamp(roundTo(openPrice, dec), 0.0001, Infinity),
      high:  clamp(high, 0.0001, Infinity),
      low:   clamp(low, 0.0001, Infinity),
      close: clamp(closePrice, 0.0001, Infinity),
      volume,
    };
  }

  /**
   * Generate a new live candle for a symbol based on its current price.
   */
  generateCandle(symbol) {
    const price = this.currentPrices[symbol];
    if (price == null) return null;
    const candle = this._buildCandle(symbol, price, Date.now());
    this.history[symbol].push(candle);

    // Keep history capped at ~2000 candles to avoid memory bloat
    if (this.history[symbol].length > 2000) {
      this.history[symbol] = this.history[symbol].slice(-2000);
    }

    this.currentPrices[symbol] = candle.close;
    return candle;
  }

  // ─── Tick ───────────────────────────────────────────────

  /**
   * Advance the simulation by one tick for all assets.
   * Returns an array of price-update objects.
   */
  tick() {
    const updates = [];

    for (const symbol of Object.keys(this.assets)) {
      const prevPrice = this.currentPrices[symbol];
      const candle = this.generateCandle(symbol);
      if (!candle) continue;

      const change = roundTo(candle.close - prevPrice, priceDecimals(prevPrice));
      const changePercent = roundTo((change / prevPrice) * 100, 2);

      const update = {
        symbol,
        price:         candle.close,
        change,
        changePercent,
        volume:        candle.volume,
        high:          candle.high,
        low:           candle.low,
        open:          candle.open,
        time:          candle.time,
        name:          this.assets[symbol].name,
        category:      this.assets[symbol].category,
      };

      this.previousTick[symbol] = update;
      updates.push(update);
    }

    return updates;
  }

  // ─── Query Helpers ──────────────────────────────────────

  /**
   * Return historical candles for a symbol.
   * Supports timeframe aggregation: '1m', '5m', '15m', '1h', '4h', '1d'
   */
  getHistory(symbol, timeframe = '1m', count = 200) {
    const raw = this.history[symbol];
    if (!raw || raw.length === 0) return [];

    const multiplier = timeframeToMinutes(timeframe);
    if (multiplier === 1) {
      return raw.slice(-count);
    }

    // Aggregate into larger timeframes
    const aggregated = [];
    const bucketMs = multiplier * 60_000;

    let bucket = null;
    for (const c of raw) {
      const bucketStart = Math.floor(c.time / bucketMs) * bucketMs;
      if (!bucket || bucket.time !== bucketStart) {
        if (bucket) aggregated.push(bucket);
        bucket = { time: bucketStart, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume };
      } else {
        bucket.high   = Math.max(bucket.high, c.high);
        bucket.low    = Math.min(bucket.low, c.low);
        bucket.close  = c.close;
        bucket.volume += c.volume;
      }
    }
    if (bucket) aggregated.push(bucket);

    return aggregated.slice(-count);
  }

  /**
   * Get the current quote for a symbol.
   */
  getQuote(symbol) {
    const asset = this.assets[symbol];
    if (!asset) return null;

    const price = this.currentPrices[symbol];
    const prev = this.previousTick[symbol];
    const change = prev ? prev.change : 0;
    const changePercent = prev ? prev.changePercent : 0;

    return {
      symbol,
      name:     asset.name,
      category: asset.category,
      price,
      change,
      changePercent,
      volume:   prev ? prev.volume : 0,
      high:     prev ? prev.high : price,
      low:      prev ? prev.low : price,
      time:     Date.now(),
    };
  }

  /**
   * Get quotes for all assets.
   */
  getAllQuotes() {
    return Object.keys(this.assets).map((symbol) => this.getQuote(symbol));
  }

  /**
   * Return the list of supported asset symbols with metadata.
   */
  getAssetList() {
    return Object.entries(this.assets).map(([symbol, a]) => ({
      symbol,
      name:     a.name,
      category: a.category,
      price:    this.currentPrices[symbol],
    }));
  }
}

// ─── Helpers ────────────────────────────────────────────────

function timeframeToMinutes(tf) {
  const map = {
    '1m':  1,
    '5m':  5,
    '15m': 15,
    '1h':  60,
    '4h':  240,
    '1d':  1440,
  };
  return map[tf] || 1;
}
