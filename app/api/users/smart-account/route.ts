import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser, getUserWalletAddress } from '@/lib/auth-server';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request as unknown as Request);
    const userId = (auth as any)?.user?.id as string | undefined;

    const body = await request.json().catch(() => ({}));
    const smartAccount = (body.smartAccount as string | undefined)?.toLowerCase();
    if (!smartAccount || !smartAccount.startsWith('0x') || smartAccount.length !== 42) {
      return NextResponse.json({ error: 'Invalid smart account address' }, { status: 400 });
    }

    // Prefer wallet from auth; fallback to body
    const wallet = (
      getUserWalletAddress((auth as any)?.user) ||
      (body.walletAddress as string | undefined) ||
      ''
    ).toLowerCase();

    // 1) Try update by auth user ID first
    if (auth.isAuthenticated && userId) {
      try {
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { smartAccount, updatedAt: new Date() },
          select: { id: true, walletAddress: true, smartAccount: true },
        });
        return NextResponse.json({ user: updated }, { status: 200 });
      } catch (error) {
        console.warn('Smart account update by userId failed, falling back to wallet path:', error);
        // continue to wallet-based path
      }
    }

    // 2) Wallet-based create-or-update (only create if not exists)
    if (!wallet || !wallet.startsWith('0x') || wallet.length !== 42) {
      return NextResponse.json({ error: 'No valid wallet to create or update' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { walletAddress: wallet } });

    if (existing) {
      const updated = await prisma.user.update({
        where: { id: existing.id },
        data: { smartAccount, updatedAt: new Date() },
        select: { id: true, walletAddress: true, smartAccount: true },
      });
      return NextResponse.json({ user: updated }, { status: 200 });
    }

    const created = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        walletAddress: wallet,
        smartAccount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      select: { id: true, walletAddress: true, smartAccount: true },
    });

    return NextResponse.json({ user: created }, { status: 200 });
  } catch (error) {
    console.error('Register smart account error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
