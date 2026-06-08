import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateId } from '../utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

/**
 * In-memory data store with JSON file persistence.
 */
class DataStore {
  constructor() {
    this.data = {
      users: [],
      portfolios: [],
      trades: [],
      watchlists: [],
      strategies: [],
      indicators: [],
    };
    this._dirty = false;
    this._saveInterval = null;
  }

  // ─── Lifecycle ──────────────────────────────────────────────

  /**
   * Load data from disk. If no file exists, seed with defaults.
   */
  load() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Merge each collection so we never lose structure
        for (const key of Object.keys(this.data)) {
          if (Array.isArray(parsed[key])) {
            this.data[key] = parsed[key];
          }
        }
        console.log('[DataStore] Loaded data from', STORE_FILE);
      } else {
        console.log('[DataStore] No store file found – seeding defaults');
        this._seedDefaults();
        this.save();
      }
    } catch (err) {
      console.error('[DataStore] Failed to load store file:', err.message);
      this._seedDefaults();
    }

    // Auto-save every 30 seconds if dirty
    this._saveInterval = setInterval(() => {
      if (this._dirty) this.save();
    }, 30_000);
  }

  /**
   * Persist current state to disk.
   */
  save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
      this._dirty = false;
    } catch (err) {
      console.error('[DataStore] Failed to save:', err.message);
    }
  }

  /**
   * Seed with a demo user and default portfolio.
   */
  _seedDefaults() {
    const demoUser = {
      id: 'demo',
      email: 'demo@tradesphere.ai',
      name: 'Demo Trader',
      password: 'demo123',
      createdAt: new Date().toISOString(),
    };

    const demoPortfolio = {
      id: 'portfolio-demo',
      userId: 'demo',
      balance: 100_000,
      holdings: [],        // { symbol, quantity, avgCost }
      createdAt: new Date().toISOString(),
    };

    const demoWatchlist = {
      id: 'watchlist-demo',
      userId: 'demo',
      symbols: ['AAPL', 'BTC', 'SPY', 'TSLA', 'ETH'],
      createdAt: new Date().toISOString(),
    };

    this.data.users = [demoUser];
    this.data.portfolios = [demoPortfolio];
    this.data.watchlists = [demoWatchlist];
    this.data.trades = [];
    this.data.strategies = [];
    this.data.indicators = [];
  }

  // ─── Generic CRUD ───────────────────────────────────────────

  _collection(name) {
    if (!this.data[name]) throw new Error(`Unknown collection: ${name}`);
    return this.data[name];
  }

  getAll(collection) {
    return this._collection(collection);
  }

  getById(collection, id) {
    return this._collection(collection).find((item) => item.id === id) || null;
  }

  find(collection, predicate) {
    return this._collection(collection).filter(predicate);
  }

  findOne(collection, predicate) {
    return this._collection(collection).find(predicate) || null;
  }

  create(collection, item) {
    const record = { id: generateId(), createdAt: new Date().toISOString(), ...item };
    this._collection(collection).push(record);
    this._dirty = true;
    return record;
  }

  update(collection, id, updates) {
    const col = this._collection(collection);
    const idx = col.findIndex((item) => item.id === id);
    if (idx === -1) return null;
    col[idx] = { ...col[idx], ...updates, updatedAt: new Date().toISOString() };
    this._dirty = true;
    return col[idx];
  }

  delete(collection, id) {
    const col = this._collection(collection);
    const idx = col.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    col.splice(idx, 1);
    this._dirty = true;
    return true;
  }

  // ─── User helpers ───────────────────────────────────────────

  getUserByEmail(email) {
    return this.findOne('users', (u) => u.email === email);
  }

  getUserById(id) {
    return this.getById('users', id);
  }

  // ─── Portfolio helpers ──────────────────────────────────────

  getPortfolio(userId) {
    return this.findOne('portfolios', (p) => p.userId === userId);
  }

  // ─── Trade helpers ──────────────────────────────────────────

  getUserTrades(userId) {
    return this.find('trades', (t) => t.userId === userId);
  }

  // ─── Watchlist helpers ──────────────────────────────────────

  getWatchlist(userId) {
    return this.findOne('watchlists', (w) => w.userId === userId);
  }

  // ─── Strategy helpers ──────────────────────────────────────

  getUserStrategies(userId) {
    return this.find('strategies', (s) => s.userId === userId);
  }
}

// Singleton
const store = new DataStore();
export default store;
