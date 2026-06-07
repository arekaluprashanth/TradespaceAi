import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key';

// Middleware to protect routes
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Unauthorized' });

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get Portfolio
router.get('/portfolio', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { portfolios: true }
    });
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      walletBalance: user.walletBalance,
      holdings: user.portfolios
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Execute Trade (Buy/Sell)
router.post('/trade', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { symbol, type, quantity, price } = req.body; // type: "BUY" or "SELL"

    if (!symbol || !type || quantity <= 0 || price <= 0) {
      return res.status(400).json({ error: 'Invalid trade parameters' });
    }

    const totalAmount = quantity * price;

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      let portfolio = await tx.portfolio.findUnique({
        where: { userId_symbol: { userId, symbol } }
      });

      if (type === 'BUY') {
        if (user.walletBalance < totalAmount) {
          throw new Error('Insufficient funds');
        }

        // Deduct balance
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: user.walletBalance - totalAmount }
        });

        // Add to portfolio
        if (portfolio) {
          const newQuantity = portfolio.quantity + quantity;
          const newAvgPrice = ((portfolio.quantity * portfolio.averagePrice) + totalAmount) / newQuantity;
          await tx.portfolio.update({
            where: { id: portfolio.id },
            data: { quantity: newQuantity, averagePrice: newAvgPrice }
          });
        } else {
          await tx.portfolio.create({
            data: { userId, symbol, quantity, averagePrice: price }
          });
        }

      } else if (type === 'SELL') {
        if (!portfolio || portfolio.quantity < quantity) {
          throw new Error('Insufficient shares to sell');
        }

        // Add to balance
        await tx.user.update({
          where: { id: userId },
          data: { walletBalance: user.walletBalance + totalAmount }
        });

        // Remove from portfolio
        const newQuantity = portfolio.quantity - quantity;
        if (newQuantity === 0) {
          await tx.portfolio.delete({ where: { id: portfolio.id } });
        } else {
          await tx.portfolio.update({
            where: { id: portfolio.id },
            data: { quantity: newQuantity }
          });
        }
      }

      // Record trade history
      await tx.trade.create({
        data: { userId, symbol, type, quantity, price }
      });
    });

    res.json({ success: true, message: `Successfully executed ${type} order for ${symbol}` });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Trade failed' });
  }
});

// Get Trade History
router.get('/history', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
