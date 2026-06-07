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

// Mock AI Logic to generate insight
const generateInsight = (symbol: string) => {
  const predictions = ['BULLISH', 'BEARISH', 'NEUTRAL'];
  const prediction = predictions[Math.floor(Math.random() * predictions.length)];
  const confidence = Math.round((0.5 + Math.random() * 0.49) * 100) / 100; // 0.50 to 0.99
  
  let insight = '';
  if (prediction === 'BULLISH') insight = `${symbol} shows strong upward momentum due to recent earnings beats and positive sector sentiment.`;
  else if (prediction === 'BEARISH') insight = `Technical indicators for ${symbol} suggest a short-term pullback. RSI is overbought.`;
  else insight = `${symbol} is consolidating. Wait for a breakout above the resistance level.`;

  return { prediction, confidence, insight };
};

// Get AI Prediction for a Stock
router.get('/prediction/:symbol', requireAuth, async (req, res) => {
  try {
    const userId = (req as any).userId;
    const { symbol } = req.params;

    // For demonstration, we just mock the AI. In production, this would call OpenAI/Gemini
    const aiData = generateInsight(symbol.toUpperCase());

    const predictionRecord = await prisma.aIPrediction.create({
      data: {
        userId,
        symbol: symbol.toUpperCase(),
        prediction: aiData.prediction,
        confidence: aiData.confidence,
        insight: aiData.insight
      }
    });

    res.json(predictionRecord);
  } catch (error) {
    res.status(500).json({ error: 'Server error generating AI prediction' });
  }
});

// AI Chatbot endpoint
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    
    // Extremely basic mock chatbot response
    let reply = "I'm your AI Trading Assistant. I can analyze stocks and manage risk.";
    if (message.toLowerCase().includes('apple') || message.toLowerCase().includes('aapl')) {
      reply = "Apple (AAPL) is currently showing a bullish trend based on our momentum indicators.";
    } else if (message.toLowerCase().includes('risk')) {
      reply = "Your portfolio risk is currently moderate. Diversifying into index funds might lower your overall volatility.";
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: 'AI Chatbot error' });
  }
});

export default router;
