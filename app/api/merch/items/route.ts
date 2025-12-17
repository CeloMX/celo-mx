import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { merchItems as FALLBACK_ITEMS } from '@/config/merch'

export async function GET(request: NextRequest) {
  try {
    const items = await prisma.merchItem.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        image: true,
        images: true,
        video: true,
        category: true,
        sizes: true,
        tag: true,
        stock: true,
      }
    })
    return NextResponse.json({ items })
  } catch (error) {
    const items = (FALLBACK_ITEMS || []).map((it) => ({
      ...it,
      stock: typeof (it as any).stock === 'number' ? (it as any).stock : 0,
      isActive: typeof (it as any).isActive === 'boolean' ? (it as any).isActive : true,
    }))
    return NextResponse.json({ items, warning: 'db_unavailable_fallback' })
  }
}
