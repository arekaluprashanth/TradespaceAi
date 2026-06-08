import { Router } from 'express';
import store from '../store/dataStore.js';
import { authMiddleware } from '../middleware/auth.js';
import { roundTo } from '../utils/helpers.js';

const router = Router();

/**
 * The market engine instance – injected by the main server.
 * @type {import('../engine/marketEngine.js').MarketEngine}
 */
let engine = null;

export function setMarketEngine(marketEngine) {
  engine = marketEngine;
}

const TRANSACTION_FEE_RATE = 0.001; // 0.1 %

// ─── Routes ────────────────────────────────────────────────

/**
 * GET /api/portfolio
 * Get the current user's portfolio with current market values.
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const portfolio = store.getPortfolio(req.user.id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    // Enrich holdings with current prices
    const holdings = (portfolio.holdings || []).map((h) => {
      const quote = engine.getQuote(h.symbol);
      const currentPrice = quote ? quote.price : h.avgCost;
      const marketValue = roundTo(h.quantity * currentPrice, 2);
      const costBasis = roundTo(h.quantity * h.avgCost, 2);
      const pnl = roundTo(marketValue - costBasis, 2);
      const pnlPercent = costBasis > 0 ? roundTo((pnl / costBasis) * 100, 2) : 0;
      return {
        ...h,
        currentPrice,
        marketValue,
        costBasis,
        pnl,
        pnlPercent,
        name: quote?.name || h.symbol,
        category: quote?.category || 'stock',
      };
    });

    const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
    const totalCostBasis = holdings.reduce((s, h) => s + h.costBasis, 0);
    const totalPnl = roundTo(totalMarketValue - totalCostBasis, 2);

    return res.json({
      portfolio: {
        id: portfolio.id,
        userId: portfolio.userId,
        balance: roundTo(portfolio.balance, 2),
        holdings,
        totalMarketValue: roundTo(totalMarketValue, 2),
        totalCostBasis: roundTo(totalCostBasis, 2),
        totalPnl,
        totalPnlPercent: totalCostBasis > 0 ? roundTo((totalPnl / totalCostBasis) * 100, 2) : 0,
        totalValue: roundTo(portfolio.balance + totalMarketValue, 2),
      },
    });
  } catch (err) {
    console.error('[Portfolio] GET / error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/portfolio/trade
 * Body: { symbol, type: 'buy'|'sell', quantity }
 */
router.post('/trade', authMiddleware, (req, res) => {
  try {
    const { symbol, type, quantity } = req.body;

    if (!symbol || !type || !quantity) {
      return res.status(400).json({ error: 'symbol, type, and quantity are required' });
    }

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: 'quantity must be a positive number' });
    }

    const upperSymbol = symbol.toUpperCase();
    const quote = engine.getQuote(upperSymbol);
    if (!quote) {
      return res.status(404).json({ error: `Unknown symbol: ${symbol}` });
    }

    const portfolio = store.getPortfolio(req.user.id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const price = quote.price;
    const gross = roundTo(price * qty, 2);
    const fee = roundTo(gross * TRANSACTION_FEE_RATE, 2);

    if (type === 'buy') {
      const totalCost = gross + fee;
      if (totalCost > portfolio.balance) {
        return res.status(400).json({ error: 'Insufficient balance', required: totalCost, available: portfolio.balance });
      }

      portfolio.balance = roundTo(portfolio.balance - totalCost, 2);

      // Update holdings
      const existing = portfolio.holdings.find((h) => h.symbol === upperSymbol);
      if (existing) {
        const totalQty = existing.quantity + qty;
        existing.avgCost = roundTo((existing.avgCost * existing.quantity + price * qty) / totalQty, 4);
        existing.quantity = totalQty;
      } else {
        portfolio.holdings.push({ symbol: upperSymbol, quantity: qty, avgCost: price });
      }
    } else if (type === 'sell') {
      const existing = portfolio.holdings.find((h) => h.symbol === upperSymbol);
      if (!existing || existing.quantity < qty) {
        return res.status(400).json({ error: 'Insufficient holdings', available: existing?.quantity || 0 });
      }

      portfolio.balance = roundTo(portfolio.balance + gross - fee, 2);
      existing.quantity -= qty;

      if (existing.quantity <= 0) {
        portfolio.holdings = portfolio.holdings.filter((h) => h.symbol !== upperSymbol);
      }
    } else {
      return res.status(400).json({ error: 'type must be "buy" or "sell"' });
    }

    // Persist portfolio update
    store.update('portfolios', portfolio.id, portfolio);

    // Record trade
    const trade = store.create('trades', {
      userId: req.user.id,
      symbol: upperSymbol,
      type,
      quantity: qty,
      price,
      fee,
      total: type === 'buy' ? gross + fee : gross - fee,
      time: Date.now(),
    });

    store.save();

    return res.json({ trade, balance: portfolio.balance });
  } catch (err) {
    console.error('[Portfolio] POST /trade error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/portfolio/history
 * Trade history for the current user.
 */
router.get('/history', authMiddleware, (req, res) => {
  try {
    const trades = store.getUserTrades(req.user.id);
    return res.json({ trades: trades.reverse() }); // newest first
  } catch (err) {
    console.error('[Portfolio] GET /history error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/portfolio/performance
 * Portfolio performance metrics.
 */
router.get('/performance', authMiddleware, (req, res) => {
  try {
    const portfolio = store.getPortfolio(req.user.id);
    if (!portfolio) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }

    const trades = store.getUserTrades(req.user.id);

    // Calculate performance
    const initialBalance = 100_000;
    const holdings = (portfolio.holdings || []).map((h) => {
      const quote = engine.getQuote(h.symbol);
      const currentPrice = quote ? quote.price : h.avgCost;
      return { ...h, currentPrice, marketValue: roundTo(h.quantity * currentPrice, 2) };
    });

    const totalMarketValue = holdings.reduce((s, h) => s + h.marketValue, 0);
    const totalValue = portfolio.balance + totalMarketValue;
    const totalReturn = roundTo(((totalValue - initialBalance) / initialBalance) * 100, 2);

    // Win/loss from closed trades
    const buyMap = {};
    const closedPnl = [];
    for (const t of trades) {
      if (t.type === 'buy') {
        if (!buyMap[t.symbol]) buyMap[t.symbol] = [];
        buyMap[t.symbol].push(t);
      } else if (t.type === 'sell' && buyMap[t.symbol]?.length) {
        const buyTrade = buyMap[t.symbol].shift();
        closedPnl.push(t.price - buyTrade.price);
      }
    }

    const wins = closedPnl.filter((p) => p > 0).length;
    const winRate = closedPnl.length > 0 ? roundTo((wins / closedPnl.length) * 100, 2) : 0;

    return res.json({
      performance: {
        initialBalance,
        currentBalance: roundTo(portfolio.balance, 2),
        totalMarketValue: roundTo(totalMarketValue, 2),
        totalValue: roundTo(totalValue, 2),
        totalReturn,
        totalTrades: trades.length,
        winRate,
        holdings,
      },
    });
  } catch (err) {
    console.error('[Portfolio] GET /performance error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
