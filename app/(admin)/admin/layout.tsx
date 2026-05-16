'use client'
// app/(admin)/admin/layout.tsx
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Spinner } from '@/components/ui/index'
import {
  LayoutDashboard, BookOpen, Users, Receipt,
  TrendingUp, LogOut, Menu, X, ChevronRight, Settings
} from 'lucide-react'
import { clsx } from 'clsx'

function AdminLogo() {
  const [err, setErr] = useState(false)
  if (err) {
    return (
      <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-brand-500/30 flex-shrink-0">
        <TrendingUp className="w-5 h-5 text-white" />
      </div>
    )
  }
  return (
    <img src="/logo.JPG" alt="1%" className="w-9 h-9 object-contain flex-shrink-0 rounded-xl"
      onError={() => setErr(true)} />
  )
}

const navItems = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/orders', label: 'Orders', icon: Receipt },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/')
    }
  }, [user, loading])

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!user || user.role !== 'admin') return null

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href)

  return (
    <div className="min-h-screen bg-dark-900 flex">
      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-dark-600 flex flex-col transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between p-5 border-b border-dark-600">
          <Link href="/admin" className="flex items-center gap-2.5">
            <AdminLogo />
            <div>
              <span className="text-white font-bold text-base leading-none block">1% Traders</span>
              <span className="text-brand-400 text-xs font-medium leading-none block mt-0.5">Admin Panel</span>
            </div>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={clsx(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                isActive(href, exact)
                  ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              )}
            >
              <Icon className={clsx('w-4.5 h-4.5 flex-shrink-0', isActive(href, exact) ? 'text-brand-400' : 'text-gray-500 group-hover:text-gray-300')} />
              {label}
              {isActive(href, exact) && <ChevronRight className="w-3.5 h-3.5 ml-auto text-brand-400" />}
            </Link>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-dark-600 space-y-2">
          <Link href="/" className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-dark-700 transition-all">
            <Settings className="w-4 h-4" /> View Site
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
          <div className="px-3 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {user.name?.[0] || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-medium truncate">{user.name}</p>
                <p className="text-gray-500 text-xs truncate">{user.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar (mobile) */}
        <header className="lg:hidden sticky top-0 z-30 bg-dark-800/90 backdrop-blur-xl border-b border-dark-600 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-white font-semibold text-sm">Admin Panel</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
