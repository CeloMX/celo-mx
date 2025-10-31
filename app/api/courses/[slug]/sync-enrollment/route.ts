import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({} as any))
    const wallet = typeof body?.address === 'string' ? String(body.address).toLowerCase() : null
    if (!wallet) {
      return NextResponse.json({ error: 'Missing address in request body' }, { status: 400 })
    }

    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Ensure user exists and enrollment is recorded (idempotent)
    const user = await prisma.user.upsert({
      where: { walletAddress: wallet },
      update: { updatedAt: new Date() },
      create: { id: randomUUID(), walletAddress: wallet, updatedAt: new Date() }
    })

    await prisma.courseEnrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: {},
      create: { id: randomUUID(), userId: user.id, courseId: course.id }
    })

    const count = await prisma.courseEnrollment.count({ where: { courseId: course.id } })

    // Revalidate pages that display this count
    try {
      revalidatePath('/academy')
      revalidatePath(`/academy/${slug}`)
    } catch {}

    return NextResponse.json({ success: true, count }, { status: 200 })
  } catch (error) {
    console.error('[API] sync-enrollment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
