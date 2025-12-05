import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function norm(addr?: string | null) {
  return (addr || '').trim() || null
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const wallet = norm(url.searchParams.get('wallet'))
    const smart = norm(url.searchParams.get('smartAccount'))
    const userId = (url.searchParams.get('userId') || '').trim() || null

    if (!wallet && !smart && !userId) {
      return NextResponse.json({ purchases: [], error: 'Missing wallet, smartAccount, or userId' }, { status: 400 })
    }

    let user = null as { id: string } | null
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } })
    }
    if (!user && wallet) {
      user = await prisma.user.findFirst({ where: { walletAddress: { equals: wallet, mode: 'insensitive' } }, select: { id: true } })
    }
    if (!user && smart) {
      user = await prisma.user.findFirst({ where: { smartAccount: { equals: smart, mode: 'insensitive' } }, select: { id: true } })
    }

    // If wallet given but user not found, and smart provided, attempt to link wallet to smart user
    if (!user && wallet && smart) {
      const smartUser = await prisma.user.findFirst({ where: { smartAccount: { equals: smart, mode: 'insensitive' } }, select: { id: true } })
      if (smartUser) {
        try {
          await prisma.user.update({ where: { id: smartUser.id }, data: { walletAddress: wallet } })
          user = smartUser
        } catch {}
      }
    }

    if (!user) {
      return NextResponse.json({ purchases: [] }, { status: 200 })
    }

    const purchases = await prisma.purchase.findMany({
      where: { userid: user.id },
      orderBy: { createdat: 'desc' },
      take: 500,
      include: {
        MerchItem: { select: { id: true, name: true, image: true, price: true, category: true, sizes: true, stock: true } }
      }
    })

    const items = purchases.map((p) => ({
      id: p.MerchItem.id,
      name: p.MerchItem.name,
      image: p.MerchItem.image,
      price: p.MerchItem.price,
      category: p.MerchItem.category,
      sizes: p.MerchItem.sizes,
      stock: p.MerchItem.stock ?? 0,
      txHash: p.txhash,
      selectedSize: p.selectedsize || null,
      purchasedAt: p.createdat,
    }))

    return NextResponse.json({ purchases: items })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
