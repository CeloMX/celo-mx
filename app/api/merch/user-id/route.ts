import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function norm(addr?: string | null) {
  return (addr || '').toLowerCase().trim() || null
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const wallet = norm(url.searchParams.get('wallet'))
    const smart = norm(url.searchParams.get('smartAccount'))
    let userId: string | null = null
    if (wallet) {
      const byWallet = await prisma.user.findUnique({ where: { walletAddress: wallet }, select: { id: true } })
      userId = byWallet?.id || null
    }
    if (!userId && smart) {
      const bySmart = await prisma.user.findFirst({ where: { smartAccount: smart }, select: { id: true } })
      userId = bySmart?.id || null
    }
    return NextResponse.json({ userId })
  } catch (error) {
    return NextResponse.json({ userId: null }, { status: 200 })
  }
}
