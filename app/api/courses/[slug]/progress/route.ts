import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthenticatedUser } from '@/lib/auth-server';
import { PublishStatus, LessonProgressStatus } from '@prisma/client';
import { randomUUID } from 'crypto';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const auth = await getAuthenticatedUser(request);

    if (!auth.isAuthenticated || !auth.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const course = await prisma.course.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Get user from wallet
    const wallet = (auth.user as any)?.wallet?.address?.toLowerCase?.() || null;
    let user = wallet ? await prisma.user.findUnique({ where: { walletAddress: wallet } }) : null;

    if (!user && wallet) {
      user = await prisma.user.create({
        data: { id: randomUUID(), walletAddress: wallet, updatedAt: new Date() } as any,
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all published lessons in the course
    const publishedLessons = await prisma.lesson.findMany({
      where: {
        Module: { courseId: course.id },
        status: PublishStatus.PUBLISHED,
      },
      select: { id: true },
    });

    const publishedLessonIds = publishedLessons.map((l) => l.id);

    if (publishedLessonIds.length === 0) {
      return NextResponse.json({
        completionPercentage: 0,
        completedLessons: 0,
        totalLessons: 0,
      });
    }

    // Count completed lessons
    const completedCount = await prisma.userLessonProgress.count({
      where: {
        userId: user.id,
        lessonId: { in: publishedLessonIds },
        status: LessonProgressStatus.COMPLETED,
      },
    });

    const completionPercentage = Math.round((completedCount / publishedLessonIds.length) * 100);

    return NextResponse.json({
      completionPercentage,
      completedLessons: completedCount,
      totalLessons: publishedLessonIds.length,
    });
  } catch (error) {
    console.error('Error fetching course progress:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
