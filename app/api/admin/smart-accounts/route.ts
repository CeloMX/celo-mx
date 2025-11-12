import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth-server';

// GET /api/admin/smart-accounts -> list users with registered smartAccountAddress
export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request as unknown as Request);
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      where: { smartAccount: { not: null } },
      select: {
        id: true,
        walletAddress: true,
        smartAccount: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('List smart accounts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}