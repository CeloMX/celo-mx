import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { PublishStatus, LessonProgressStatus } from '@prisma/client'
import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'

// GET /api/courses/[slug]/reviews/me
// PATCH /api/courses/[slug]/reviews/me
// DELETE /api/courses/[slug]/reviews/me
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const auth = await getAuthenticatedUser(request)
    if (!auth.isAuthenticated || !auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    const wallet = (auth.user as any)?.wallet?.address?.toLowerCase?.() || null
    const user = wallet ? await prisma.user.findUnique({ where: { walletAddress: wallet } }) : null
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const review = await prisma.courseReview.findUnique({ where: { userid_courseid: { userid: user.id, courseid: course.id } } })
    if (!review) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ review })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const auth = await getAuthenticatedUser(request)
    if (!auth.isAuthenticated || !auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    const body = await request.json().catch(() => null)
    const rating = body?.rating
    const comment = body?.comment ?? undefined
    if (rating !== undefined && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
    }

    const wallet = (auth.user as any)?.wallet?.address?.toLowerCase?.() || null
    let user = wallet ? await prisma.user.findUnique({ where: { walletAddress: wallet } }) : null
    if (!user && wallet) user = await prisma.user.create({ data: { id: randomUUID(), walletAddress: wallet, updatedAt: new Date() } as any })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await prisma.courseReview.upsert({
      where: { userid_courseid: { userid: user.id, courseid: course.id } },
      update: { rating, comment },
      create: { id: randomUUID(), userid: user.id, courseid: course.id, rating: rating ?? 5, comment },
    })

    try { revalidatePath('/academy'); revalidatePath(`/academy/${slug}`) } catch {}

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const auth = await getAuthenticatedUser(request)
    if (!auth.isAuthenticated || !auth.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    const wallet = (auth.user as any)?.wallet?.address?.toLowerCase?.() || null
    const user = wallet ? await prisma.user.findUnique({ where: { walletAddress: wallet } }) : null
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    await prisma.courseReview.delete({ where: { userid_courseid: { userid: user.id, courseid: course.id } } })
    try { revalidatePath('/academy'); revalidatePath(`/academy/${slug}`) } catch {}
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
