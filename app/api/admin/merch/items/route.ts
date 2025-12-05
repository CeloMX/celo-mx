import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request as unknown as Request)
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const items = await prisma.merchItem.findMany({})
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuthenticatedUser(request as unknown as Request)
    if (!auth.isAuthenticated || !auth.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const { id, name, description, price, image, category, sizes, stock } = body as {
      id: string
      name: string
      description?: string
      price: number
      image: string
      category: string
      sizes?: string[]
      stock?: number
    }
    if (!id || !name || !price || !image || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const item = await prisma.merchItem.upsert({
      where: { id },
      update: { name, description: description || null, price, image, category, sizes: sizes || [], stock: stock ?? 0 },
      create: { id, name, description: description || null, price, image, category, sizes: sizes || [], stock: stock ?? 0 }
    })
    return NextResponse.json({ item })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
