'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Users, Settings, Home, Plus, List, LogOut, User } from 'lucide-react';
import { useRequireAdmin } from '@/hooks/useAuth';

const navigation = [
  { name: 'Overview', href: '/admin', icon: Home },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen },
  { name: 'Create Course', href: '/admin/courses/create', icon: Plus },
  { name: 'Instructors', href: '/admin/instructors', icon: Users },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Always call the hook (React Hook rules)
  const authData = useRequireAdmin();
  const { user, wallet, logout, isLoading } = authData;
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Verificando permisos de administrador...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center px-6 border-b">
          <Link href="/admin" className="flex items-center">
            <BookOpen className="h-8 w-8 text-yellow-500" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Celo Academy Admin
            </span>
          </Link>
        </div>
        
        <nav className="mt-6 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href as any}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <div className="sticky top-0 z-40 bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                Admin Dashboard
              </h1>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-sm">
                      {user?.email?.slice(0, 1).toUpperCase() || wallet.address?.slice(2, 4).toUpperCase() || 'A'}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">
                        {user?.email || (wallet.address ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}` : 'Admin User')}
                      </span>
                      <span className="text-xs text-gray-500">{isDevelopment ? 'Admin (Dev Mode)' : 'Admin'}</span>
                    </div>
                  </div>
                  {logout && (
                    <button
                      onClick={() => logout()}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Salir
                    </button>
                  )}
                </div>
                <Link
                  href="/"
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  ← Back to Site
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}