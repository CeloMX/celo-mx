import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Missing slug' }, { status: 400 })
    }

    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const count = await prisma.courseEnrollment.count({
      where: { courseId: course.id }
    })

    return NextResponse.json({ count }, { status: 200 })
  } catch (error) {
    console.error('[API] enrollment-count error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
