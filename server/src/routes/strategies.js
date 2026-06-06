import { Router } from 'express';
import store from '../store/dataStore.js';
import { authMiddleware } from '../middleware/auth.js';
import { backtest } from '../engine/backtester.js';

const router = Router();

/**
 * The market engine instance – injected by the main server.
 * @type {import('../engine/marketEngine.js').MarketEngine}
 */
let engine = null;

export function setMarketEngine(marketEngine) {
  engine = marketEngine;
}

// ─── Routes ────────────────────────────────────────────────

/**
 * GET /api/strategies
 * List all saved strategies for the current user.
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    const strategies = store.getUserStrategies(req.user.id);
    return res.json({ strategies });
  } catch (err) {
    console.error('[Strategies] GET / error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/strategies
 * Create a new strategy.
 * Body: { name, description, entryConditions, exitConditions }
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description, entryConditions, exitConditions } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const strategy = store.create('strategies', {
      userId: req.user.id,
      name,
      description: description || '',
      entryConditions: entryConditions || [],
      exitConditions: exitConditions || [],
    });

    store.save();
    return res.status(201).json({ strategy });
  } catch (err) {
    console.error('[Strategies] POST / error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT /api/strategies/:id
 * Update an existing strategy.
 */
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const existing = store.getById('strategies', id);

    if (!existing) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const { name, description, entryConditions, exitConditions } = req.body;
    const updated = store.update('strategies', id, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(entryConditions !== undefined && { entryConditions }),
      ...(exitConditions !== undefined && { exitConditions }),
    });

    store.save();
    return res.json({ strategy: updated });
  } catch (err) {
    console.error('[Strategies] PUT /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/strategies/:id
 */
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const existing = store.getById('strategies', id);

    if (!existing) {
      return res.status(404).json({ error: 'Strategy not found' });
    }
    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    store.delete('strategies', id);
    store.save();

    return res.json({ success: true });
  } catch (err) {
    console.error('[Strategies] DELETE /:id error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/strategies/:id/backtest
 * Run a backtest using the strategy against a symbol's history.
 * Body: { symbol, timeframe?, count?, initialCapital? }
 */
router.post('/:id/backtest', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const strategy = store.getById('strategies', id);

    if (!strategy) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    const { symbol, timeframe, count, initialCapital } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: 'symbol is required in body' });
    }

    const upperSymbol = symbol.toUpperCase();
    if (!engine.assets[upperSymbol]) {
      return res.status(404).json({ error: `Unknown symbol: ${symbol}` });
    }

    const candles = engine.getHistory(upperSymbol, timeframe || '1m', count || 200);
    const result = backtest(strategy, candles, initialCapital || 10_000);

    return res.json({ symbol: upperSymbol, strategy: strategy.name, result });
  } catch (err) {
    console.error('[Strategies] POST /:id/backtest error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
