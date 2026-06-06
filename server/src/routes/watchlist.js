import { Router } from 'express';
import store from '../store/dataStore.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

/**
 * GET /api/watchlist
 * Get the current user's watchlist.
 */
router.get('/', authMiddleware, (req, res) => {
  try {
    let watchlist = store.getWatchlist(req.user.id);
    if (!watchlist) {
      // Auto-create a default watchlist
      watchlist = store.create('watchlists', {
        userId: req.user.id,
        symbols: [],
      });
    }
    return res.json({ watchlist });
  } catch (err) {
    console.error('[Watchlist] GET / error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/watchlist
 * Body: { symbol }
 */
router.post('/', authMiddleware, (req, res) => {
  try {
    const { symbol } = req.body;
    if (!symbol) {
      return res.status(400).json({ error: 'symbol is required' });
    }

    let watchlist = store.getWatchlist(req.user.id);
    if (!watchlist) {
      watchlist = store.create('watchlists', { userId: req.user.id, symbols: [] });
    }

    const upperSymbol = symbol.toUpperCase();
    if (watchlist.symbols.includes(upperSymbol)) {
      return res.status(409).json({ error: 'Symbol already in watchlist' });
    }

    watchlist.symbols.push(upperSymbol);
    store.update('watchlists', watchlist.id, { symbols: watchlist.symbols });
    store.save();

    return res.json({ watchlist });
  } catch (err) {
    console.error('[Watchlist] POST / error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/watchlist/:symbol
 */
router.delete('/:symbol', authMiddleware, (req, res) => {
  try {
    const upperSymbol = req.params.symbol.toUpperCase();

    const watchlist = store.getWatchlist(req.user.id);
    if (!watchlist) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }

    watchlist.symbols = watchlist.symbols.filter((s) => s !== upperSymbol);
    store.update('watchlists', watchlist.id, { symbols: watchlist.symbols });
    store.save();

    return res.json({ watchlist });
  } catch (err) {
    console.error('[Watchlist] DELETE /:symbol error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
