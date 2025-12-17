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
    console.error('[API] merch items GET error:', error)
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
    const { id, name, description, price, image, images, video, category, sizes, stock, tag } = body as {
      id: string
      name: string
      description?: string
      price: number
      image: string
      images?: string[]
      video?: string | null
      category: string
      sizes?: string[]
      stock?: number
      tag?: string | null
    }
    if (!id || !name || !price || !image || !category) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const item = await prisma.merchItem.upsert({
      where: { id },
      update: { 
        name, 
        description: description || null, 
        price, 
        image, 
        images: images || [], 
        video: video || null,
        category, 
        sizes: sizes || [], 
        stock: stock ?? 0, 
        tag: tag || null 
      },
      create: { 
        id, 
        name, 
        description: description || null, 
        price, 
        image, 
        images: images || [], 
        video: video || null,
        category, 
        sizes: sizes || [], 
        stock: stock ?? 0, 
        tag: tag || null 
      }
    })
    return NextResponse.json({ item })
  } catch (error) {
    console.error('[API] merch items POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
