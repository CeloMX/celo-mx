import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET single course by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        Category: true,
        Level: true,
        Module: {
          include: {
            Lesson: {
              orderBy: { index: 'asc' }
            }
          },
          orderBy: { index: 'asc' }
        },
        CourseInstructor: {
          include: {
            Instructor: true
          }
        },
        _count: {
          select: {
            Module: true,
            CourseEnrollment: true
          }
        }
      }
    });

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json(
      { error: 'Failed to fetch course' },
      { status: 500 }
    );
  }
}

// PUT - Update course
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const {
      title,
      subtitle,
      slug,
      categoryId,
      levelId,
      coverUrl,
      promoVideoUrl,
      durationHours,
      isFree,
      status,
      visibility,
      Module: modules
    } = body;

    // Update course with modules and lessons in a transaction
    const updatedCourse = await prisma.$transaction(async (tx) => {
      // Update the main course data
      const course = await tx.course.update({
        where: { id: params.id },
        data: {
          title,
          subtitle,
          slug,
          categoryId: categoryId || null,
          levelId: levelId || null,
          coverUrl: coverUrl || null,
          promoVideoUrl: promoVideoUrl || null,
          durationHours,
          isFree,
          status,
          visibility: visibility || 'PUBLIC',
        }
      });

      // If modules are provided, update them
      if (modules && Array.isArray(modules)) {
        // Delete existing modules and lessons (cascade)
        await tx.module.deleteMany({
          where: { courseId: params.id }
        });

        // Create new modules and lessons
        for (let i = 0; i < modules.length; i++) {
          const moduleData = modules[i];
          
          const newModule = await tx.module.create({
            data: {
              courseId: params.id,
              index: i + 1,
              title: moduleData.title || `Module ${i + 1}`,
              summary: moduleData.summary || '',
            }
          });

          // Create lessons for this module
          if (moduleData.Lesson && Array.isArray(moduleData.Lesson)) {
            for (let j = 0; j < moduleData.Lesson.length; j++) {
              const lessonData = moduleData.Lesson[j];
              
              await tx.lesson.create({
                data: {
                  moduleId: newModule.id,
                  index: j + 1,
                  title: lessonData.title || `Lesson ${j + 1}`,
                  summary: lessonData.summary || '',
                  contentMdx: lessonData.contentMdx || '',
                  status: 'PUBLISHED',
                  visibility: 'PUBLIC',
                }
              });
            }
          }
        }

        // Update lessons count
        const totalLessons = modules.reduce((total: number, module: any) => {
          return total + (module.Lesson?.length || 0);
        }, 0);

        await tx.course.update({
          where: { id: params.id },
          data: {
            lessonsCount: totalLessons
          }
        });
      }

      return course;
    });

    // Fetch the updated course with relations
    const courseWithRelations = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        Category: true,
        Level: true,
        Module: {
          include: {
            Lesson: {
              orderBy: { index: 'asc' }
            }
          },
          orderBy: { index: 'asc' }
        }
      }
    });

    return NextResponse.json(courseWithRelations);
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json(
      { error: 'Failed to update course' },
      { status: 500 }
    );
  }
}

// DELETE - Delete course
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Delete course (this will cascade to modules, lessons, etc.)
    await prisma.course.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json(
      { error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}