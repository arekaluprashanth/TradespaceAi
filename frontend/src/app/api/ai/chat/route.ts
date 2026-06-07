import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    
    // Extremely basic mock chatbot response
    let reply = "I'm your AI Trading Assistant. I can analyze stocks and manage risk.";
    if (message.toLowerCase().includes('apple') || message.toLowerCase().includes('aapl')) {
      reply = "Apple (AAPL) is currently showing a bullish trend based on our momentum indicators.";
    } else if (message.toLowerCase().includes('risk')) {
      reply = "Your portfolio risk is currently moderate. Diversifying into index funds might lower your overall volatility.";
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'AI Chatbot error' }, { status: 500 });
  }
}
