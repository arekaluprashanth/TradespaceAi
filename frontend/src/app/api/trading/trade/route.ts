import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { symbol, type, quantity, price } = await request.json(); // type: "BUY" or "SELL"

    if (!symbol || !type || quantity <= 0 || price <= 0) {
      return NextResponse.json({ error: 'Invalid trade parameters' }, { status: 400 });
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

    return NextResponse.json({ success: true, message: `Successfully executed ${type} order for ${symbol}` });
  } catch (error: any) {
    console.error('Trade error:', error);
    return NextResponse.json({ error: error.message || 'Trade failed' }, { status: 400 });
  }
}
