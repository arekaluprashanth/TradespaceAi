import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { portfolios: true }
    });
    
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    
    return NextResponse.json({
      walletBalance: user.walletBalance,
      holdings: user.portfolios
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
