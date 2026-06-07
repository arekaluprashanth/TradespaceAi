import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});
const prisma = new PrismaClient();

import tradingRoutes from './routes/trading';
import aiRoutes from './routes/ai';

app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

// --- ROUTES ---
app.use('/api/trading', tradingRoutes);
app.use('/api/ai', aiRoutes);

// --- AUTH ROUTES ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, walletBalance: user.walletBalance } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, walletBalance: user.walletBalance } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- WEBSOCKET REALTIME ENGINE ---

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  // Simulate realtime price updates
  const priceInterval = setInterval(() => {
    socket.emit('price_update', {
      symbol: 'AAPL',
      price: 150 + Math.random() * 10 - 5,
      timestamp: Date.now()
    });
    socket.emit('price_update', {
      symbol: 'TSLA',
      price: 200 + Math.random() * 15 - 7.5,
      timestamp: Date.now()
    });
  }, 2000);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    clearInterval(priceInterval);
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
