import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

// ── Engine & Store ─────────────────────────────────────────
import { MarketEngine } from './engine/marketEngine.js';
import store from './store/dataStore.js';

// ── Routes ─────────────────────────────────────────────────
import authRoutes from './routes/auth.js';
import marketRoutes, { setMarketEngine as setMarketRouteEngine } from './routes/market.js';
import portfolioRoutes, { setMarketEngine as setPortfolioEngine } from './routes/portfolio.js';
import watchlistRoutes from './routes/watchlist.js';
import strategiesRoutes, { setMarketEngine as setStrategiesEngine } from './routes/strategies.js';

// ─── Config ────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || '*';

// ─── Express App ───────────────────────────────────────────
const app = express();

app.use(cors({
  origin: CLIENT_ORIGIN === '*' ? true : CLIENT_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));

// Basic rate limiting for API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', apiLimiter);

// ─── Boot Sequence ─────────────────────────────────────────

// 1. Load persisted data
store.load();

// 2. Initialise market engine & generate 200 historical candles
const engine = new MarketEngine();
engine.generateHistory(200);

// 3. Inject engine into routes that need it
setMarketRouteEngine(engine);
setPortfolioEngine(engine);
setStrategiesEngine(engine);

// ─── Mount Routes ──────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/strategies', strategiesRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), time: new Date().toISOString() });
});

// ─── Serve built frontend if available ───────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../../client/dist');

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  app.get(/^\/(?!api|socket\.io).*/, (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// ─── Market Simulation Loop ───────────────────────────────
// Tick every 2 seconds to update internal engine state
const TICK_INTERVAL = 2_000;

setInterval(() => {
  engine.tick();
}, TICK_INTERVAL);

// ─── Start Server ──────────────────────────────────────────
// Only start listening if we are NOT running in Vercel
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const getLocalIp = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) return iface.address;
      }
    }
    return 'localhost';
  };

  app.listen(PORT, '0.0.0.0', () => {
    const ip = getLocalIp();
    console.log('');
    console.log('╔══════════════════════════════════════════════╗');
    console.log('║       TradeSphere AI — Server Running        ║');
    console.log('╠══════════════════════════════════════════════╣');
    console.log(`║  HTTP   → http://${ip}:${PORT}                    ║`);
    console.log(`║  Client → ${CLIENT_ORIGIN}         ║`);
    console.log('║  Tick   → every 2 seconds                    ║');
    console.log('╚══════════════════════════════════════════════╝');
    console.log('');
  });
}

// Export for Vercel Serverless Functions
export default app;
