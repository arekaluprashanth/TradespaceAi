import { Router } from 'express';
import store from '../store/dataStore.js';
import { generateToken } from '../middleware/auth.js';
import { generateId } from '../utils/helpers.js';
import { authMiddleware } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * POST /api/auth/register
 * Body: { name, email, password }
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    // Check for duplicate email
    if (store.getUserByEmail(email)) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const id = generateId();
    const hashed = await bcrypt.hash(password, 10);
    const user = store.create('users', { id, name, email, password: hashed });

    // Create default portfolio
    store.create('portfolios', {
      id: `portfolio-${id}`,
      userId: id,
      balance: 100_000,
      holdings: [],
    });

    // Create default watchlist
    store.create('watchlists', {
      id: `watchlist-${id}`,
      userId: id,
      symbols: ['AAPL', 'BTC', 'SPY'],
    });

    const token = generateToken(id);
    const { password: _, ...safeUser } = user;

    return res.status(201).json({ user: safeUser, token });
  } catch (err) {
    console.error('[Auth] Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = store.getUserByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    const token = generateToken(user.id);
    const { password: _, ...safeUser } = user;

    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error('[Auth] Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/auth/profile
 */
router.get('/profile', authMiddleware, (req, res) => {
  try {
    const { password: _, ...safeUser } = req.user;
    return res.json({ user: safeUser });
  } catch (err) {
    console.error('[Auth] Profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
