import { prisma } from '@/lib/db';
import { BookOpen, Users, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default async function AdminOverview() {
  // Get stats from database
  let stats = {
    courses: 0,
    modules: 0,
    lessons: 0,
    instructors: 0,
  };

  try {
    const [courses, modules, lessons, instructors] = await Promise.all([
      prisma.course.count(),
      prisma.module.count(),
      prisma.lesson.count(),
      prisma.instructor.count(),
    ]);

    stats = { courses, modules, lessons, instructors };
  } catch (error) {
    console.error('Error fetching stats:', error);
  }

  // Get recent courses
  let recentCourses: any[] = [];
  try {
    recentCourses = await prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { 
        Category: true,
        Level: true,
        _count: { select: { Module: true } }
      },
    });
  } catch (error) {
    console.error('Error fetching recent courses:', error);
  }

  const statCards = [
    { 
      name: 'Total Courses', 
      value: stats.courses, 
      icon: BookOpen, 
      color: 'bg-blue-500',
      href: '/admin/courses'
    },
    { 
      name: 'Instructors', 
      value: stats.instructors, 
      icon: Users, 
      color: 'bg-green-500',
      href: '/admin/instructors'
    },
    { 
      name: 'Total Modules', 
      value: stats.modules, 
      icon: FileText, 
      color: 'bg-yellow-500',
      href: '/admin/courses'
    },
    { 
      name: 'Total Lessons', 
      value: stats.lessons, 
      icon: TrendingUp, 
      color: 'bg-purple-500',
      href: '/admin/courses'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Link
            key={stat.name}
            href={stat.href as any}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border"
          >
            <div className="flex items-center">
              <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">{stat.name}</h3>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Courses</h2>
            <Link 
              href="/admin/courses/create"
              className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              Create Course
            </Link>
          </div>
        </div>
        
        {recentCourses.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {recentCourses.map((course) => (
              <div key={course.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {course.subtitle}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {course.Level?.name || 'No Level'}
                        </span>
                      </span>
                      <span className="flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {course.Category?.name || 'No Category'}
                        </span>
                      </span>
                      <span>{course._count.Module} modules</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        course.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {course.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/courses/${course.id}` as any}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/academy/${course.slug}`}
                      className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                      target="_blank"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900">No courses</h3>
            <p className="mt-2 text-sm text-gray-500">
              Get started by creating your first course.
            </p>
            <Link
              href="/admin/courses/create"
              className="mt-4 inline-flex items-center bg-yellow-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-600 transition-colors"
            >
              Create Course
            </Link>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/courses/create"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
          >
            <BookOpen className="h-8 w-8 text-yellow-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Create Course</h3>
              <p className="text-sm text-gray-500">Add a new course to the academy</p>
            </div>
          </Link>
          
          <Link
            href="/admin/instructors"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
          >
            <Users className="h-8 w-8 text-green-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">Manage Instructors</h3>
              <p className="text-sm text-gray-500">Add or edit course instructors</p>
            </div>
          </Link>
          
          <Link
            href="/academy"
            target="_blank"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-900">View Academy</h3>
              <p className="text-sm text-gray-500">See the live academy site</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}