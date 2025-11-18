import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request as unknown as Request)
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = new URL(request.url)
    const itemId = url.searchParams.get('itemId') || undefined
    const purchases = await prisma.purchase.findMany({
      where: itemId ? { itemid: itemId } : undefined,
      orderBy: { createdat: 'desc' },
      take: 500
    })
    return NextResponse.json({ purchases })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
