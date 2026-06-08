import store from '../store/dataStore.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '7d';

/**
 * Auth middleware using JWT tokens. Falls back to demo user if no valid token.
 */
export function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    let userId = 'demo'; // default to demo user

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      try {
        const payload = jwt.verify(token, JWT_SECRET);
        if (payload && payload.sub) userId = payload.sub;
      } catch (err) {
        // invalid token — we'll fall back to demo behavior below
        console.warn('[Auth] Invalid token:', err.message);
      }
    }

    const user = store.getUserById(userId);
    if (!user) {
      // Fall back to demo user
      const demoUser = store.getUserById('demo');
      if (!demoUser) return res.status(401).json({ error: 'Unauthorized – no user found' });
      req.user = demoUser;
    } else {
      req.user = user;
    }

    next();
  } catch (err) {
    console.error('[Auth] Error:', err.message);
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

/**
 * Generate a JWT for a given user id.
 */
export function generateToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}
