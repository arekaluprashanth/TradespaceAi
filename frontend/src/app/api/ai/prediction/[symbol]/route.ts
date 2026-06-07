import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

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

export async function GET(request: NextRequest, context: { params: Promise<{ symbol: string }> }) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol } = await context.params;
    const upperSymbol = symbol.toUpperCase();
    const aiData = generateInsight(upperSymbol);

    const predictionRecord = await prisma.aIPrediction.create({
      data: {
        userId,
        symbol: upperSymbol,
        prediction: aiData.prediction,
        confidence: aiData.confidence,
        insight: aiData.insight
      }
    });

    return NextResponse.json(predictionRecord);
  } catch (error) {
    console.error('Prediction error:', error);
    return NextResponse.json({ error: 'Server error generating AI prediction' }, { status: 500 });
  }
}
