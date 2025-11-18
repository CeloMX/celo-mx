import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request as unknown as Request)
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const purchases = await prisma.purchase.findMany({
      where: { userid: auth.user.id },
      orderBy: { createdat: 'desc' },
      take: 500,
      select: { id: true, itemid: true, txhash: true, amount: true, selectedsize: true, createdat: true }
    })
    return NextResponse.json({ purchases })
  } catch (error) {
    return NextResponse.json({ purchases: [], warning: 'db_unavailable_fallback' })
  }
}
