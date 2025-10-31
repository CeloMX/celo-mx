import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthenticatedUser } from '@/lib/auth-server'
import { PublishStatus, LessonProgressStatus } from '@prisma/client'

// GET /api/courses/[slug]/reviews/eligibility
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const auth = await getAuthenticatedUser(request)
    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ canReview: false, reason: 'NOT_AUTHENTICATED' })
    }

    const course = await prisma.course.findUnique({ where: { slug }, select: { id: true } })
    if (!course) return NextResponse.json({ canReview: false, reason: 'COURSE_NOT_FOUND' })

    // Find user by walletAddress from auth (if available)
    const wallet = (auth.user as any)?.wallet?.address?.toLowerCase?.() || null
    const user = wallet ? await prisma.user.findUnique({ where: { walletAddress: wallet } }) : null
    if (!user) return NextResponse.json({ canReview: false, reason: 'NO_USER' })

    // Enrollment check
    const enrolled = await prisma.courseEnrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      select: { userId: true }
    })
    if (!enrolled) return NextResponse.json({ canReview: false, reason: 'NOT_ENROLLED' })

    // Completion check: all published lessons completed
    const publishedLessons = await prisma.lesson.findMany({
      where: { Module: { courseId: course.id }, status: PublishStatus.PUBLISHED },
      select: { id: true }
    })
    const publishedIds = publishedLessons.map(l => l.id)
    if (publishedIds.length === 0) return NextResponse.json({ canReview: false, reason: 'NO_PUBLISHED_LESSONS' })

    const completedCount = await prisma.userLessonProgress.count({
      where: { userId: user.id, lessonId: { in: publishedIds }, status: LessonProgressStatus.COMPLETED }
    })
    const canReview = completedCount === publishedIds.length
    return NextResponse.json({ canReview, reason: canReview ? undefined : 'NOT_COMPLETED' })
  } catch (e) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
