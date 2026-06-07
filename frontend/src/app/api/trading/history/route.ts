import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const trades = await prisma.trade.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
      take: 50
    });
    
    return NextResponse.json(trades);
  } catch (error) {
    console.error('History error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
