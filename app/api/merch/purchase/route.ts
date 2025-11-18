import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, getUserWalletAddress } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request as unknown as Request)
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, txHash, amount, selectedSize, smartAccount } = body as { itemId: string; txHash: string; amount: number; selectedSize?: string; smartAccount?: string }
    if (!itemId || !txHash || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const item = await prisma.merchItem.findUnique({ where: { id: itemId } })
    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }
    if ((item.stock ?? 0) <= 0) {
      return NextResponse.json({ error: 'Out of stock' }, { status: 409 })
    }
    if (Array.isArray(item.sizes) && selectedSize && !item.sizes.includes(selectedSize)) {
      return NextResponse.json({ error: 'Invalid size' }, { status: 400 })
    }

    // Ensure we have a DB user id (create user if missing using wallet)
    const wallet = getUserWalletAddress(auth.user)
    const existingUser = wallet
      ? await prisma.user.findUnique({ where: { walletAddress: wallet }, select: { id: true } })
      : null
    let userId = existingUser?.id
    if (!userId) {
      const bySmart = smartAccount
        ? await prisma.user.findFirst({ where: { smartAccount }, select: { id: true } })
        : null
      userId = bySmart?.id
      if (!userId) {
        const created = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            walletAddress: wallet ?? undefined,
            smartAccount: smartAccount ?? undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          select: { id: true }
        })
        userId = created.id
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.merchItem.updateMany({
        where: { id: itemId, stock: { gt: 0 } },
        data: { stock: { decrement: 1 } }
      })
      if (updated.count === 0) {
        throw new Error('Out of stock')
      }
      const purchase = await tx.purchase.create({
        data: {
          userid: userId!,
          itemid: itemId,
          txhash: txHash,
          amount,
          selectedsize: selectedSize || null,
        }
      })
      const refreshedItem = await tx.merchItem.findUnique({ where: { id: itemId }, select: { id: true, stock: true } })
      return { purchase, item: refreshedItem }
    })

    return NextResponse.json({ purchase: result.purchase, item: result.item })
  } catch (error: any) {
    if (typeof error?.message === 'string' && error.message.includes('Out of stock')) {
      return NextResponse.json({ error: 'Out of stock' }, { status: 409 })
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Duplicate transaction' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
