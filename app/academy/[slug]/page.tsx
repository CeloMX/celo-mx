import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import RenderMdx from '@/components/mdx/RenderMdx'
import LessonLayout from '@/components/academy/LessonLayout'
import { getCourseBySlug, COURSES } from '@/data/academy'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      select: { slug: true }
    })
    return courses.map(course => ({ slug: course.slug }))
  } catch (error) {
    console.error('Error generating static params:', error)
    // Fallback to static data if database fails
    return COURSES.map((course) => ({ slug: course.slug }))
  }
}

export default async function CoursePage(props: any) {
  const { params, searchParams } = props as { params:{ slug:string }, searchParams?:{ m?:string; s?:string } }
  const awaitedParams = await params
  const awaitedSearchParams = await searchParams
  const m = awaitedSearchParams?.m ? Math.max(1, parseInt(String(awaitedSearchParams.m), 10)) : null
  const s = awaitedSearchParams?.s ? Math.max(1, parseInt(String(awaitedSearchParams.s), 10)) : null

  // Get course from database
  const course = await prisma.course.findUnique({
    where: { slug: awaitedParams.slug },
    include: {
      Module: {
        include: {
          Lesson: true
        },
        orderBy: { index: 'asc' }
      }
    }
  })
  
  if (!course) return notFound()
  
  const courseWithRels = {
    id: course.id,
    slug: course.slug,
    title: course.title,
    subtitle: course.subtitle,
    status: course.status,
    visibility: course.visibility,
    modules: course.Module.map(module => ({
      id: module.id,
      index: module.index,
      title: module.title,
      summary: module.summary,
      lessons: module.Lesson.map(lesson => ({
        id: lesson.id,
        index: lesson.index,
        title: lesson.title,
        contentMdx: lesson.contentMdx || '',
        status: lesson.status,
        visibility: lesson.visibility
      }))
    }))
  }

  // If no modules exist or no lesson parameters provided, show course overview
  if (courseWithRels.modules.length === 0 || !m || !s) {
    const { CourseDetailClient } = await import('./CourseDetailClient')
    
    // Transform course data for CourseDetailClient
    const courseForClient = {
      id: course.id,
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle || '',
      level: 'Principiante' as const, // Default level, could be enhanced with DB field
      category: 'Desarrollo', // Default category, could be enhanced with DB field
      tags: ['blockchain', 'celo', 'web3'], // Default tags
      learners: 0, // Could be enhanced with enrollment count
      rating: 4.8, // Default rating, could be enhanced with reviews system
      ratingCount: 0,
      durationHours: 0, // Could be calculated from modules/lessons
      lessonsCount: courseWithRels.modules.reduce((total, mod) => total + mod.lessons.length, 0),
      isFree: true, // Default, could be enhanced with pricing
      priceUSD: 0,
      coverUrl: '/images/course-placeholder.jpg', // Placeholder
      promoVideoUrl: undefined, // Could be enhanced with promo videos
      outcomes: ['Comprender los fundamentos de blockchain', 'Desarrollar en Celo'], // Default outcomes
      prerequisites: [], // Could be enhanced with prerequisites
      modules: courseWithRels.modules.map(module => ({
        index: module.index,
        title: module.title,
        summary: module.summary || '',
        submodules: module.lessons.map(lesson => ({
          index: lesson.index,
          title: lesson.title,
          summary: '',
          content: lesson.contentMdx,
          items: [] // Enhanced curriculum structure could be added here
        }))
      })),
      instructor: {
        name: 'Celo Mexico Team',
        title: 'Blockchain Educators',
        avatarUrl: '/images/instructor-placeholder.jpg',
        bio: 'Expertos en desarrollo blockchain y el ecosistema Celo, dedicados a enseñar las mejores prácticas en Web3.'
      },
      createdAt: course.createdAt?.toISOString() || new Date().toISOString()
    }
    
    return <CourseDetailClient course={courseForClient} />
  }

  // Show lesson content if specific lesson is requested
  const mod = courseWithRels.modules.find((mm: any) => mm.index === m)
  const lesson = mod?.lessons.find((ll: any) => ll.index === s)
  if (!mod || !lesson || lesson.status !== 'PUBLISHED') return notFound()

  return (
    <LessonLayout 
      course={courseWithRels} 
      current={{ moduleIndex: m, subIndex: s }}
    >
      <RenderMdx source={lesson.contentMdx ?? ''} />
    </LessonLayout>
  )
}
